import { Locator, Page } from "playwright";
import { DispatchResult } from "../../state-management/dispatch-result";
import { writeFile } from "node:fs/promises";
import { ClickTarget, InputField, InputFieldTarget, InteractiveItem, WaitTarget } from "./types";
import {
  collectFillableFields,
  collectInteractiveItems,
  escapeForCss,
  fillByLocator,
  findFieldByName,
  isAbsoluteHttpUrl,
  normalizeText,
} from "./interaction-helpers";

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

  private async resolveFieldLocator(target: InputFieldTarget): Promise<Locator | null> {
    const page = await this.getPage();

    if (target.mode === "selector") {
      return page.locator(target.value).first();
    }

    if (target.mode === "index") {
      if (this.lastInteractiveItems.length === 0) {
        await this.listLinks(null);
      }

      const matched = this.lastInteractiveItems.find((item) => item.id === target.value);
      if (!matched) {
        return null;
      }

      return page.locator(matched.selector).first();
    }

    const fillableFields = await collectFillableFields(page);
    const matched = findFieldByName(fillableFields, target.value);
    if (!matched) {
      return null;
    }

    return page.locator(matched.selector).first();
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
    const page = await this.getPage();
    const elements = await collectInteractiveItems(page);

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
    const page = await this.getPage();
    const interactiveItems = await collectInteractiveItems(page);

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
    const page = await this.getPage();
    const interactiveItems = await collectInteractiveItems(page);
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

    if (matched.resolvedHref && isAbsoluteHttpUrl(matched.resolvedHref)) {
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

    if (matched.resolvedHref && isAbsoluteHttpUrl(matched.resolvedHref)) {
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
      const escaped = escapeForCss(target.value);
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

  async wait(target: WaitTarget): Promise<DispatchResult> {
    const page = await this.getPage();
    const startedAt = Date.now();

    try {
      if (target.mode === "url") {
        const expected = target.pattern.toLowerCase();
        await page.waitForFunction(
          (needle) => window.location.href.toLowerCase().includes(needle),
          expected,
          { timeout: target.timeoutMs }
        );

        return {
          success: true,
          message: `Waited for URL pattern: ${target.pattern}`,
          data: {
            mode: target.mode,
            pattern: target.pattern,
            timeoutMs: target.timeoutMs,
            elapsedMs: Date.now() - startedAt,
            currentUrl: page.url(),
          },
        };
      }

      const locator = page.locator(target.selector);
      await locator.first().waitFor({
        state: target.state,
        timeout: target.timeoutMs,
      });

      return {
        success: true,
        message: `Waited for selector: ${target.selector}`,
        data: {
          mode: target.mode,
          selector: target.selector,
          state: target.state,
          timeoutMs: target.timeoutMs,
          elapsedMs: Date.now() - startedAt,
          matchedCount: await locator.count(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Wait failed for ${target.mode}. Timeout: ${target.timeoutMs}ms`,
      };
    }
  }

  async input(
    fields: InputField[],
    submitText: string
  ): Promise<DispatchResult> {
    const page = await this.getPage();

    for (const field of fields) {
      const locator = await this.resolveFieldLocator(field.target);
      if (!locator) {
        return {
          success: false,
          error: `No input field found for target: ${field.target.mode} ${String(field.target.value)}`,
        };
      }

      const filled = await fillByLocator(locator, field.value);
      if (!filled) {
        return {
          success: false,
          error: `Failed to set value for target: ${field.target.mode} ${String(field.target.value)}`,
        };
      }
    }

    const interactiveItems = await collectInteractiveItems(page);
    const normalizedSubmitText = normalizeText(submitText);

    const matchedSubmit = interactiveItems.find((item) => {
      if (
        item.tag !== "button" &&
        item.tag !== "input" &&
        item.tag !== "a" &&
        item.tag !== "div"
      ) {
        return false;
      }

      const text = normalizeText(item.text);
      return text.includes(normalizedSubmitText) || normalizedSubmitText.includes(text);
    });

    if (!matchedSubmit) {
      return {
        success: false,
        error: `No submit button found with text: ${submitText}`,
      };
    }

    return this.clickLocator(page.locator(matchedSubmit.selector), {
      mode: "input",
      fields,
      submitText,
      matchedSubmit,
    });
  }
}
