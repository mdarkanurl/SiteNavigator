jest.mock("node:fs/promises", () => ({
  writeFile: jest.fn(),
}));

import { writeFile } from "node:fs/promises";
import { NavigationService } from "./navigation-service";

function createResponse(options?: { ok?: boolean; finished?: string | null }) {
  return {
    ok: jest.fn().mockReturnValue(options?.ok ?? true),
    finished: jest.fn().mockResolvedValue(options?.finished ?? null),
  };
}

describe("NavigationService", () => {
  test("returns success for navigate when response is ok", async () => {
    const response = createResponse();
    const page = {
      goto: jest.fn().mockResolvedValue(response),
    };
    const service = new NavigationService(async () => page as any);

    await expect(service.navigate("https://example.com")).resolves.toEqual({
      success: true,
      message: "Navigate to https://example.com",
    });
  });

  test("returns error when navigate throws", async () => {
    const page = {
      goto: jest.fn().mockRejectedValue(new Error("boom")),
    };
    const service = new NavigationService(async () => page as any);

    await expect(service.navigate("https://example.com")).resolves.toEqual({
      success: false,
      error: "Failed to navigate to https://example.com",
    });
  });

  test("returns error when navigate response is null", async () => {
    const page = {
      goto: jest.fn().mockResolvedValue(null),
    };
    const service = new NavigationService(async () => page as any);

    await expect(service.navigate("https://example.com")).resolves.toEqual({
      success: false,
      error: "Failed to navigate to https://example.com",
    });
  });

  test("returns error when navigate response finishes with error", async () => {
    const response = createResponse({ finished: "timed out" });
    const page = {
      goto: jest.fn().mockResolvedValue(response),
    };
    const service = new NavigationService(async () => page as any);

    await expect(service.navigate("https://example.com")).resolves.toEqual({
      success: false,
      error: "Failed to navigate to https://example.com. Here's the error: timed out",
    });
  });

  test("returns error when navigate response is not ok", async () => {
    const response = createResponse({ ok: false });
    const page = {
      goto: jest.fn().mockResolvedValue(response),
    };
    const service = new NavigationService(async () => page as any);

    await expect(service.navigate("https://example.com")).resolves.toEqual({
      success: false,
      error: "Website response was not successful",
    });
  });

  test("returns error for open with relative path on about:blank", async () => {
    const page = {
      url: jest.fn().mockReturnValue("about:blank"),
    };
    const service = new NavigationService(async () => page as any);

    await expect(service.open("/docs")).resolves.toEqual({
      success: false,
      error: "Cannot resolve relative path before loading a page. Use navigate first.",
    });
  });

  test("returns success for open with relative path", async () => {
    const response = createResponse();
    const page = {
      url: jest.fn().mockReturnValue("https://example.com/base"),
      goto: jest.fn().mockResolvedValue(response),
    };
    const service = new NavigationService(async () => page as any);

    await expect(service.open("/docs")).resolves.toEqual({
      success: true,
      message: "Navigate to https://example.com/docs",
    });
  });

  test("returns success for showCode and normalizes file name", async () => {
    const page = {
      content: jest.fn().mockResolvedValue("<html></html>"),
    };
    const service = new NavigationService(async () => page as any);
    const writeFileMock = writeFile as jest.MockedFunction<typeof writeFile>;

    await expect(service.showCode("--page")).resolves.toEqual({
      success: true,
      message: "Check page.html, you'll find code there.",
    });

    expect(writeFileMock).toHaveBeenCalledWith("page.html", "<html></html>", "utf8");
  });

  test("returns error for showCode when file write fails", async () => {
    const page = {
      content: jest.fn().mockResolvedValue("<html></html>"),
    };
    const service = new NavigationService(async () => page as any);
    const writeFileMock = writeFile as jest.MockedFunction<typeof writeFile>;
    writeFileMock.mockRejectedValueOnce(new Error("write failed"));

    await expect(service.showCode("--page")).resolves.toEqual({
      success: false,
      error: "Failed to save HTML to file",
    });
  });

  test("returns success for moveBack when page can move", async () => {
    const page = {
      goBack: jest.fn().mockResolvedValue({}),
    };
    const service = new NavigationService(async () => page as any);

    await expect(service.moveBack()).resolves.toEqual({
      success: true,
      message: "Moved back successfully",
    });
  });

  test("returns error for moveBack when page cannot move", async () => {
    const page = {
      goBack: jest.fn().mockResolvedValue(null),
    };
    const service = new NavigationService(async () => page as any);

    await expect(service.moveBack()).resolves.toEqual({
      success: false,
      error: "Cannot move back from the current page",
    });
  });

  test("returns success for moveForward when page can move", async () => {
    const page = {
      goForward: jest.fn().mockResolvedValue({}),
    };
    const service = new NavigationService(async () => page as any);

    await expect(service.moveForward()).resolves.toEqual({
      success: true,
      message: "Moved forward successfully",
    });
  });

  test("returns success for reload when response is ok", async () => {
    const response = createResponse();
    const page = {
      reload: jest.fn().mockResolvedValue(response),
    };
    const service = new NavigationService(async () => page as any);

    await expect(service.reload()).resolves.toEqual({
      success: true,
      message: "Reloaded current page successfully",
    });
  });

  test("returns error for reload when response is not ok", async () => {
    const response = createResponse({ ok: false });
    const page = {
      reload: jest.fn().mockResolvedValue(response),
    };
    const service = new NavigationService(async () => page as any);

    await expect(service.reload()).resolves.toEqual({
      success: false,
      error: "Website response was not successful",
    });
  });

  test("returns current URL", async () => {
    const page = {
      url: jest.fn().mockReturnValue("https://example.com/current"),
    };
    const service = new NavigationService(async () => page as any);

    await expect(service.getCurrentUrl()).resolves.toEqual({
      success: true,
      message: "Current URL",
      data: "https://example.com/current",
    });
  });

  test("returns current title", async () => {
    const page = {
      title: jest.fn().mockResolvedValue("Example Title"),
    };
    const service = new NavigationService(async () => page as any);

    await expect(service.getCurrentTitle()).resolves.toEqual({
      success: true,
      message: "Current title",
      data: "Example Title",
    });
  });

  test("returns success for screenshot and normalizes file name", async () => {
    const page = {
      screenshot: jest.fn().mockResolvedValue(undefined),
    };
    const service = new NavigationService(async () => page as any);

    await expect(service.screenshot("--home")).resolves.toEqual({
      success: true,
      message: "Screenshot saved to home.png",
    });

    expect(page.screenshot).toHaveBeenCalledWith({ path: "home.png" });
  });

  test("returns error for screenshot when playwright throws", async () => {
    const page = {
      screenshot: jest.fn().mockRejectedValue(new Error("nope")),
    };
    const service = new NavigationService(async () => page as any);

    await expect(service.screenshot("--home")).resolves.toEqual({
      success: false,
      error: "Failed to take screenshot",
    });
  });
});
