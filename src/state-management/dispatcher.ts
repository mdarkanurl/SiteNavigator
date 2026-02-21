import { Intent } from "../CLI/intent";
import { AppState } from "./state";
import { DispatchResult } from "./dispatch-result";
import { executeIntent } from "./executors";

export function dispatchIntent(
  intent: Intent,
  state: AppState
): Promise<DispatchResult> | DispatchResult {
  switch (intent.type) {
    case "SHOW":
    case "CLICK":
    case "LINKS":
    case "FOLLOW":
    case "ACT":
    case "WAIT":
    case "MOVE_BACK":
    case "MOVE_FORWARD":
    case "RELOAD":
    case "PRINT":
    case "SCREENSHOT":
      if (!state.pageLoaded) {
        return {
          success: false,
          error: "No page loaded. Use 'navigate <url>' first.",
        };
      }
      break;
  }

  // If allowed, execute
  return executeIntent(intent, state);
}
