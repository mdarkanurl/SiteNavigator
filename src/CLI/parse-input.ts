import { ParseResult } from "./parse-result";
import { URL } from "url";

export function parseInput(line: string): ParseResult {
  const trimmed = line.trim();

  if (!trimmed) {
    return {
      success: false,
      error: "Empty command",
    };
  }

  const tokens = trimmed.split(" ");
  const command = tokens[0];
  const args = tokens.slice(1);

  switch (command) {
    case "navigate": {
      if (args.length === 0) {
        return { success: false, error: "navigate requires a URL" };
      }

      let url: URL;
      try {
        url = new URL(args[0]);
      } catch (error) {
        return { success: false, error: "Invalid URL" };
      }

      if (url.protocol !== "http:"
        && url.protocol !== "https:") {
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

    case "show": {
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
      } else if (args[0] === "elements") {

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
      } else {
        return {
          success: false,
          error: "show supports two commands: show code --fileName & show elements",
        };
      }
    }

    case "click": {
      if (!args[0]) {
        return {
          success: false,
          error: "To click somewhere, you need to pass a selector",
        };
      }

      return {
        success: true,
        intent: {
          type: "CLICK",
          payload: { target: "click", element: args[0] },
        },
      };
    }

    case "move": {
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

    case "reload":
      return {
        success: true,
        intent: { type: "RELOAD" },
      };

    case "print": {
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

    case "screenshot": {
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

    case "help":
      return {
        success: true,
        intent: { type: "HELP" },
      };

    case "exit":
      return {
        success: true,
        intent: { type: "EXIT" },
      };

    default:
      return {
        success: false,
        error: `Unknown command: ${command}`,
      };
  }
}
