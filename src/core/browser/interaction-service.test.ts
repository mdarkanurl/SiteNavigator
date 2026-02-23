jest.mock("node:fs/promises", () => ({
  writeFile: jest.fn(),
}));

jest.mock("./interaction-helpers", () => ({
  collectFillableFields: jest.fn(),
  collectInteractiveItems: jest.fn(),
  escapeForCss: jest.fn(),
  fillByLocator: jest.fn(),
  findFieldByName: jest.fn(),
  isAbsoluteHttpUrl: jest.fn(),
  normalizeText: jest.fn(),
}));

import { writeFile } from "node:fs/promises";
import { InteractionService } from "./interaction-service";
import {
  collectFillableFields,
  collectInteractiveItems,
  escapeForCss,
  fillByLocator,
  findFieldByName,
  isAbsoluteHttpUrl,
  normalizeText,
} from "./interaction-helpers";

function createClickableLocator() {
  const locator: any = {};
  locator.count = jest.fn().mockResolvedValue(1);
  locator.first = jest.fn().mockReturnValue(locator);
  locator.filter = jest.fn().mockReturnValue(locator);
  locator.scrollIntoViewIfNeeded = jest.fn().mockResolvedValue(undefined);
  locator.waitFor = jest.fn().mockResolvedValue(undefined);
  locator.click = jest.fn().mockResolvedValue(undefined);
  locator.evaluate = jest.fn().mockResolvedValue(undefined);
  return locator;
}

function createPage(locator: any, urls?: { oldUrl: string; newUrl: string }) {
  return {
    locator: jest.fn().mockReturnValue(locator),
    context: jest.fn().mockReturnValue({
      waitForEvent: jest.fn().mockRejectedValue(new Error("no popup")),
    }),
    waitForLoadState: jest.fn().mockResolvedValue(undefined),
    waitForFunction: jest.fn().mockResolvedValue(undefined),
    url: jest
      .fn()
      .mockReturnValueOnce(urls?.oldUrl ?? "https://example.com/old")
      .mockReturnValue(urls?.newUrl ?? "https://example.com/new"),
  };
}

