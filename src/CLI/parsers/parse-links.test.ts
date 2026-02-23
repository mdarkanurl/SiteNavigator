import { parseLinks } from "./parse-links";

describe("parseLinks", () => {
  test("returns LINKS intent with null filter when args missing", () => {
    expect(parseLinks([])).toEqual({
      success: true,
      intent: {
        type: "LINKS",
        payload: {
          filter: null,
        },
      },
    });
  });

  test("returns LINKS intent for --filter", () => {
    expect(parseLinks(["--filter", "pricing", "plans"])).toEqual({
      success: true,
      intent: {
        type: "LINKS",
        payload: {
          filter: "pricing plans",
        },
      },
    });
  });

  test("returns error when --filter value is missing", () => {
    expect(parseLinks(["--filter"])).toEqual({
      success: false,
      error: "--filter needs a value",
    });
  });

  test("returns LINKS intent for positional filter", () => {
    expect(parseLinks(["docs", "api"])).toEqual({
      success: true,
      intent: {
        type: "LINKS",
        payload: {
          filter: "docs api",
        },
      },
    });
  });
});
