import { AppState } from "./state";
import { Intent } from "../CLI/intent";
import { BrowserController } from "../core/browser-controller";
import { DispatchResult } from "./dispatch-result";

const browserController = new BrowserController();

export function executeIntent(
  intent: Intent,
  state: AppState
): Promise<DispatchResult> | DispatchResult {
  switch (intent.type) {
    case "NAVIGATE":
      state.browserStarted = true;
      state.pageLoaded = true;
      state.currentUrl = intent.payload.url;

      return browserController.navigate(intent.payload.url);

    case "SHOW":
      if(intent.payload.target === 'code') {
        return browserController.showCode(intent.payload.fileName);
      } else if(intent.payload.target === 'elements') {
        return browserController.getAllElements(intent.payload.fileName);
      }
      return { success: false, error: "Invalid SHOW target" };

    case "CLICK":
      return browserController.clickOnAButton(intent.payload.element)

    case "MOVE_BACK":
      return browserController.moveBack();

    case "MOVE_FORWARD":
      return browserController.moveForward();

    case "RELOAD":
      return browserController.reload();

    case "PRINT":
      if (intent.payload.target === "url") {
        return browserController.getCurrentUrl();
      } else if (intent.payload.target === "title") {
        return browserController.getCurrentTitle();
      }
      return { success: false, error: "Invalid PRINT target" };

    case "HELP":
      return {
        success: true,
        message: "Available commands: navigate, click, show, move back, move forward, reload, print url, print title, help, exit",
      };

    case "EXIT":
      return { success: true };

    default:
      throw new Error("Unhandled intent");
  }
}
