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

  const pairs = args.slice(0, -1);
  if (pairs.length % 2 !== 0) {
    return {
      success: false,
      error: "input format: input <field> <value> ... <submit button text>",
    };
  }

  const fields: Array<{ name: string; value: string }> = [];
  for (let i = 0; i < pairs.length; i += 2) {
    const name = pairs[i];
    const value = pairs[i + 1];

    if (!name) {
      return {
        success: false,
        error: "field name cannot be empty",
      };
    }

    fields.push({ name, value });
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
