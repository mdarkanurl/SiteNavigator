# SiteNavigator

SiteNavigator is a TypeScript CLI tool that controls a real Chromium browser from terminal commands.
It uses Playwright (via Crawlee's `BrowserPool`) to navigate websites, inspect page elements, click elements, and move back in browser history.

## Features

- Navigate to a URL from the CLI
- Show current page HTML and save it to a file
- Extract visible interactive elements and optionally save them to a file
- Click an element by CSS selector
- Move one step back in browser history (`move back`)
- Move one step forward in browser history (`move forward`)
- Reload the current page (`reload`)
- Print current page URL (`print url`)
- Print current page title (`print title`)
- Save current viewport screenshot (`screenshot --<fileName>`)
- Simple command parsing + state guard to prevent actions before a page is loaded

## Tech Stack

- Node.js + TypeScript
- Playwright
- `@crawlee/browser-pool`
- `readline` for the interactive CLI loop

## Requirements

- Node.js 18+
- npm or pnpm

## Installation

```bash
npm install
```

If you prefer pnpm:

```bash
pnpm install
```

## Run

Development mode:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Run built output:

```bash
npm start
```

## CLI Commands

`navigate <url>`
- Opens the URL in the browser
- Only `http` and `https` are accepted

`show code --<fileName>`
- Gets current page HTML
- Saves to `<fileName>.html`

`show elements [--<fileName>]`
- Extracts visible interactive elements (`a`, `button`, `input`, etc.)
- Prints them in terminal
- If file is provided, saves JSON to `<fileName>.js`

`click <selector>`
- Clicks first matching element for the selector
- Returns whether navigation happened

`move back`
- Moves one step back in browser history

`move forward`
- Moves one step forward in browser history

`reload`
- Reloads the current page

`print url`
- Prints current page URL

`print title`
- Prints current page title

`screenshot --<fileName>`
- Saves current viewport image to `<fileName>.png`

`help`
- Prints available commands

`exit`
- Closes CLI session

## Example Session

```text
> navigate https://example.com
navigate to https://example.com/

> show elements
Extracted 3 elements
[ ... ]

> click a[href="https://www.iana.org/domains/example"]
Click successful

> move back
Moved back successfully

> show code --example-home
Check example-home.html, you'll find code there.

> exit
Goodbye!
```

## Notes and Current Behavior

- Browser launches in headed mode (`headless: false`).
- `SHOW`, `CLICK`, `MOVE_BACK`, `MOVE_FORWARD`, `RELOAD`, `PRINT`, and `SCREENSHOT` are blocked until at least one successful `navigate` command is issued.
- `Dockerfile` exists but is currently empty.
- Project currently has no automated tests (`npm test` is a placeholder).

## License

MIT (`LICENSE`).
