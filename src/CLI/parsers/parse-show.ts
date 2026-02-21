import { ParseResult } from "../parse-result";

export function parseShow(args: string[]): ParseResult {
  if (args[0] === "code") {
    if (!args[1]) {
      return {
        success: false,
        error: "show needs a file name where code will be stored",
      };
    }

    if (!args[1].startsWith("--")) {
      return {
        success: false,
        error: "file name must start with --",
      };
    }

    return {
      success: true,
      intent: {
        type: "SHOW",
        payload: { target: "code", fileName: args[1] },
      },
    };
  }

  if (args[0] === "elements") {
    if (args[1] && !args[1].startsWith("--")) {
      return {
        success: false,
        error: "file name must start with --",
      };
    }

    return {
      success: true,
      intent: {
        type: "SHOW",
        payload: { target: "elements", fileName: args[1] ?? null },
      },
    };
  }

  return {
    success: false,
    error: "show supports two commands: show code --fileName & show elements",
  };
}
