import { URL } from "url";
import { ParseResult } from "../parse-result";

export function parseNavigate(args: string[]): ParseResult {
  if (args.length === 0) {
    return { success: false, error: "navigate requires a URL" };
  }

  let url: URL;
  try {
    url = new URL(args[0]);
  } catch (error) {
    return { success: false, error: "Invalid URL" };
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return {
      success: false,
      error: "Invalid URL protocol. Only http and https are allowed.",
    };
  }

  return {
    success: true,
    intent: {
      type: "NAVIGATE",
      payload: { url: url.toString() },
    },
  };
}
