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
      return browserController.showCode(intent.payload.fileName);

    case "CAPTURE":
      return {
        success: true,
        message: `Captured selector: ${intent.payload.selector}`,
      };

    case "CLICK":
      return {
        success: true,
        message: `Clicked selector: ${intent.payload.selector}`,
      };

    case "HELP":
      return {
        success: true,
        message: "Available commands: navigate, capture, click, show, help, exit",
      };

    case "EXIT":
      return { success: true };

    default:
      throw new Error("Unhandled intent");
  }
}
