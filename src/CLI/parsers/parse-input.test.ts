import { parseInput } from "./parse-input";

describe("parseInput", () => {
  test("returns INPUT intent for text field/value pair", () => {
    expect(parseInput(["email", "user@example.com", "Sign in"])).toEqual({
      success: true,
      intent: {
        type: "INPUT",
        payload: {
          fields: [
            {
              target: { mode: "text", value: "email" },
              value: "user@example.com",
            },
          ],
          submitText: "Sign in",
        },
      },
    });
  });

  test("returns INPUT intent for --selector field/value pair", () => {
    expect(parseInput(["--selector", "#email", "user@example.com", "Continue"])).toEqual({
      success: true,
      intent: {
        type: "INPUT",
        payload: {
          fields: [
            {
              target: { mode: "selector", value: "#email" },
              value: "user@example.com",
            },
          ],
          submitText: "Continue",
        },
      },
    });
  });

  test("returns INPUT intent for --index field/value pair", () => {
    expect(parseInput(["--index", "2", "value", "Submit"])).toEqual({
      success: true,
      intent: {
        type: "INPUT",
        payload: {
          fields: [
            {
              target: { mode: "index", value: 2 },
              value: "value",
            },
          ],
          submitText: "Submit",
        },
      },
    });
  });

  test("returns INPUT intent for --text field/value pair", () => {
    expect(parseInput(["--text", "Email", "user@example.com", "Submit"])).toEqual({
      success: true,
      intent: {
        type: "INPUT",
        payload: {
          fields: [
            {
              target: { mode: "text", value: "Email" },
              value: "user@example.com",
            },
          ],
          submitText: "Submit",
        },
      },
    });
  });

  test("returns error when args are missing", () => {
    expect(parseInput(["field", "value"])).toEqual({
      success: false,
      error: "input requires at least one field/value pair and submit text",
    });
  });

  test("returns error for invalid --selector format", () => {
    expect(parseInput(["--selector", "#email", "Submit"])).toEqual({
      success: false,
      error: "input --selector requires: --selector <css> <value>",
    });
  });

  test("returns error for invalid --index format", () => {
    expect(parseInput(["--index", "1", "Submit"])).toEqual({
      success: false,
      error: "input --index requires: --index <id> <value>",
    });
  });

  test("returns error for invalid --index id", () => {
    expect(parseInput(["--index", "-1", "value", "Submit"])).toEqual({
      success: false,
      error: "input --index <id> expects a non-negative integer id",
    });
  });

  test("returns error for invalid --text format", () => {
    expect(parseInput(["--text", "Email", "Submit"])).toEqual({
      success: false,
      error: "input --text requires: --text <field text> <value>",
    });
  });

  test("returns error for dangling field token", () => {
    expect(parseInput(["Email", "Submit", ""])).toEqual({
      success: false,
      error: "submit button text cannot be empty",
    });
  });
});
