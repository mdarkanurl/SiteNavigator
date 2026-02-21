import { Locator, Page } from "playwright";
import { DispatchResult } from "../../state-management/dispatch-result";
import { writeFile } from "node:fs/promises";
import { ClickTarget, InteractiveItem } from "./types";

export class InteractionService {
  private lastInteractiveItems: InteractiveItem[] = [];

  constructor(
    private readonly getPage: () => Promise<Page>,
    private readonly openTarget: (target: string) => Promise<DispatchResult>
  ) {}

  clearCache(): void {
    this.lastInteractiveItems = [];
  }

  private normalizeFileName(fileName: string): string {
    return fileName.replace("--", "");
  }

  private static isAbsoluteHttpUrl(value: string): boolean {
    return value.startsWith("http://") || value.startsWith("https://");
  }

  private static escapeForCss(value: string): string {
    return value.replace(/\\/g, "\\\\").replace(/"/g, "\\\"");
  }

  private async collectInteractiveItems(): Promise<InteractiveItem[]> {
    const page = await this.getPage();

    const rawItems = await page.evaluate(() => {
      const cssEscape = (globalThis as any).CSS?.escape
        ? (globalThis as any).CSS.escape.bind((globalThis as any).CSS)
        : (value: string) => value.replace(/[^a-zA-Z0-9_-]/g, "");

      const toCssPath = (el: Element): string => {
        if ((el as HTMLElement).id) {
          return `#${cssEscape((el as HTMLElement).id)}`;
        }

        const parts: string[] = [];
        let current: Element | null = el;

        while (current && current.nodeType === 1 && current.tagName.toLowerCase() !== "html") {
          const tag = current.tagName.toLowerCase();
          const parentElement: Element | null = current.parentElement;
          if (!parentElement) {
            parts.unshift(tag);
            break;
          }

          const siblings = Array.from(parentElement.children as HTMLCollectionOf<Element>).filter(
            (child: Element) => child.tagName === current!.tagName
          );
          const index = siblings.indexOf(current) + 1;
          parts.unshift(`${tag}:nth-of-type(${index})`);

          current = parentElement;
        }

        return parts.join(" > ");
      };

      const interactive = document.querySelectorAll(
        "a, button, input, textarea, select, [onclick], [role='button']"
      );

      return Array.from(interactive)
        .filter((el) => {
          const element = el as HTMLElement;
          const style = window.getComputedStyle(element);
          const hiddenByStyle =
            style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0;
          return !hiddenByStyle && element.getClientRects().length > 0;
        })
        .map((el) => {
          const element = el as HTMLElement;
          const href = el.getAttribute("href");

          let resolvedHref: string | null = null;
          if (href) {
            try {
              resolvedHref = new URL(href, window.location.href).toString();
            } catch (error) {
              resolvedHref = null;
            }
          }

          return {
            tag: el.tagName.toLowerCase(),
            text: (
              element.innerText ||
              element.textContent ||
              element.getAttribute("aria-label") ||
              element.getAttribute("title") ||
              element.getAttribute("value") ||
              ""
            )
              .replace(/\s+/g, " ")
              .trim(),
            href,
            resolvedHref,
            selector: toCssPath(el),
          };
        });
    });

    return rawItems.map((item, index) => ({
      id: index,
      tag: item.tag,
      text: item.text,
      href: item.href,
      resolvedHref: item.resolvedHref,
      selector: item.selector,
    }));
  }

  private async clickLocator(locator: Locator, metadata: Record<string, unknown>): Promise<DispatchResult> {
    const page = await this.getPage();

    const count = await locator.count();
    if (count === 0) {
      return {
        success: false,
        error: "No matching interactive element was found",
      };
    }

    const target = locator.first();

    try {
      await target.scrollIntoViewIfNeeded();
      await target.waitFor({ state: "visible", timeout: 7000 });
    } catch (error) {
      return {
        success: false,
        error: "Element exists but is not visible/actionable",
      };
    }

    const oldUrl = page.url();
    const popupPromise = page.context().waitForEvent("page", { timeout: 1200 }).catch(() => null);

    try {
      await target.click({ timeout: 10000 });
    } catch (error) {
      try {
        await target.evaluate((el) => (el as HTMLElement).click());
      } catch (fallbackError) {
        return {
          success: false,
          error: "Click failed for the matched element",
        };
      }
    }

    await page.waitForLoadState("domcontentloaded", { timeout: 5000 }).catch(() => {});

    const popup = await popupPromise;
    if (popup) {
      await popup.waitForLoadState("domcontentloaded", { timeout: 5000 }).catch(() => {});
    }

    const newUrl = page.url();

    return {
      success: true,
      message: "Action successful",
      data: {
        ...metadata,
        matchedCount: count,
        navigated: oldUrl !== newUrl,
        oldUrl,
        newUrl,
        openedPopup: Boolean(popup),
        popupUrl: popup ? popup.url() : null,
      },
    };
  }

