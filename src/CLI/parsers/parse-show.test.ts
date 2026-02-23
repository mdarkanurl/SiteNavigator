import { parseShow } from "./parse-show";

describe("parseShow", () => {
  test("returns SHOW intent for code target with file name", () => {
    expect(parseShow(["code", "--dump"])).toEqual({
      success: true,
      intent: {
        type: "SHOW",
        payload: {
          target: "code",
          fileName: "--dump",
        },
      },
    });
  });

  test("returns error when show code file name is missing", () => {
    expect(parseShow(["code"])).toEqual({
      success: false,
      error: "show needs a file name where code will be stored",
    });
  });

  test("returns SHOW intent for elements target without file name", () => {
    expect(parseShow(["elements"])).toEqual({
      success: true,
      intent: {
        type: "SHOW",
        payload: {
          target: "elements",
          fileName: null,
        },
      },
    });
  });

  test("returns SHOW intent for elements target with file name", () => {
    expect(parseShow(["elements", "--elements"])).toEqual({
      success: true,
      intent: {
        type: "SHOW",
        payload: {
          target: "elements",
          fileName: "--elements",
        },
      },
    });
  });

  test("returns error for invalid file name prefix", () => {
    expect(parseShow(["elements", "elements"])).toEqual({
      success: false,
      error: "file name must start with --",
    });
  });

  test("returns error for unsupported show command", () => {
    expect(parseShow(["dom"])).toEqual({
      success: false,
      error: "show supports two commands: show code --fileName & show elements",
    });
  });
});