describe("InteractionService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (escapeForCss as jest.MockedFunction<typeof escapeForCss>).mockImplementation((value: string) => value);
    (normalizeText as jest.MockedFunction<typeof normalizeText>).mockImplementation((value: string) =>
      value.replace(/\s+/g, " ").trim().toLowerCase()
    );
    (isAbsoluteHttpUrl as jest.MockedFunction<typeof isAbsoluteHttpUrl>).mockImplementation((value: string) =>
      value.startsWith("http://") || value.startsWith("https://")
    );
    (collectFillableFields as jest.MockedFunction<typeof collectFillableFields>).mockResolvedValue([]);
    (collectInteractiveItems as jest.MockedFunction<typeof collectInteractiveItems>).mockResolvedValue([]);
    (findFieldByName as jest.MockedFunction<typeof findFieldByName>).mockReturnValue(null);
    (fillByLocator as jest.MockedFunction<typeof fillByLocator>).mockResolvedValue(true);
  });

  test("returns error for act when cache is empty", async () => {
    const locator = createClickableLocator();
    const page = createPage(locator);
    const service = new InteractionService(
      async () => page as any,
      async () => ({ success: true })
    );

    await expect(service.act(1)).resolves.toEqual({
      success: false,
      error: "No cached element list found. Run `links` first.",
    });
  });

  test("lists links and assigns ids", async () => {
    const locator = createClickableLocator();
    const page = createPage(locator);
    const service = new InteractionService(
      async () => page as any,
      async () => ({ success: true })
    );
    const items = [
      { id: 7, tag: "a", text: "Docs", href: "/docs", resolvedHref: "https://example.com/docs", selector: "a:nth-of-type(1)" },
      { id: 8, tag: "button", text: "Save", href: null, resolvedHref: null, selector: "button:nth-of-type(1)" },
    ];
    (collectInteractiveItems as jest.MockedFunction<typeof collectInteractiveItems>).mockResolvedValue(items as any);

    await expect(service.listLinks(null)).resolves.toEqual({
      success: true,
      message: "Found 2 interactive elements",
      data: [
        { ...items[0], id: 0 },
        { ...items[1], id: 1 },
      ],
    });
  });

  test("filters links by text and href", async () => {
    const locator = createClickableLocator();
    const page = createPage(locator);
    const service = new InteractionService(
      async () => page as any,
      async () => ({ success: true })
    );
    (collectInteractiveItems as jest.MockedFunction<typeof collectInteractiveItems>).mockResolvedValue([
      { id: 0, tag: "a", text: "Pricing", href: "/pricing", resolvedHref: "https://example.com/pricing", selector: "a:nth-of-type(1)" },
      { id: 1, tag: "a", text: "Docs", href: "/docs", resolvedHref: "https://example.com/docs", selector: "a:nth-of-type(2)" },
    ] as any);

    await expect(service.listLinks("pricing")).resolves.toEqual({
      success: true,
      message: "Found 1 interactive elements",
      data: [
        { id: 0, tag: "a", text: "Pricing", href: "/pricing", resolvedHref: "https://example.com/pricing", selector: "a:nth-of-type(1)" },
      ],
    });
  });

  test("returns success for getAllElements and writes file", async () => {
    const locator = createClickableLocator();
    const page = createPage(locator);
    const service = new InteractionService(
      async () => page as any,
      async () => ({ success: true })
    );
    const items = [{ id: 0, tag: "button", text: "Save", href: null, resolvedHref: null, selector: "button:nth-of-type(1)" }];
    (collectInteractiveItems as jest.MockedFunction<typeof collectInteractiveItems>).mockResolvedValue(items as any);

    await expect(service.getAllElements("--elements")).resolves.toEqual({
      success: true,
      message: "Extracted 1 elements",
      data: items,
    });

    expect(writeFile).toHaveBeenCalledWith("elements.js", JSON.stringify(items, null, 2), "utf8");
  });

  test("returns error for getAllElements when write fails", async () => {
    const locator = createClickableLocator();
    const page = createPage(locator);
    const service = new InteractionService(
      async () => page as any,
      async () => ({ success: true })
    );
    (collectInteractiveItems as jest.MockedFunction<typeof collectInteractiveItems>).mockResolvedValue([] as any);
    (writeFile as jest.MockedFunction<typeof writeFile>).mockRejectedValueOnce(new Error("no"));

    await expect(service.getAllElements("--elements")).resolves.toEqual({
      success: false,
      error: "Failed to save elements to file",
    });
  });

  test("returns error for follow when no link matches pattern", async () => {
    const locator = createClickableLocator();
    const page = createPage(locator);
    const service = new InteractionService(
      async () => page as any,
      async () => ({ success: true })
    );
    (collectInteractiveItems as jest.MockedFunction<typeof collectInteractiveItems>).mockResolvedValue([
      { id: 0, tag: "button", text: "Submit", href: null, resolvedHref: null, selector: "button:nth-of-type(1)" },
    ] as any);

    await expect(service.follow("docs")).resolves.toEqual({
      success: false,
      error: "No link matched pattern: docs",
    });
  });

  test("returns success for follow with absolute href", async () => {
    const locator = createClickableLocator();
    const page = createPage(locator);
    const openTarget = jest.fn().mockResolvedValue({ success: true, message: "opened" });
    const service = new InteractionService(async () => page as any, openTarget);
    const matched = {
      id: 0,
      tag: "a",
      text: "Docs",
      href: "/docs",
      resolvedHref: "https://example.com/docs",
      selector: "a:nth-of-type(1)",
    };
    (collectInteractiveItems as jest.MockedFunction<typeof collectInteractiveItems>).mockResolvedValue([matched] as any);

    await expect(service.follow("docs")).resolves.toEqual({
      success: true,
      message: "Followed link using pattern: docs",
      data: { matched },
    });
    expect(openTarget).toHaveBeenCalledWith("https://example.com/docs");
  });

  test("returns error for act when id does not exist", async () => {
    const locator = createClickableLocator();
    const page = createPage(locator);
    const service = new InteractionService(
      async () => page as any,
      async () => ({ success: true })
    );
    (collectInteractiveItems as jest.MockedFunction<typeof collectInteractiveItems>).mockResolvedValue([
      { id: 10, tag: "a", text: "Docs", href: "/docs", resolvedHref: "https://example.com/docs", selector: "a:nth-of-type(1)" },
    ] as any);

    await service.listLinks(null);
    await expect(service.act(3)).resolves.toEqual({
      success: false,
      error: "Element id 3 not found. Run links again to refresh IDs.",
    });
  });

  test("returns openTarget result for act with absolute href", async () => {
    const locator = createClickableLocator();
    const page = createPage(locator);
    const openTarget = jest.fn().mockResolvedValue({ success: true, message: "opened" });
    const service = new InteractionService(async () => page as any, openTarget);
    (collectInteractiveItems as jest.MockedFunction<typeof collectInteractiveItems>).mockResolvedValue([
      { id: 10, tag: "a", text: "Docs", href: "/docs", resolvedHref: "https://example.com/docs", selector: "a:nth-of-type(1)" },
    ] as any);

    await service.listLinks(null);
    await expect(service.act(0)).resolves.toEqual({
      success: true,
      message: "opened",
    });
  });

  test("returns error for click index when no matched cached element", async () => {
    const locator = createClickableLocator();
    const page = createPage(locator);
    const service = new InteractionService(
      async () => page as any,
      async () => ({ success: true })
    );
    (collectInteractiveItems as jest.MockedFunction<typeof collectInteractiveItems>).mockResolvedValue([] as any);

    await expect(service.click({ mode: "index", value: 2 })).resolves.toEqual({
      success: false,
      error: "No element found for index 2. Run links to inspect valid IDs.",
    });
  });

  test("returns success for click selector", async () => {
    const locator = createClickableLocator();
    const page = createPage(locator, {
      oldUrl: "https://example.com/old",
      newUrl: "https://example.com/new",
    });
    const service = new InteractionService(
      async () => page as any,
      async () => ({ success: true })
    );

    await expect(service.click({ mode: "selector", value: "#btn" })).resolves.toEqual({
      success: true,
      message: "Action successful",
      data: {
        mode: "selector",
        value: "#btn",
        matchedCount: 1,
        navigated: true,
        oldUrl: "https://example.com/old",
        newUrl: "https://example.com/new",
        openedPopup: false,
        popupUrl: null,
      },
    });
  });

  test("returns success for wait url", async () => {
    const locator = createClickableLocator();
    const page = createPage(locator, {
      oldUrl: "https://example.com/current",
      newUrl: "https://example.com/current",
    });
    const service = new InteractionService(
      async () => page as any,
      async () => ({ success: true })
    );
    const dateNowSpy = jest.spyOn(Date, "now");
    dateNowSpy.mockReturnValueOnce(1000).mockReturnValueOnce(1125);

    await expect(service.wait({ mode: "url", pattern: "checkout", timeoutMs: 4000 })).resolves.toEqual({
      success: true,
      message: "Waited for URL pattern: checkout",
      data: {
        mode: "url",
        pattern: "checkout",
        timeoutMs: 4000,
        elapsedMs: 125,
        currentUrl: "https://example.com/current",
      },
    });

    dateNowSpy.mockRestore();
  });

  test("returns error for wait when selector wait throws", async () => {
    const locator = createClickableLocator();
    locator.waitFor.mockRejectedValueOnce(new Error("timeout"));
    const page = createPage(locator);
    const service = new InteractionService(
      async () => page as any,
      async () => ({ success: true })
    );

    await expect(
      service.wait({ mode: "selector", selector: "#modal", state: "visible", timeoutMs: 2000 })
    ).resolves.toEqual({
      success: false,
      error: "Wait failed for selector. Timeout: 2000ms",
    });
  });

  test("returns error for input when field cannot be found", async () => {
    const locator = createClickableLocator();
    const page = createPage(locator);
    const service = new InteractionService(
      async () => page as any,
      async () => ({ success: true })
    );
    (collectFillableFields as jest.MockedFunction<typeof collectFillableFields>).mockResolvedValue([
      { selector: "#email", tag: "input", type: "text", candidates: ["Email"] },
    ] as any);
    (findFieldByName as jest.MockedFunction<typeof findFieldByName>).mockReturnValue(null);

    await expect(
      service.input([{ target: { mode: "text", value: "Password" }, value: "secret" }], "Submit")
    ).resolves.toEqual({
      success: false,
      error: "No input field found for target: text Password",
    });
  });

  test("returns error for input when fillByLocator fails", async () => {
    const locator = createClickableLocator();
    const page = createPage(locator);
    const service = new InteractionService(
      async () => page as any,
      async () => ({ success: true })
    );
    const field = { selector: "#email", tag: "input", type: "text", candidates: ["Email"] };
    (collectFillableFields as jest.MockedFunction<typeof collectFillableFields>).mockResolvedValue([field] as any);
    (findFieldByName as jest.MockedFunction<typeof findFieldByName>).mockReturnValue(field as any);
    (fillByLocator as jest.MockedFunction<typeof fillByLocator>).mockResolvedValue(false);

    await expect(
      service.input([{ target: { mode: "text", value: "Email" }, value: "user@example.com" }], "Submit")
    ).resolves.toEqual({
      success: false,
      error: "Failed to set value for target: text Email",
    });
  });

  test("returns error for input when submit button is not found", async () => {
    const locator = createClickableLocator();
    const page = createPage(locator);
    const service = new InteractionService(
      async () => page as any,
      async () => ({ success: true })
    );
    const field = { selector: "#email", tag: "input", type: "text", candidates: ["Email"] };
    (collectFillableFields as jest.MockedFunction<typeof collectFillableFields>).mockResolvedValue([field] as any);
    (findFieldByName as jest.MockedFunction<typeof findFieldByName>).mockReturnValue(field as any);
    (collectInteractiveItems as jest.MockedFunction<typeof collectInteractiveItems>).mockResolvedValue([
      { id: 0, tag: "button", text: "Cancel", href: null, resolvedHref: null, selector: "button:nth-of-type(1)" },
    ] as any);

    await expect(
      service.input([{ target: { mode: "text", value: "Email" }, value: "user@example.com" }], "Submit")
    ).resolves.toEqual({
      success: false,
      error: "No submit button found with text: Submit",
    });
  });
});
