import {
  collectFillableFields,
  collectInteractiveItems,
  escapeForCss,
  fillByLocator,
  findFieldByName,
  isAbsoluteHttpUrl,
  normalizeText,
} from "./interaction-helpers";

describe("interaction-helpers", () => {
  test("normalizes text", () => {
    expect(normalizeText("  Hello   WORLD  ")).toEqual("hello world");
  });

  test("detects absolute http URLs", () => {
    expect(isAbsoluteHttpUrl("https://example.com")).toEqual(true);
  });

  test("returns false for non-http URL", () => {
    expect(isAbsoluteHttpUrl("ftp://example.com")).toEqual(false);
  });

  test("escapes css special chars for href query", () => {
    expect(escapeForCss('a\\"b\\c')).toEqual('a\\\\\\"b\\\\c');
  });

  test("finds field by exact normalized candidate", () => {
    const fields = [
      { selector: "#a", tag: "input", type: "text", candidates: ["Email Address"] },
      { selector: "#b", tag: "input", type: "text", candidates: ["Password"] },
    ];

    expect(findFieldByName(fields, "  email address ")).toEqual(fields[0]);
  });

  test("finds field by partial match", () => {
    const fields = [
      { selector: "#a", tag: "input", type: "text", candidates: ["Your Full Name"] },
    ];

    expect(findFieldByName(fields, "full")).toEqual(fields[0]);
  });

  test("returns null when field name is empty", () => {
    const fields = [
      { selector: "#a", tag: "input", type: "text", candidates: ["Name"] },
    ];

    expect(findFieldByName(fields, "   ")).toEqual(null);
  });

  test("returns false for fillByLocator when no locator matches", async () => {
    const locator = {
      count: jest.fn().mockResolvedValue(0),
      first: jest.fn(),
    };

    await expect(fillByLocator(locator as any, "value")).resolves.toEqual(false);
  });

  test("fills input field successfully", async () => {
    const target = {
      scrollIntoViewIfNeeded: jest.fn().mockResolvedValue(undefined),
      waitFor: jest.fn().mockResolvedValue(undefined),
      evaluate: jest.fn().mockResolvedValue("input"),
      fill: jest.fn().mockResolvedValue(undefined),
    };
    const locator = {
      count: jest.fn().mockResolvedValue(1),
      first: jest.fn().mockReturnValue(target),
    };

    await expect(fillByLocator(locator as any, "hello")).resolves.toEqual(true);
    expect(target.fill).toHaveBeenCalledWith("hello");
  });

  test("fills select by fallback value when label option fails", async () => {
    const target = {
      scrollIntoViewIfNeeded: jest.fn().mockResolvedValue(undefined),
      waitFor: jest.fn().mockResolvedValue(undefined),
      evaluate: jest.fn().mockResolvedValue("select"),
      selectOption: jest
        .fn()
        .mockRejectedValueOnce(new Error("no label"))
        .mockResolvedValueOnce(undefined),
    };
    const locator = {
      count: jest.fn().mockResolvedValue(1),
      first: jest.fn().mockReturnValue(target),
    };

    await expect(fillByLocator(locator as any, "US")).resolves.toEqual(true);
    expect(target.selectOption).toHaveBeenNthCalledWith(1, { label: "US" });
    expect(target.selectOption).toHaveBeenNthCalledWith(2, { value: "US" });
  });

  test("returns false for unsupported tag in fillByLocator", async () => {
    const target = {
      scrollIntoViewIfNeeded: jest.fn().mockResolvedValue(undefined),
      waitFor: jest.fn().mockResolvedValue(undefined),
      evaluate: jest.fn().mockResolvedValue("div"),
    };
    const locator = {
      count: jest.fn().mockResolvedValue(1),
      first: jest.fn().mockReturnValue(target),
    };

    await expect(fillByLocator(locator as any, "x")).resolves.toEqual(false);
  });

  test("collects fillable fields through page.evaluate", async () => {
    const fields = [
      { selector: "#email", tag: "input", type: "text", candidates: ["Email"] },
    ];
    const page = {
      evaluate: jest.fn().mockResolvedValue(fields),
    };

    await expect(collectFillableFields(page as any)).resolves.toEqual(fields);
  });

  test("collects interactive items and assigns sequential ids", async () => {
    const rawItems = [
      {
        tag: "a",
        text: "Docs",
        href: "/docs",
        resolvedHref: "https://example.com/docs",
        selector: "a:nth-of-type(1)",
      },
      {
        tag: "button",
        text: "Submit",
        href: null,
        resolvedHref: null,
        selector: "button:nth-of-type(1)",
      },
    ];
    const page = {
      evaluate: jest.fn().mockResolvedValue(rawItems),
    };

    await expect(collectInteractiveItems(page as any)).resolves.toEqual([
      {
        id: 0,
        tag: "a",
        text: "Docs",
        href: "/docs",
        resolvedHref: "https://example.com/docs",
        selector: "a:nth-of-type(1)",
      },
      {
        id: 1,
        tag: "button",
        text: "Submit",
        href: null,
        resolvedHref: null,
        selector: "button:nth-of-type(1)",
      },
    ]);
  });
});
