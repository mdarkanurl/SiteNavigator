import { Locator, Page } from "playwright";
import { FillableField, InteractiveItem } from "./types";

export function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

export function isAbsoluteHttpUrl(value: string): boolean {
  return value.startsWith("http://") || value.startsWith("https://");
}

export function escapeForCss(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, "\\\"");
}

export async function collectFillableFields(page: Page): Promise<FillableField[]> {
  return page.evaluate(() => {
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

    const controls = Array.from(document.querySelectorAll("input, textarea, select"))
      .filter((el) => {
        const input = el as HTMLInputElement;
        if (input.disabled) return false;
        if (input.type === "hidden") return false;

        const element = el as HTMLElement;
        const style = window.getComputedStyle(element);
        const hiddenByStyle =
          style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0;

        return !hiddenByStyle && element.getClientRects().length > 0;
      })
      .map((el) => {
        const input = el as HTMLInputElement;
        const id = input.id || "";
        const labelsByFor = id
          ? Array.from(document.querySelectorAll(`label[for="${cssEscape(id)}"]`)).map((l) =>
              ((l as HTMLElement).innerText || l.textContent || "").trim()
            )
          : [];

        const wrappedLabel = input.closest("label");
        const wrappedLabelText = wrappedLabel
          ? ((wrappedLabel as HTMLElement).innerText || wrappedLabel.textContent || "").trim()
          : "";

        const candidates = [
          ...labelsByFor,
          wrappedLabelText,
          input.getAttribute("aria-label") || "",
          input.getAttribute("placeholder") || "",
          input.getAttribute("name") || "",
          input.id || "",
        ]
          .map((value) => value.replace(/\s+/g, " ").trim())
          .filter(Boolean);

        return {
          selector: toCssPath(el),
          tag: el.tagName.toLowerCase(),
          type: input.type || null,
          candidates,
        };
      });

    return controls;
  });
}

export function findFieldByName(fields: FillableField[], fieldName: string): FillableField | null {
  const wanted = normalizeText(fieldName);
  if (!wanted) {
    return null;
  }

  const exact = fields.find((field) =>
    field.candidates.some((candidate) => normalizeText(candidate) === wanted)
  );
  if (exact) {
    return exact;
  }

  return (
    fields.find((field) =>
      field.candidates.some((candidate) => {
        const normalizedCandidate = normalizeText(candidate);
        return normalizedCandidate.includes(wanted) || wanted.includes(normalizedCandidate);
      })
    ) ?? null
  );
}

export async function fillByLocator(locator: Locator, value: string): Promise<boolean> {
  const count = await locator.count();
  if (count === 0) {
    return false;
  }

  const target = locator.first();

  try {
    await target.scrollIntoViewIfNeeded();
    await target.waitFor({ state: "visible", timeout: 7000 });

    const tag = await target.evaluate((el) => el.tagName.toLowerCase());

    if (tag === "select") {
      await target.selectOption({ label: value }).catch(async () => {
        await target.selectOption({ value });
      });
    } else if (tag === "input" || tag === "textarea") {
      await target.fill(value);
    } else {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

export async function collectInteractiveItems(page: Page): Promise<InteractiveItem[]> {
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
