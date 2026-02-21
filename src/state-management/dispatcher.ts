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
    case "MOVE_BACK":
    case "MOVE_FORWARD":
    case "RELOAD":
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
