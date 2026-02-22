# SiteNavigator Command Use Cases

This document gives complete, end-to-end use cases for every SiteNavigator command, with practical examples.

## Before You Start

1. Install dependencies:

```bash
npm install
```

2. Start the CLI:

```bash
npm run dev
```

3. Commands that require a loaded page:

`show`, `input`, `click`, `links`, `follow`, `act`, `wait`, `move back`, `move forward`, `reload`, `print`, and `screenshot` only work after a successful `navigate` or `open`.

## 1) `navigate <url>`

Purpose: Open a full HTTP/HTTPS URL and initialize a page session.

Use case: Start a fresh workflow on a known website.

End-to-end:
1. Run `navigate https://example.com`.
2. Browser opens the URL.
3. You can now run page-dependent commands.

Example:

```text
> navigate https://example.com
navigate to https://example.com/
```

## 2) `open <url-or-relative-path>`

Purpose: Open an absolute URL or resolve a relative path from current page URL.

Use case: Jump to sub-pages quickly without manually building full URLs.

End-to-end:
1. Start from a page (for relative paths).
2. Run `open /docs` or `open https://site.com/docs`.
3. CLI resolves and opens the target.

Examples:

```text
> open /about
> open https://example.com/contact
```

## 3) `show code --<fileName>`

Purpose: Save current page HTML to `<fileName>.html`.

Use case: Inspect markup offline, debug selectors, archive page state.

End-to-end:
1. Load target page.
2. Run `show code --home-snapshot`.
3. Open `home-snapshot.html` in the project folder.

Example:

```text
> show code --home-snapshot
Check home-snapshot.html, you'll find code there.
```

## 4) `show elements [--<fileName>]`

Purpose: Extract visible interactive elements (`a`, `button`, `input`, etc.).

Use case: Discover clickable targets before running `click`, `follow`, or `act`.

End-to-end:
1. Load page.
2. Run `show elements` to print in terminal.
3. Optional: run `show elements --elements-home` to save as `elements-home.js`.

Examples:

```text
> show elements
Extracted 12 elements

> show elements --elements-home
Extracted 12 elements
```

## 5) `links [--filter "<query>"]`

Purpose: List interactive elements with stable IDs for this snapshot.

Use case: Build a deterministic action list and then execute by ID using `act` or `click --index`.

End-to-end:
1. Run `links`.
2. Read returned items with IDs.
3. Run `act <id>` on chosen item.

Examples:

```text
> links
Found 20 interactive elements

> links --filter pricing
Found 2 interactive elements
```

## 6) `act <id>`

Purpose: Execute interaction by ID from latest `links` output.

Use case: Reliable automation when text/selectors are dynamic but list IDs are known.

End-to-end:
1. Run `links`.
2. Choose an ID.
3. Run `act 3`.
4. Optional: verify with `print url`.

Example:

```text
> links --filter docs
Found 3 interactive elements

> act 1
Action successful
```

## 7) `follow "<pattern>"`

Purpose: Find first matching anchor by text/href pattern and navigate.

Use case: Human-like navigation without exact selector knowledge.

End-to-end:
1. Run `follow "blog"`.
2. CLI scans anchors and picks first match.
3. Browser navigates to that link.

Example:

```text
> follow "careers"
Followed link using pattern: careers
```

## 8) `click <selector>`

Purpose: Click first element matching a CSS selector.

Use case: Fast direct click when you already know selector.

End-to-end:
1. Identify selector via HTML or browser devtools.
2. Run `click .cta-primary`.
3. CLI clicks and reports action result.

Example:

```text
> click "a.more-info"
Action successful
```

## 9) `input <field> <value> ... <submit-button-text>`

Purpose: Fill multiple form fields and submit by matching button text.

Use case: Login/signup/checkout forms where you know field names and submit label.

End-to-end:
1. Load a page containing the form.
2. Run `input` with field-value pairs.
3. Pass submit button text as the final argument.
4. CLI fills fields and clicks the submit control.

Example:

```text
> input username "john" password "s3cr3t" "Log in"
Action successful
```

Alternative targeting modes:
- `--selector <css> <value>` for explicit CSS targeting
- `--index <id> <value>` where `id` comes from latest `links` output

Examples:

```text
> input --selector "#email" "john@example.com" --selector "#password" "s3cr3t" "Log in"
Action successful

> links
Found 15 interactive elements

> input --index 4 "john@example.com" --index 7 "s3cr3t" "Log in"
Action successful
```

## 10) `click --selector "<css>"`

Purpose: Explicit selector-mode click.

Use case: Same as `click <selector>`, but clearer for scripted logs.

Example:

```text
> click --selector "button[type='submit']"
Action successful
```

## 11) `click --text "<text>"`

Purpose: Click first visible interactive element with matching text.

Use case: Works well when classes/ids are unstable but label text is stable.

Example:

```text
> click --text "Get Started"
Action successful
```

## 12) `click --href "<href-fragment>"`

Purpose: Click first link whose `href` contains given fragment.

Use case: Safe targeting by URL pattern.

