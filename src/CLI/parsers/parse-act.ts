import { ParseResult } from "../parse-result";

export function parseAct(args: string[]): ParseResult {
  if (!args[0]) {
    return { success: false, error: "act requires an element id from links output" };
  }

  const id = Number(args[0]);
  if (!Number.isInteger(id) || id < 0) {
    return { success: false, error: "act id must be a non-negative integer" };
  }

  return {
    success: true,
    intent: {
      type: "ACT",
      payload: { id },
    },
  };
}
