import { ParseResult } from "../parse-result";

export function parseInput(args: string[]): ParseResult {
  if (args.length < 3) {
    return {
      success: false,
      error: "input requires at least one field/value pair and submit text",
    };
  }

  const submitText = args[args.length - 1]?.trim();
  if (!submitText) {
    return {
      success: false,
      error: "submit button text cannot be empty",
    };
  }

  const fieldTokens = args.slice(0, -1);

  const fields: Array<{
    target:
      | { mode: "text"; value: string }
      | { mode: "selector"; value: string }
      | { mode: "index"; value: number };
    value: string;
  }> = [];

  for (let i = 0; i < fieldTokens.length; ) {
    const token = fieldTokens[i];

    if (!token) {
      return {
        success: false,
        error: "input format: input <field> <value> ... <submit button text>",
      };
    }

    if (token === "--selector") {
      const selector = fieldTokens[i + 1];
      const value = fieldTokens[i + 2];

      if (!selector || value === undefined) {
        return {
          success: false,
          error: "input --selector requires: --selector <css> <value>",
        };
      }

      fields.push({
        target: { mode: "selector", value: selector },
        value,
      });

      i += 3;
      continue;
    }

    if (token === "--index") {
      const rawIndex = fieldTokens[i + 1];
      const value = fieldTokens[i + 2];

      if (!rawIndex || value === undefined) {
        return {
          success: false,
          error: "input --index requires: --index <id> <value>",
        };
      }

      const parsedIndex = Number(rawIndex);
      if (!Number.isInteger(parsedIndex) || parsedIndex < 0) {
        return {
          success: false,
          error: "input --index <id> expects a non-negative integer id",
        };
      }

      fields.push({
        target: { mode: "index", value: parsedIndex },
        value,
      });

      i += 3;
      continue;
    }

    if (token === "--text") {
      const text = fieldTokens[i + 1];
      const value = fieldTokens[i + 2];

      if (!text || value === undefined) {
        return {
          success: false,
          error: "input --text requires: --text <field text> <value>",
        };
      }

      fields.push({
        target: { mode: "text", value: text },
        value,
      });

      i += 3;
      continue;
    }

    const value = fieldTokens[i + 1];
    if (value === undefined) {
      return {
        success: false,
        error: "input format: input <field> <value> ... <submit button text>",
      };
    }

    fields.push({
      target: { mode: "text", value: token },
      value,
    });

    i += 2;
  }

  if (fields.length === 0) {
    return {
      success: false,
      error: "input requires at least one field/value pair before submit text",
    };
  }

  return {
    success: true,
    intent: {
      type: "INPUT",
      payload: {
        fields,
        submitText,
      },
    },
  };
}
