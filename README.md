# SiteNavigator

SiteNavigator is a TypeScript CLI tool that controls a real Chromium browser from terminal commands.
It uses Playwright (via Crawlee's `BrowserPool`) to navigate websites, inspect page elements, click elements, and move back in browser history.

## Features

- Navigate to a URL from the CLI
- Open absolute URLs or relative paths from current page (`open`)
- Show current page HTML and save it to a file
- Extract visible interactive elements and optionally save them to a file
- List interactive elements with IDs (`links`) and execute by ID (`act`)
- Follow links by partial href/text pattern (`follow`)
- Click by selector, text, href, or index (`click` modes)
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

`open <url-or-relative-path>`
- Opens an absolute URL directly
- Resolves relative paths against current page URL

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

`click --selector "<css>"`
- Clicks by CSS selector

`click --text "<text>"`
- Clicks first visible interactive element matching text

`click --href "<href-fragment>"`
- Clicks first link with matching href fragment

`click --index <id>`
- Clicks element by ID from latest `links` output

`links [--filter "<query>"]`
- Lists visible interactive elements (`a`, `button`, inputs, role=button, etc.)
- Returns stable IDs for this snapshot (used by `act`)

`act <id>`
- Clicks/navigates using ID from latest `links` result

`follow "<pattern>"`
- Finds first anchor matching text/href pattern and navigates to it

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

> links --filter iana
Found 1 interactive elements
[ { id: 0, ... } ]

> act 0
Action successful

> click --text "More information"
Action successful

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
