import { ParseResult } from "../parse-result";

export function parseFollow(args: string[]): ParseResult {
  if (args.length === 0) {
    return { success: false, error: "follow requires an href pattern" };
  }

  return {
    success: true,
    intent: {
      type: "FOLLOW",
      payload: { pattern: args.join(" ") },
    },
  };
}
