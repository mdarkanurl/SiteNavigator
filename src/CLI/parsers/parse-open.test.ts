import { parseOpen } from "./parse-open";

describe("parseOpen", () => {
  test("returns OPEN intent for relative path target", () => {
    expect(parseOpen(["/products", "top"])).toEqual({
      success: true,
      intent: {
        type: "OPEN",
        payload: {
          target: "/products top",
        },
      },
    });
  });

  test("returns OPEN intent for valid absolute URL", () => {
    expect(parseOpen(["https://example.com/path"])).toEqual({
      success: true,
      intent: {
        type: "OPEN",
        payload: {
          target: "https://example.com/path",
        },
      },
    });
  });

  test("returns error when target is missing", () => {
    expect(parseOpen([])).toEqual({
      success: false,
      error: "open requires a URL or relative path",
    });
  });

  test("returns error for invalid absolute URL", () => {
    expect(parseOpen(["https://"])).toEqual({
      success: false,
      error: "Invalid absolute URL",
    });
  });
});
