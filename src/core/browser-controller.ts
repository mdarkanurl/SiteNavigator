import { Page } from "playwright";
import { DispatchResult } from "../state-management/dispatch-result";
import { browserPool } from "./browser/browser-pool";
import { NavigationService } from "./browser/navigation-service";
import { InteractionService } from "./browser/interaction-service";
import { ClickTarget, InputField, WaitTarget } from "./browser/types";

export class BrowserController {
  private page: Page | null = null;
  private initializing: Promise<void> | null = null;

  private readonly navigationService = new NavigationService(() => this.ensurePage());
  private readonly interactionService = new InteractionService(
    () => this.ensurePage(),
    (target: string) => this.navigationService.open(target)
  );

  async init(): Promise<void> {
    if (this.page) return;

    if (!this.initializing) {
      this.initializing = (async () => {
        this.page = await browserPool.newPage();
      })();
    }

    await this.initializing;
  }

  private async ensurePage(): Promise<Page> {
    if (!this.page) {
      await this.init();
    }

    if (!this.page) {
      throw new Error("Failed to initialize page");
    }

    return this.page;
  }

  async navigate(url: string): Promise<DispatchResult> {
    return this.navigationService.navigate(url);
  }

  async open(target: string): Promise<DispatchResult> {
    return this.navigationService.open(target);
  }

  async showCode(fileName: string): Promise<DispatchResult> {
    return this.navigationService.showCode(fileName);
  }

  async getAllElements(fileName: string | null): Promise<DispatchResult> {
    return this.interactionService.getAllElements(fileName);
  }

  async input(
    fields: InputField[],
    submitText: string
  ): Promise<DispatchResult> {
    return this.interactionService.input(fields, submitText);
  }

  async listLinks(filter: string | null): Promise<DispatchResult> {
    return this.interactionService.listLinks(filter);
  }

  async follow(pattern: string): Promise<DispatchResult> {
    return this.interactionService.follow(pattern);
  }

  async act(id: number): Promise<DispatchResult> {
    return this.interactionService.act(id);
  }

  async click(target: ClickTarget): Promise<DispatchResult> {
    return this.interactionService.click(target);
  }

  async wait(target: WaitTarget): Promise<DispatchResult> {
    return this.interactionService.wait(target);
  }

  async moveBack(): Promise<DispatchResult> {
    return this.navigationService.moveBack();
  }

  async moveForward(): Promise<DispatchResult> {
    return this.navigationService.moveForward();
  }

  async reload(): Promise<DispatchResult> {
    return this.navigationService.reload();
  }

  async getCurrentUrl(): Promise<DispatchResult> {
    return this.navigationService.getCurrentUrl();
  }

  async getCurrentTitle(): Promise<DispatchResult> {
    return this.navigationService.getCurrentTitle();
  }

  async screenshot(fileName: string): Promise<DispatchResult> {
    return this.navigationService.screenshot(fileName);
  }

  async close(): Promise<void> {
    if (this.page) {
      await this.page.close();
      this.page = null;
      this.initializing = null;
      this.interactionService.clearCache();
    }
  }
}
