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
        let res: playwright.Response | null = null;
        try {
            res = await page.goto(url);
        } catch (error) {
            return {
                success: false,
                error: `Failed to navigate to ${url}`
            };
        }

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
            message: `Check ${finalFileName}.html, you'll find code there.`
        }
    }

    async getAllElements(fileName: string | null): Promise<DispatchResult> {
        const page = await this.ensurePage();
        const elements = await page.evaluate(() => {

            function getSelector(el: Element): string {

                // best case: ID (unique)
                if (el.id) {
                    return `#${el.id}`;
                }

                // second best: name attribute
                const name = el.getAttribute("name");
                if (name) {
                    return `${el.tagName.toLowerCase()}[name="${name}"]`;
                }

                // third: href (for links)
                const href = el.getAttribute("href");
                if (href) {
                    return `a[href="${href}"]`;
                }

                // fallback: class selector
                if (el.className && typeof el.className === "string") {
                    const classes = el.className.trim().split(/\s+/).join(".");
                    return `${el.tagName.toLowerCase()}.${classes}`;
                }

                // worst case: tag only
                return el.tagName.toLowerCase();
            }

            const interactive = document.querySelectorAll(`
                a,
                button,
                input,
                textarea,
                select,
                [onclick],
                [role="button"]
            `);

            return Array.from(interactive)
                .filter(el => {
                    const element = el as HTMLElement;

                    // only visible elements
                    return element.offsetParent !== null;
                })
                .map((el, index) => ({
                    index,
                    type: el.tagName.toLowerCase(),
                    text: el.textContent?.trim() || "",
                    selector: getSelector(el),
                    href: el.getAttribute("href")
                }));
        });

        if(fileName) {
            const finalFileName = fileName.replace("--", "");
            writeFile(`${finalFileName}.js`,
                JSON.stringify(elements, null, 2),
                'utf8', (err) => {
                if(err) {
                    return {
                        success: false,
                        error: `Failed to save elements to file`
                    }
                }
            });
        }

        return {
            success: true,
            message: `Extracted ${elements.length} elements`,
            data: elements
        };
    }

    async clickOnAButton(selector: string): Promise<DispatchResult> {
        const page = await this.ensurePage();

        try {
            const element = await page.$(selector);
            
            if (!element) {
                return {
                    success: false,
                    error: `Element not found: ${selector}`
                };
            }

            const locator = page.locator(selector).first();

            await locator.scrollIntoViewIfNeeded();

            await locator.waitFor({
                state: "visible",
                timeout: 10000
            });

            const oldUrl = page.url();

            await Promise.all([
                page.click(selector),
                page.waitForLoadState("domcontentloaded").catch(() => {})
            ]);

            const newUrl = page.url();

            return {
                success: true,
                message: "Click successful",
                data: {
                    selector,
                    navigated: oldUrl !== newUrl,
                    oldUrl,
                    newUrl
                }
            };

        } catch (error) {
            return {
                success: false,
                error: `Click failed.`
            };
        }
    }

    async moveBack(): Promise<DispatchResult> {
        const page = await this.ensurePage();
        const res = await page.goBack();

        if (!res) {
            return {
                success: false,
                error: `Cannot move back from the current page`
            };
        }

        return {
            success: true,
            message: `Moved back successfully`
        };
    }

    async close(): Promise<void> {
        if (this.page) {
            await this.page.close();
            this.page = null;
            this.initializing = null;
        }
    }
}
