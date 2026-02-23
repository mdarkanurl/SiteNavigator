let mockBrowserController: {
  navigate: jest.Mock;
  open: jest.Mock;
  showCode: jest.Mock;
  getAllElements: jest.Mock;
  input: jest.Mock;
  click: jest.Mock;
  listLinks: jest.Mock;
  follow: jest.Mock;
  act: jest.Mock;
  wait: jest.Mock;
  moveBack: jest.Mock;
  moveForward: jest.Mock;
  reload: jest.Mock;
  getCurrentUrl: jest.Mock;
  getCurrentTitle: jest.Mock;
  screenshot: jest.Mock;
};

jest.mock("../core/browser-controller", () => {
  mockBrowserController = {
    navigate: jest.fn(),
    open: jest.fn(),
    showCode: jest.fn(),
    getAllElements: jest.fn(),
    input: jest.fn(),
    click: jest.fn(),
    listLinks: jest.fn(),
    follow: jest.fn(),
    act: jest.fn(),
    wait: jest.fn(),
    moveBack: jest.fn(),
    moveForward: jest.fn(),
    reload: jest.fn(),
    getCurrentUrl: jest.fn(),
    getCurrentTitle: jest.fn(),
    screenshot: jest.fn(),
  };

  return {
    BrowserController: jest.fn().mockImplementation(() => mockBrowserController),
  };
});

import { Intent } from "../CLI/intent";
import { AppState } from "./state";
import { executeIntent } from "./executors";

function createState(): AppState {
  return {
    browserStarted: false,
    pageLoaded: false,
    currentUrl: null,
  };
}