  async getAllElements(fileName: string | null): Promise<DispatchResult> {
    const elements = await this.collectInteractiveItems();

    if (fileName) {
      const finalFileName = this.normalizeFileName(fileName);
      try {
        await writeFile(`${finalFileName}.js`, JSON.stringify(elements, null, 2), "utf8");
      } catch (error) {
        return {
          success: false,
          error: "Failed to save elements to file",
        };
      }
    }

    return {
      success: true,
      message: `Extracted ${elements.length} elements`,
      data: elements,
    };
  }

  async listLinks(filter: string | null): Promise<DispatchResult> {
    const interactiveItems = await this.collectInteractiveItems();

    const filteredItems = filter
      ? interactiveItems.filter((item) => {
          const query = filter.toLowerCase();
          return (
            item.text.toLowerCase().includes(query) ||
            (item.href ?? "").toLowerCase().includes(query) ||
            (item.resolvedHref ?? "").toLowerCase().includes(query)
          );
        })
      : interactiveItems;

    this.lastInteractiveItems = filteredItems.map((item, index) => ({
      ...item,
      id: index,
    }));

    return {
      success: true,
      message: `Found ${this.lastInteractiveItems.length} interactive elements`,
      data: this.lastInteractiveItems,
    };
  }

  async follow(pattern: string): Promise<DispatchResult> {
    const interactiveItems = await this.collectInteractiveItems();
    const normalizedPattern = pattern.toLowerCase();

    const matched = interactiveItems.find(
      (item) =>
        item.tag === "a" &&
        (item.text.toLowerCase().includes(normalizedPattern) ||
          (item.href ?? "").toLowerCase().includes(normalizedPattern) ||
          (item.resolvedHref ?? "").toLowerCase().includes(normalizedPattern))
    );

    if (!matched) {
      return {
        success: false,
        error: `No link matched pattern: ${pattern}`,
      };
    }

    if (matched.resolvedHref && InteractionService.isAbsoluteHttpUrl(matched.resolvedHref)) {
      const result = await this.openTarget(matched.resolvedHref);
      if (!result.success) {
        return result;
      }

      return {
        success: true,
        message: `Followed link using pattern: ${pattern}`,
        data: { matched },
      };
    }

    const page = await this.getPage();
    return this.clickLocator(page.locator(matched.selector), {
      mode: "follow",
      pattern,
      matched,
    });
  }

  async act(id: number): Promise<DispatchResult> {
    if (this.lastInteractiveItems.length === 0) {
      return {
        success: false,
        error: "No cached element list found. Run `links` first.",
      };
    }

    const matched = this.lastInteractiveItems.find((item) => item.id === id);
    if (!matched) {
      return {
        success: false,
        error: `Element id ${id} not found. Run links again to refresh IDs.`,
      };
    }

    if (matched.resolvedHref && InteractionService.isAbsoluteHttpUrl(matched.resolvedHref)) {
      return this.openTarget(matched.resolvedHref);
    }

    const page = await this.getPage();
    return this.clickLocator(page.locator(matched.selector), {
      mode: "act",
      id,
      matched,
    });
  }

  async click(target: ClickTarget): Promise<DispatchResult> {
    const page = await this.getPage();

    if (target.mode === "selector") {
      return this.clickLocator(page.locator(target.value), {
        mode: "selector",
        value: target.value,
      });
    }

    if (target.mode === "text") {
      const locator = page
        .locator("a, button, [role='button'], input[type='button'], input[type='submit']")
        .filter({ hasText: target.value });

      return this.clickLocator(locator, {
        mode: "text",
        value: target.value,
      });
    }

    if (target.mode === "href") {
      const escaped = InteractionService.escapeForCss(target.value);
      const locator = page.locator(`a[href*="${escaped}"]`);

      return this.clickLocator(locator, {
        mode: "href",
        value: target.value,
      });
    }

    if (this.lastInteractiveItems.length === 0) {
      await this.listLinks(null);
    }

    const matched = this.lastInteractiveItems.find((item) => item.id === target.value);
    if (!matched) {
      return {
        success: false,
        error: `No element found for index ${target.value}. Run links to inspect valid IDs.`,
      };
    }

    return this.clickLocator(page.locator(matched.selector), {
      mode: "index",
      value: target.value,
      matched,
    });
  }
}
