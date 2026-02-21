import { ParseResult } from "../parse-result";

export function parsePrint(args: string[]): ParseResult {
  if (args[0] !== "url" && args[0] !== "title") {
    return {
      success: false,
      error: "print supports two commands: print url & print title",
    };
  }

  return {
    success: true,
    intent: {
      type: "PRINT",
      payload: { target: args[0] === "url" ? "url" : "title" },
    },
  };
}