Example:

```text
> click --href "/pricing"
Action successful
```

## 13) `click --index <id>`

Purpose: Click by ID from last cached interactive list.

Use case: ID-based actions after `links` or previous index cache.

End-to-end:
1. Run `links`.
2. Run `click --index 0`.

Example:

```text
> links --filter contact
Found 1 interactive elements

> click --index 0
Action successful
```

## 14) `wait url "<pattern>" [--timeout <ms>]`

Purpose: Wait until current URL contains a pattern.

Use case: Synchronize after clicks/redirects in dynamic apps.

End-to-end:
1. Trigger navigation (`click`, `follow`, or `open`).
2. Run `wait url "/checkout" --timeout 15000`.
3. Continue only after URL condition is satisfied.

Example:

```text
> click --text "Checkout"
Action successful

> wait url "/checkout" --timeout 15000
Waited for URL pattern: /checkout
```

## 15) `wait selector "<css>" [--state attached|detached|visible|hidden] [--timeout <ms>]`

Purpose: Wait for element lifecycle state.

Use case: Ensure elements are ready before interaction, or spinners disappear.

End-to-end:
1. Trigger UI update.
2. Run a selector wait with desired state.
3. Proceed when state condition matches.

Examples:

```text
> wait selector ".results" --state visible --timeout 10000
Waited for selector: .results

> wait selector ".loading-spinner" --state hidden --timeout 20000
Waited for selector: .loading-spinner
```

## 16) `move back`

Purpose: Move one step back in browser history.

Use case: Return to previous listing page after visiting detail page.

Example:

```text
> move back
Moved back successfully
```

## 17) `move forward`

Purpose: Move one step forward in browser history.

Use case: Re-visit the page you moved back from.

Example:

```text
> move forward
Moved forward successfully
```

## 18) `reload`

Purpose: Reload current page.

Use case: Refresh dynamic data or recover from partial render state.

Example:

```text
> reload
Reloaded successfully
```

## 19) `print url`

Purpose: Print current page URL.

Use case: Assert current navigation state during scripts/manual sessions.

Example:

```text
> print url
https://example.com/pricing
```

## 20) `print title`

Purpose: Print current page title.

Use case: Validate you reached the expected page template.

Example:

```text
> print title
Pricing - Example
```

## 21) `screenshot --<fileName>`

Purpose: Save a viewport screenshot to `<fileName>.png`.

Use case: Test evidence, visual regression checks, bug reports.

End-to-end:
1. Navigate to target page/state.
2. Optionally `wait selector` for UI readiness.
3. Run `screenshot --pricing-page`.
4. Verify `pricing-page.png` exists.

Example:

```text
> screenshot --pricing-page
Screenshot saved: pricing-page.png
```

## 22) `help`

Purpose: Print available commands.

Use case: Quick lookup during interactive usage.

Example:

```text
> help
Available commands: navigate, open, show, input, links, follow, act, wait, click, move back, move forward, reload, print url, print title, screenshot, help, exit
```

## 23) `exit`

Purpose: End the CLI session.

Use case: Cleanly stop interactive run.

Example:

```text
> exit
Goodbye!
```

## Full End-to-End Example 1 (Discovery to Action)

```text
> navigate https://example.com
> input username "demo" password "demo123" "Log in"
> show elements
> links --filter more
> act 0
> wait selector "h1" --state visible --timeout 8000
> print title
> screenshot --example-final
```

What this does:
1. Opens site.
2. Submits a form using named fields.
3. Discovers interactive elements.
4. Filters likely target.
5. Executes action by ID.
6. Waits for content readiness.
7. Verifies page title.
8. Captures final screenshot.

## Full End-to-End Example 2 (Text + URL Synchronization)

```text
> navigate https://example.com
> click --text "More information"
> wait url "iana"
> print url
> show code --after-navigation
```

What this does:
1. Loads start page.
2. Clicks by visible label.
3. Waits for URL pattern to confirm navigation.
4. Prints URL for audit.
5. Saves resulting HTML snapshot.

## Full End-to-End Example 3 (History + Refresh)

```text
> navigate https://example.com
> open /
> follow "more"
> move back
> move forward
> reload
> screenshot --history-check
```

What this does:
1. Starts session.
2. Opens relative path.
3. Follows matching link.
4. Goes back and forward in history.
5. Reloads final page.
6. Saves screenshot proof.

## Common Mistakes and Fixes

1. Error: `No page loaded. Use 'navigate <url>' first.`
Fix: Start with `navigate` (or `open`) before page-dependent commands.

2. Error: `No cached element list found. Run links first.`
Fix: Run `links` before `act <id>`.

3. Wait timeout failures.
Fix: Increase `--timeout`, verify selector correctness, or use `wait url` if navigation is expected.

4. Wrong element clicked by text.
Fix: Use more specific text, `click --selector`, or `links` + `act` for deterministic targeting.

5. Error: `input format: input <field> <value> ... <submit button text>`
Fix: Ensure the last argument is submit text and all earlier arguments are valid field/value pairs.
