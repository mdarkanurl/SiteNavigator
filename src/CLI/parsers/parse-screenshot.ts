import { ParseResult } from "../parse-result";

export function parseScreenshot(args: string[]): ParseResult {
  if (!args[0]) {
    return {
      success: false,
      error: "screenshot needs a file name where image will be stored",
    };
  }

  if (!args[0].startsWith("--")) {
    return {
      success: false,
      error: "file name must start with --",
    };
  }

  return {
    success: true,
    intent: {
      type: "SCREENSHOT",
      payload: { fileName: args[0] },
    },
  };
}
