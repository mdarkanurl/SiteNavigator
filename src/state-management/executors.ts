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
        return browserController.getAllElements();
      }

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
