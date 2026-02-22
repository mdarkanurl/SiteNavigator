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
      return browserController.navigate(intent.payload.url).then((result) => {
        if (result.success) {
          state.browserStarted = true;
          state.pageLoaded = true;
          state.currentUrl = intent.payload.url;
        }
        return result;
      });

    case "OPEN":
      return browserController.open(intent.payload.target).then((result) => {
        if (result.success) {
          state.browserStarted = true;
          state.pageLoaded = true;
        }
        return result;
      });

    case "SHOW":
      if (intent.payload.target === "code") {
        return browserController.showCode(intent.payload.fileName);
      } else if (intent.payload.target === "elements") {
        return browserController.getAllElements(intent.payload.fileName);
      }
      return { success: false, error: "Invalid SHOW target" };

    case "INPUT":
      return browserController.input(intent.payload.fields, intent.payload.submitText);

    case "CLICK":
      return browserController.click(intent.payload.target);

    case "LINKS":
      return browserController.listLinks(intent.payload.filter);

    case "FOLLOW":
      return browserController.follow(intent.payload.pattern);

    case "ACT":
      return browserController.act(intent.payload.id);

    case "WAIT":
      return browserController.wait(intent.payload.target);

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

    case "SCREENSHOT":
      return browserController.screenshot(intent.payload.fileName);

    case "HELP":
      return {
        success: true,
        message: "Available commands: navigate, open, show, input, links, follow, act, wait, click, move back, move forward, reload, print url, print title, screenshot, help, exit",
      };

    case "EXIT":
      return { success: true };

    default:
      throw new Error("Unhandled intent");
  }
}