describe("executeIntent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("handles NAVIGATE and updates state on success", async () => {
    const state = createState();
    const intent: Intent = { type: "NAVIGATE", payload: { url: "https://example.com" } };
    const result = { success: true as const, message: "ok" };
    mockBrowserController.navigate.mockResolvedValue(result);

    await expect(executeIntent(intent, state)).resolves.toEqual(result);
    expect(mockBrowserController.navigate).toHaveBeenCalledWith("https://example.com");
    expect(state).toEqual({
      browserStarted: true,
      pageLoaded: true,
      currentUrl: "https://example.com",
    });
  });

  test("handles NAVIGATE and keeps state unchanged on failure", async () => {
    const state = createState();
    const intent: Intent = { type: "NAVIGATE", payload: { url: "https://bad.example" } };
    const result = { success: false as const, error: "failed" };
    mockBrowserController.navigate.mockResolvedValue(result);

    await expect(executeIntent(intent, state)).resolves.toEqual(result);
    expect(state).toEqual({
      browserStarted: false,
      pageLoaded: false,
      currentUrl: null,
    });
  });

  test("handles OPEN and updates state on success", async () => {
    const state = createState();
    const intent: Intent = { type: "OPEN", payload: { target: "docs" } };
    const result = { success: true as const };
    mockBrowserController.open.mockResolvedValue(result);

    await expect(executeIntent(intent, state)).resolves.toEqual(result);
    expect(mockBrowserController.open).toHaveBeenCalledWith("docs");
    expect(state.browserStarted).toEqual(true);
    expect(state.pageLoaded).toEqual(true);
    expect(state.currentUrl).toEqual(null);
  });

  test("handles OPEN and keeps state unchanged on failure", async () => {
    const state = createState();
    const intent: Intent = { type: "OPEN", payload: { target: "missing" } };
    const result = { success: false as const, error: "not found" };
    mockBrowserController.open.mockResolvedValue(result);

    await expect(executeIntent(intent, state)).resolves.toEqual(result);
    expect(state).toEqual({
      browserStarted: false,
      pageLoaded: false,
      currentUrl: null,
    });
  });

  test("handles SHOW code", async () => {
    const state = createState();
    const intent: Intent = { type: "SHOW", payload: { target: "code", fileName: "page.js" } };
    const result = { success: true as const, data: "code" };
    mockBrowserController.showCode.mockResolvedValue(result);

    await expect(executeIntent(intent, state)).resolves.toEqual(result);
    expect(mockBrowserController.showCode).toHaveBeenCalledWith("page.js");
  });

  test("handles SHOW elements", async () => {
    const state = createState();
    const intent: Intent = { type: "SHOW", payload: { target: "elements", fileName: null } };
    const result = { success: true as const, data: [] };
    mockBrowserController.getAllElements.mockResolvedValue(result);

    await expect(executeIntent(intent, state)).resolves.toEqual(result);
    expect(mockBrowserController.getAllElements).toHaveBeenCalledWith(null);
  });

  test("returns error for invalid SHOW target", () => {
    const state = createState();
    const intent = { type: "SHOW", payload: { target: "bad", fileName: "x" } } as any;

    expect(executeIntent(intent, state)).toEqual({
      success: false,
      error: "Invalid SHOW target",
    });
  });

  test("handles INPUT", async () => {
    const state = createState();
    const intent: Intent = {
      type: "INPUT",
      payload: {
        fields: [{ target: { mode: "text", value: "Email" }, value: "user@example.com" }],
        submitText: "Submit",
      },
    };
    const result = { success: true as const, message: "filled" };
    mockBrowserController.input.mockResolvedValue(result);

    await expect(executeIntent(intent, state)).resolves.toEqual(result);
    expect(mockBrowserController.input).toHaveBeenCalledWith(intent.payload.fields, "Submit");
  });

  test("handles CLICK", async () => {
    const state = createState();
    const intent: Intent = { type: "CLICK", payload: { target: { mode: "selector", value: "#go" } } };
    const result = { success: true as const };
    mockBrowserController.click.mockResolvedValue(result);

    await expect(executeIntent(intent, state)).resolves.toEqual(result);
    expect(mockBrowserController.click).toHaveBeenCalledWith({ mode: "selector", value: "#go" });
  });

  test("handles LINKS", async () => {
    const state = createState();
    const intent: Intent = { type: "LINKS", payload: { filter: "docs" } };
    const result = { success: true as const, data: [] };
    mockBrowserController.listLinks.mockResolvedValue(result);

    await expect(executeIntent(intent, state)).resolves.toEqual(result);
    expect(mockBrowserController.listLinks).toHaveBeenCalledWith("docs");
  });

  test("handles FOLLOW", async () => {
    const state = createState();
    const intent: Intent = { type: "FOLLOW", payload: { pattern: "pricing" } };
    const result = { success: true as const };
    mockBrowserController.follow.mockResolvedValue(result);

    await expect(executeIntent(intent, state)).resolves.toEqual(result);
    expect(mockBrowserController.follow).toHaveBeenCalledWith("pricing");
  });

  test("handles ACT", async () => {
    const state = createState();
    const intent: Intent = { type: "ACT", payload: { id: 2 } };
    const result = { success: true as const };
    mockBrowserController.act.mockResolvedValue(result);

    await expect(executeIntent(intent, state)).resolves.toEqual(result);
    expect(mockBrowserController.act).toHaveBeenCalledWith(2);
  });

  test("handles WAIT", async () => {
    const state = createState();
    const intent: Intent = {
      type: "WAIT",
      payload: { target: { mode: "url", pattern: "checkout", timeoutMs: 3000 } },
    };
    const result = { success: true as const };
    mockBrowserController.wait.mockResolvedValue(result);

    await expect(executeIntent(intent, state)).resolves.toEqual(result);
    expect(mockBrowserController.wait).toHaveBeenCalledWith({
      mode: "url",
      pattern: "checkout",
      timeoutMs: 3000,
    });
  });

  test("handles MOVE_BACK", async () => {
    const state = createState();
    const intent: Intent = { type: "MOVE_BACK" };
    const result = { success: true as const };
    mockBrowserController.moveBack.mockResolvedValue(result);

    await expect(executeIntent(intent, state)).resolves.toEqual(result);
    expect(mockBrowserController.moveBack).toHaveBeenCalledTimes(1);
  });

  test("handles MOVE_FORWARD", async () => {
    const state = createState();
    const intent: Intent = { type: "MOVE_FORWARD" };
    const result = { success: true as const };
    mockBrowserController.moveForward.mockResolvedValue(result);

    await expect(executeIntent(intent, state)).resolves.toEqual(result);
    expect(mockBrowserController.moveForward).toHaveBeenCalledTimes(1);
  });

  test("handles RELOAD", async () => {
    const state = createState();
    const intent: Intent = { type: "RELOAD" };
    const result = { success: true as const };
    mockBrowserController.reload.mockResolvedValue(result);

    await expect(executeIntent(intent, state)).resolves.toEqual(result);
    expect(mockBrowserController.reload).toHaveBeenCalledTimes(1);
  });

  test("handles PRINT url", async () => {
    const state = createState();
    const intent: Intent = { type: "PRINT", payload: { target: "url" } };
    const result = { success: true as const, data: "https://example.com" };
    mockBrowserController.getCurrentUrl.mockResolvedValue(result);

    await expect(executeIntent(intent, state)).resolves.toEqual(result);
    expect(mockBrowserController.getCurrentUrl).toHaveBeenCalledTimes(1);
  });

  test("handles PRINT title", async () => {
    const state = createState();
    const intent: Intent = { type: "PRINT", payload: { target: "title" } };
    const result = { success: true as const, data: "Example" };
    mockBrowserController.getCurrentTitle.mockResolvedValue(result);

    await expect(executeIntent(intent, state)).resolves.toEqual(result);
    expect(mockBrowserController.getCurrentTitle).toHaveBeenCalledTimes(1);
  });

  test("returns error for invalid PRINT target", () => {
    const state = createState();
    const intent = { type: "PRINT", payload: { target: "bad" } } as any;

    expect(executeIntent(intent, state)).toEqual({
      success: false,
      error: "Invalid PRINT target",
    });
  });

  test("handles SCREENSHOT", async () => {
    const state = createState();
    const intent: Intent = { type: "SCREENSHOT", payload: { fileName: "shot.png" } };
    const result = { success: true as const, message: "saved" };
    mockBrowserController.screenshot.mockResolvedValue(result);

    await expect(executeIntent(intent, state)).resolves.toEqual(result);
    expect(mockBrowserController.screenshot).toHaveBeenCalledWith("shot.png");
  });

  test("returns HELP response", () => {
    const state = createState();
    const intent: Intent = { type: "HELP" };

    expect(executeIntent(intent, state)).toEqual({
      success: true,
      message:
        "Available commands: navigate, open, show, input, links, follow, act, wait, click, move back, move forward, reload, print url, print title, screenshot, help, exit",
    });
  });

  test("returns EXIT response", () => {
    const state = createState();
    const intent: Intent = { type: "EXIT" };

    expect(executeIntent(intent, state)).toEqual({ success: true });
  });

  test("throws for unhandled intent", () => {
    const state = createState();
    const intent = { type: "UNKNOWN" } as any;

    expect(() => executeIntent(intent, state)).toThrow("Unhandled intent");
  });
});
