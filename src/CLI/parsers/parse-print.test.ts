import { parsePrint } from "./parse-print";

describe("parsePrint", () => {
  test("returns PRINT intent for 'url'", () => {
    expect(parsePrint(["url"])).toEqual({
      success: true,
      intent: {
        type: "PRINT",
        payload: {
          target: "url",
        },
      },
    });
  });

  test("returns PRINT intent for 'title'", () => {
    expect(parsePrint(["title"])).toEqual({
      success: true,
      intent: {
        type: "PRINT",
        payload: {
          target: "title",
        },
      },
    });
  });

  test("returns error for unsupported print target", () => {
    expect(parsePrint(["body"])).toEqual({
      success: false,
      error: "print supports two commands: print url & print title",
    });
  });
});
