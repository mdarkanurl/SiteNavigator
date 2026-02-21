import { ParseResult } from "../parse-result";

export function parseClick(args: string[]): ParseResult {
  if (!args[0]) {
    return {
      success: false,
      error: "click needs a selector or one of --selector --text --href --index",
    };
  }

  if (args[0] === "--selector") {
    const value = args.slice(1).join(" ").trim();
    if (!value) {
      return { success: false, error: "--selector needs a value" };
    }

    return {
      success: true,
      intent: {
        type: "CLICK",
        payload: { target: { mode: "selector", value } },
      },
    };
  }

  if (args[0] === "--text") {
    const value = args.slice(1).join(" ").trim();
    if (!value) {
      return { success: false, error: "--text needs a value" };
    }

    return {
      success: true,
      intent: {
        type: "CLICK",
        payload: { target: { mode: "text", value } },
      },
    };
  }

  if (args[0] === "--href") {
    const value = args.slice(1).join(" ").trim();
    if (!value) {
      return { success: false, error: "--href needs a value" };
    }

    return {
      success: true,
      intent: {
        type: "CLICK",
        payload: { target: { mode: "href", value } },
      },
    };
  }

  if (args[0] === "--index") {
    const raw = args[1];
    if (!raw) {
      return { success: false, error: "--index needs a numeric value" };
    }

    const value = Number(raw);
    if (!Number.isInteger(value) || value < 0) {
      return { success: false, error: "--index must be a non-negative integer" };
    }

    return {
      success: true,
      intent: {
        type: "CLICK",
        payload: { target: { mode: "index", value } },
      },
    };
  }

  if (args[0].startsWith("--")) {
    return {
      success: false,
      error: "Unknown click mode. Use --selector --text --href or --index",
    };
  }

  return {
    success: true,
    intent: {
      type: "CLICK",
      payload: { target: { mode: "selector", value: args.join(" ") } },
    },
  };
}
