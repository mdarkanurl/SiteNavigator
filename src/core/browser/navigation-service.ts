import playwright, { Page } from "playwright";
import { DispatchResult } from "../../state-management/dispatch-result";
import { writeFile } from "node:fs/promises";

export class NavigationService {
  constructor(private readonly getPage: () => Promise<Page>) {}

  private normalizeFileName(fileName: string): string {
    return fileName.replace("--", "");
  }

  private static isAbsoluteHttpUrl(value: string): boolean {
    return value.startsWith("http://") || value.startsWith("https://");
  }

  async navigate(url: string): Promise<DispatchResult> {
    const page = await this.getPage();
    let res: playwright.Response | null = null;

    try {
      res = await page.goto(url, { waitUntil: "domcontentloaded" });
    } catch (error) {
      return {
        success: false,
        error: `Failed to navigate to ${url}`,
      };
    }

    if (!res) {
      return {
        success: false,
        error: `Failed to navigate to ${url}`,
      };
    }

    const isFinished = await res.finished();
    if (isFinished) {
      return {
        success: false,
        error: `Failed to navigate to ${url}. Here's the error: ${isFinished}`,
      };
    }

    if (!res.ok()) {
      return {
        success: false,
        error: "Website response was not successful",
      };
    }

    return {
      success: true,
      message: `Navigate to ${url}`,
    };
  }

  async open(target: string): Promise<DispatchResult> {
    const page = await this.getPage();
    const trimmedTarget = target.trim();

    let finalUrl = trimmedTarget;

    if (!NavigationService.isAbsoluteHttpUrl(trimmedTarget)) {
      const currentUrl = page.url();
      if (!currentUrl || currentUrl === "about:blank") {
        return {
          success: false,
          error: "Cannot resolve relative path before loading a page. Use navigate first.",
        };
      }

      try {
        finalUrl = new URL(trimmedTarget, currentUrl).toString();
      } catch (error) {
        return {
          success: false,
          error: `Failed to resolve target path: ${trimmedTarget}`,
        };
      }
    }

    return this.navigate(finalUrl);
  }

  async showCode(fileName: string): Promise<DispatchResult> {
    const page = await this.getPage();
    const res = await page.content();
    const finalFileName = this.normalizeFileName(fileName);

    try {
      await writeFile(`${finalFileName}.html`, res, "utf8");
    } catch (error) {
      return {
        success: false,
        error: "Failed to save HTML to file",
      };
    }

    return {
      success: true,
      message: `Check ${finalFileName}.html, you'll find code there.`,
    };
  }

  async moveBack(): Promise<DispatchResult> {
    const page = await this.getPage();
    const res = await page.goBack();

    if (!res) {
      return {
        success: false,
        error: "Cannot move back from the current page",
      };
    }

    return {
      success: true,
      message: "Moved back successfully",
    };
  }

  async moveForward(): Promise<DispatchResult> {
    const page = await this.getPage();
    const res = await page.goForward();

    if (!res) {
      return {
        success: false,
        error: "Cannot move forward from the current page",
      };
    }

    return {
      success: true,
      message: "Moved forward successfully",
    };
  }

  async reload(): Promise<DispatchResult> {
    const page = await this.getPage();
    let res: playwright.Response | null = null;

    try {
      res = await page.reload();
    } catch (error) {
      return {
        success: false,
        error: "Failed to reload the current page",
      };
    }

    if (!res) {
      return {
        success: false,
        error: "Failed to reload the current page",
      };
    }

    const isFinished = await res.finished();
    if (isFinished) {
      return {
        success: false,
        error: `Failed to reload the current page. Here's the error: ${isFinished}`,
      };
    }

    if (!res.ok()) {
      return {
        success: false,
        error: "Website response was not successful",
      };
    }

    return {
      success: true,
      message: "Reloaded current page successfully",
    };
  }

  async getCurrentUrl(): Promise<DispatchResult> {
    const page = await this.getPage();

    return {
      success: true,
      message: "Current URL",
      data: page.url(),
    };
  }

  async getCurrentTitle(): Promise<DispatchResult> {
    const page = await this.getPage();

    return {
      success: true,
      message: "Current title",
      data: await page.title(),
    };
  }

  async screenshot(fileName: string): Promise<DispatchResult> {
    const page = await this.getPage();
    const finalFileName = this.normalizeFileName(fileName);

    try {
      await page.screenshot({ path: `${finalFileName}.png` });
    } catch (error) {
      return {
        success: false,
        error: "Failed to take screenshot",
      };
    }

    return {
      success: true,
      message: `Screenshot saved to ${finalFileName}.png`,
    };
  }
}
