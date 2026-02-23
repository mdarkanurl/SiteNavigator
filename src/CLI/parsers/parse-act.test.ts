import { parseAct } from "./parse-act";

describe("parseAct", () => {
  test("returns ACT intent for valid number", () => {
    expect(parseAct(["1"])).toEqual({
      success: true,
      intent: {
        type: "ACT",
        payload: {
          id: 1,
        },
      },
    });
  });

  test("returns error when number is missing", () => {
    expect(parseAct([])).toEqual({
      success: false,
      error: "act requires an element id from links output",
    });
  });

  test("returns error for invalid number", () => {
    expect(parseAct(["ftp://example.com"])).toEqual({
      success: false,
      error: "act id must be a non-negative integer",
    });
  });

  test("returns error for invalid number", () => {
    expect(parseAct(["-1"])).toEqual({
      success: false,
      error: "act id must be a non-negative integer",
    });
  });
});
