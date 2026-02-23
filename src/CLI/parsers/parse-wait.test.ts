import { parseWait } from "./parse-wait";

describe("parseWait", () => {
  test("returns WAIT intent for url with default timeout", () => {
    expect(parseWait(["url", "checkout"])).toEqual({
      success: true,
      intent: {
        type: "WAIT",
        payload: {
          target: {
            mode: "url",
            pattern: "checkout",
            timeoutMs: 10000,
          },
        },
      },
    });
  });

  test("returns WAIT intent for url with timeout", () => {
    expect(parseWait(["url", "checkout", "--timeout", "5000"])).toEqual({
      success: true,
      intent: {
        type: "WAIT",
        payload: {
          target: {
            mode: "url",
            pattern: "checkout",
            timeoutMs: 5000,
          },
        },
      },
    });
  });

  test("returns WAIT intent for selector with defaults", () => {
    expect(parseWait(["selector", "#modal"])).toEqual({
      success: true,
      intent: {
        type: "WAIT",
        payload: {
          target: {
            mode: "selector",
            selector: "#modal",
            state: "visible",
            timeoutMs: 10000,
          },
        },
      },
    });
  });

  test("returns WAIT intent for selector with state and timeout", () => {
    expect(parseWait(["selector", "#modal", "--state", "hidden", "--timeout", "4000"])).toEqual({
      success: true,
      intent: {
        type: "WAIT",
        payload: {
          target: {
            mode: "selector",
            selector: "#modal",
            state: "hidden",
            timeoutMs: 4000,
          },
        },
      },
    });
  });

  test("returns error when wait target is missing", () => {
    expect(parseWait([])).toEqual({
      success: false,
      error: "wait requires a target: wait url <pattern> | wait selector <css>",
    });
  });

  test("returns error when wait url pattern is missing", () => {
    expect(parseWait(["url"])).toEqual({
      success: false,
      error: "wait url requires a URL pattern",
    });
  });

  test("returns error for invalid timeout", () => {
    expect(parseWait(["url", "checkout", "--timeout", "0"])).toEqual({
      success: false,
      error: "--timeout must be a positive integer in milliseconds",
    });
  });

  test("returns error for unknown wait url option", () => {
    expect(parseWait(["url", "checkout", "--state", "hidden"])).toEqual({
      success: false,
      error: "Unknown wait url option: --state",
    });
  });

  test("returns error when wait selector is missing", () => {
    expect(parseWait(["selector"])).toEqual({
      success: false,
      error: "wait selector requires a CSS selector",
    });
  });

  test("returns error for invalid selector state", () => {
    expect(parseWait(["selector", "#modal", "--state", "shown"])).toEqual({
      success: false,
      error: "--state must be one of: attached, detached, visible, hidden",
    });
  });

  test("returns error for unknown wait selector option", () => {
    expect(parseWait(["selector", "#modal", "--bad", "value"])).toEqual({
      success: false,
      error: "Unknown wait selector option: --bad",
    });
  });

  test("returns error for unsupported wait command", () => {
    expect(parseWait(["network", "idle"])).toEqual({
      success: false,
      error: "wait supports: wait url <pattern> | wait selector <css>",
    });
  });
});
