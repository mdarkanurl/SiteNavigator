import { parseNavigate } from "./parse-navigate";

describe("parseNavigate", () => {
  test("returns NAVIGATE intent for valid https URL", () => {
    expect(parseNavigate(["https://example.com"])).toEqual({
      success: true,
      intent: {
        type: "NAVIGATE",
        payload: {
          url: "https://example.com/",
        },
      },
    });
  });

  test("returns error when URL is missing", () => {
    expect(parseNavigate([])).toEqual({
      success: false,
      error: "navigate requires a URL",
    });
  });

  test("returns error for invalid URL protocol", () => {
    expect(parseNavigate(["ftp://example.com"])).toEqual({
      success: false,
      error: "Invalid URL protocol. Only http and https are allowed.",
    });
  });
});
