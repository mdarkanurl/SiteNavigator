import { URL } from "url";
import { ParseResult } from "../parse-result";

export function parseOpen(args: string[]): ParseResult {
  if (args.length === 0) {
    return { success: false, error: "open requires a URL or relative path" };
  }

  const target = args.join(" ");

  if (target.startsWith("http://") || target.startsWith("https://")) {
    try {
      const absoluteUrl = new URL(target);
      if (absoluteUrl.protocol !== "http:" && absoluteUrl.protocol !== "https:") {
        return {
          success: false,
          error: "Invalid URL protocol. Only http and https are allowed.",
        };
      }
    } catch (error) {
      return { success: false, error: "Invalid absolute URL" };
    }
  }

  return {
    success: true,
    intent: {
      type: "OPEN",
      payload: { target },
    },
  };
}
