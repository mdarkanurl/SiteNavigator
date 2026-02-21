import { ParseResult } from "../parse-result";

export function parseLinks(args: string[]): ParseResult {
  if (args.length === 0) {
    return {
      success: true,
      intent: {
        type: "LINKS",
        payload: { filter: null },
      },
    };
  }

  if (args[0] === "--filter") {
    const filter = args.slice(1).join(" ").trim();
    if (!filter) {
      return { success: false, error: "--filter needs a value" };
    }

    return {
      success: true,
      intent: {
        type: "LINKS",
        payload: { filter },
      },
    };
  }

  return {
    success: true,
    intent: {
      type: "LINKS",
      payload: { filter: args.join(" ") },
    },
  };
}
