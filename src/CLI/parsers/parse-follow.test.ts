import { parseFollow } from "./parse-follow";

describe("parseFollow", () => {
  test("returns FOLLOW intent for valid pattern", () => {
    expect(parseFollow(["product", "details"])).toEqual({
      success: true,
      intent: {
        type: "FOLLOW",
        payload: {
          pattern: "product details",
        },
      },
    });
  });

  test("returns error when pattern is missing", () => {
    expect(parseFollow([])).toEqual({
      success: false,
      error: "follow requires an href pattern",
    });
  });
});
