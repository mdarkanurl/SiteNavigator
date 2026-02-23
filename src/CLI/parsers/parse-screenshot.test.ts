import { parseScreenshot } from "./parse-screenshot";

describe("parseScreenshot", () => {
  test("returns SCREENSHOT intent for valid file name", () => {
    expect(parseScreenshot(["--shot.png"])).toEqual({
      success: true,
      intent: {
        type: "SCREENSHOT",
        payload: {
          fileName: "--shot.png",
        },
      },
    });
  });

  test("returns error when file name is missing", () => {
    expect(parseScreenshot([])).toEqual({
      success: false,
      error: "screenshot needs a file name where image will be stored",
    });
  });

  test("returns error when file name does not start with --", () => {
    expect(parseScreenshot(["shot.png"])).toEqual({
      success: false,
      error: "file name must start with --",
    });
  });
});
