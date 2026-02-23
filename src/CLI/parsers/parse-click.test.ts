import { parseClick } from "./parse-click";

describe("parseClick", () => {
  test("returns CLICK intent for valid --selector", () => {
    expect(parseClick(["--selector", "body:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1)"])).toEqual({
      success: true,
      intent: {
        type: "CLICK",
        payload: {
          target: {
            mode: "selector",
            value: "body:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1)"
          },
        },
      },
    });
  });

  test("returns CLICK intent for invalid --selector", () => {
    expect(parseClick(["--selector"])).toEqual({
      success: false,
      error: "--selector needs a value"
    });
  });

  test("returns CLICK intent for valid --text", () => {
    expect(parseClick(["--text", "some-text"])).toEqual({
      success: true,
      intent: {
        type: "CLICK",
        payload: {
          target: {
            mode: "text",
            value: "some-text"
          },
        },
      },
    });
  });

  test("returns CLICK intent for invalid --text", () => {
    expect(parseClick(["--text"])).toEqual({
      success: false,
      error: "--text needs a value"
    });
  });

  test("returns CLICK intent for valid --href", () => {
    expect(parseClick(["--href", "some-text"])).toEqual({
      success: true,
      intent: {
        type: "CLICK",
        payload: {
          target: {
            mode: "href",
            value: "some-text"
          },
        },
      },
    });
  });

  test("returns CLICK intent for invalid --href", () => {
    expect(parseClick(["--href"])).toEqual({
      success: false,
      error: "--href needs a value"
    });
  });

  test("returns CLICK intent for valid --index", () => {
    expect(parseClick(["--index", "1"])).toEqual({
      success: true,
      intent: {
        type: "CLICK",
        payload: {
          target: {
            mode: "index",
            value: 1
          },
        },
      },
    });
  });

  test("returns CLICK intent for invalid --index", () => {
    expect(parseClick(["--index"])).toEqual({
      success: false,
      error: "--index needs a numeric value"
    });
  });

  test("returns CLICK intent for invalid --index", () => {
    expect(parseClick(["--index", "one"])).toEqual({
      success: false,
      error: "--index must be a non-negative integer"
    });
  });

  test("returns CLICK intent for invalid --index", () => {
    expect(parseClick(["--index", "-5"])).toEqual({
      success: false,
      error: "--index must be a non-negative integer"
    });
  });

  test("returns error when input is missing", () => {
    expect(parseClick([])).toEqual({
      success: false,
      error: "click needs a selector or one of --selector --text --href --index",
    });
  });

  test("returns error for not starts with (--)", () => {
    expect(parseClick(["selector", "other-item"])).toEqual({
      success: false,
      error: "Unknown click mode. Use --selector --text --href or --index",
    });
  });

  test("returns error for invalid mode", () => {
    expect(parseClick(["--test", ""])).toEqual({
      success: false,
      error: "Unknown click mode. Use --selector --text --href or --index",
    });
  });
});
