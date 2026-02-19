import { ParseResult } from "./parse-result";
import { Intent } from "./intent";
import { Url, URL } from "url";

export function parseInput(line: string): ParseResult {
  const trimmed = line.trim();

  if (!trimmed) {
    return {
        success: false,
        error: "Empty command"
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
            error: "Invalid URL protocol. Only http and https are allowed." 
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
        if(!args[1]) {
          return {
            success: false,
            error: "show needs a file name where code will store"
          };
        }

        if(!args[1].startsWith('--')) {
          return {
            success: false,
            error: "file name must starts with --"
          };
        }

        return {
          success: true,
          intent: {
            type: "SHOW",
            payload: { target: "code", fileName: args[1] },
          },
        };
      } else if(args[0] === "elements") {
        return {
          success: true,
          intent: {
            type: "SHOW",
            payload: { target: "elements", },
          },
        };
      } else {
        return {
          success: false,
          error: "show supports only: show code --fileName"
        };
      }
    }

    case "help":
      return {
        success: true,
        intent: { type: "HELP" }
      };

    case "exit":
      return {
        success: true,
        intent: { type: "EXIT" }
      };

    default:
      return {
        success: false,
        error: `Unknown command: ${command}`
      };
  }
}
