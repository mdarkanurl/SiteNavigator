import { BrowserPool, PlaywrightPlugin } from '@crawlee/browser-pool';
import playwright, { Page } from 'playwright';
import { DispatchResult } from '../state-management/dispatch-result';
import { writeFile } from 'node:fs';

export const browserPool = new BrowserPool({
    browserPlugins: [
        new PlaywrightPlugin(playwright.chromium, {
            launchOptions: {
                headless: false,
            },
        }),
    ],
});

export class BrowserController {
    private page: Page | null = null;
    private initializing: Promise<void> | null = null;

    constructor() {}

    async init(): Promise<void> {
        if (this.page) return;

        if (!this.initializing) {
            this.initializing = (async () => {
                this.page = await browserPool.newPage();
            })();
        }

        await this.initializing;
    }

    private async ensurePage(): Promise<Page> {
        if (!this.page) {
            await this.init();
        }

        if (!this.page) {
            throw new Error('Failed to initialize page');
        }

        return this.page;
    }

    async navigate(url: string): Promise<DispatchResult> {
        const page = await this.ensurePage();
        const res = await page.goto(url);

        if(!res) {
            return {
                success: false,
                error: `Failed to navigate to ${url}`
            };
        }

        const isFinished = await res.finished();
        if(isFinished) {
            return {
                success: false,
                error: `Failed to navigate to ${url}. Here's the error: ${isFinished}`
            };
        }

        const isOk = res.ok();
        if(!isOk) {
            return {
                success: false,
                error: `Website response was not successful`
            }
        }

        return {
            success: true,
            message: `navigate to ${url}`
        };
    }

    async showCode(fileName: string): Promise<DispatchResult> {
        const page = await this.ensurePage();
        const res = await page.content();
        const finalFileName = fileName.replace('--', '');

        writeFile(`${finalFileName}.html`, res, 'utf8', (err) => {
            if(err) {
                return {
                    success: false,
                    error: `Failed to save html to file`
                }
            }
        });

        return {
            success: true,
            message: `Here's the code: ${res}`
        }
    }

    async content(): Promise<string> {
        const page = await this.ensurePage();
        return page.content();
    }

    async close(): Promise<void> {
        if (this.page) {
            await this.page.close();
            this.page = null;
            this.initializing = null;
        }
    }
}
