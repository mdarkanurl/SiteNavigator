import { AppState } from "./state";
import { Intent } from "../CLI/intent";

export function executeIntent(
  intent: Intent,
  state: AppState
): { success: true; message?: string } {
  switch (intent.type) {
    case "NAVIGATE":
      state.browserStarted = true;
      state.pageLoaded = true;
      state.currentUrl = intent.payload.url;

      return {
        success: true,
        message: `Navigated to ${intent.payload.url}`,
      };

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

    case "SHOW":
      return {
        success: true,
        message: `Showing page ${intent.payload.target}`,
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
