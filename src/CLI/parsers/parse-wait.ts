import { ParseResult } from "../parse-result";

const VALID_SELECTOR_STATES = new Set(["attached", "detached", "visible", "hidden"]);
const DEFAULT_TIMEOUT_MS = 10000;

function parseTimeout(raw: string | undefined): number | null {
  if (!raw) {
    return null;
  }

  const timeout = Number(raw);
  if (!Number.isInteger(timeout) || timeout <= 0) {
    return null;
  }

  return timeout;
}

export function parseWait(args: string[]): ParseResult {
  if (!args[0]) {
    return {
      success: false,
      error: "wait requires a target: wait url <pattern> | wait selector <css>",
    };
  }

  if (args[0] === "url") {
    const pattern = args[1];
    if (!pattern) {
      return {
        success: false,
        error: "wait url requires a URL pattern",
      };
    }

    let timeoutMs = DEFAULT_TIMEOUT_MS;

    for (let i = 2; i < args.length; i++) {
      const arg = args[i];

      if (arg === "--timeout") {
        const parsedTimeout = parseTimeout(args[i + 1]);
        if (parsedTimeout === null) {
          return {
            success: false,
            error: "--timeout must be a positive integer in milliseconds",
          };
        }

        timeoutMs = parsedTimeout;
        i += 1;
        continue;
      }

      return {
        success: false,
        error: `Unknown wait url option: ${arg}`,
      };
    }

    return {
      success: true,
      intent: {
        type: "WAIT",
        payload: {
          target: {
            mode: "url",
            pattern,
            timeoutMs,
          },
        },
      },
    };
  }

  if (args[0] === "selector") {
    const selector = args[1];
    if (!selector) {
      return {
        success: false,
        error: "wait selector requires a CSS selector",
      };
    }

    let state: "attached" | "detached" | "visible" | "hidden" = "visible";
    let timeoutMs = DEFAULT_TIMEOUT_MS;

    for (let i = 2; i < args.length; i++) {
      const arg = args[i];

      if (arg === "--state") {
        const candidate = args[i + 1];
        if (!candidate || !VALID_SELECTOR_STATES.has(candidate)) {
          return {
            success: false,
            error: "--state must be one of: attached, detached, visible, hidden",
          };
        }

        state = candidate as "attached" | "detached" | "visible" | "hidden";
        i += 1;
        continue;
      }

      if (arg === "--timeout") {
        const parsedTimeout = parseTimeout(args[i + 1]);
        if (parsedTimeout === null) {
          return {
            success: false,
            error: "--timeout must be a positive integer in milliseconds",
          };
        }

        timeoutMs = parsedTimeout;
        i += 1;
        continue;
      }

      return {
        success: false,
        error: `Unknown wait selector option: ${arg}`,
      };
    }

    return {
      success: true,
      intent: {
        type: "WAIT",
        payload: {
          target: {
            mode: "selector",
            selector,
            state,
            timeoutMs,
          },
        },
      },
    };
  }

  return {
    success: false,
    error: "wait supports: wait url <pattern> | wait selector <css>",
  };
}
