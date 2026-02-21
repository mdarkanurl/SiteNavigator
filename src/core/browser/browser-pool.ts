import { BrowserPool, PlaywrightPlugin } from "@crawlee/browser-pool";
import playwright from "playwright";

export const browserPool = new BrowserPool({
  browserPlugins: [
    new PlaywrightPlugin(playwright.chromium, {
      launchOptions: {
        headless: false,
      },
    }),
  ],
});
