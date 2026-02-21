import { ParseResult } from "../parse-result";

export function parseMove(args: string[]): ParseResult {
  if (args[0] !== "back" && args[0] !== "forward") {
    return {
      success: false,
      error: "move supports two commands: move back & move forward",
    };
  }

  return {
    success: true,
    intent: { type: args[0] === "back" ? "MOVE_BACK" : "MOVE_FORWARD" },
  };
}
