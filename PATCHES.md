# Fork patches (v0.2.1-iris.1)

Fork of `@striderlabs/mcp-walmart` 0.2.1. The repo's `src/` is stale 0.1.0
(upstream never published 0.2.1 source), so **`dist/` is the authoritative,
hand-patched artifact** — do not rebuild from `src/`.

## Why

Walmart's PerimeterX bot detection blocked most tool calls (login, add_to_cart,
set_address) as published. Verified fixes, 2026-07-04:

## dist/browser.js (rewritten)

- `launchPersistentContext` with a real profile dir (`~/.striderlabs/walmart/profile/`)
  so PerimeterX trust earned by solving one challenge persists across restarts;
  seeds the profile from legacy `cookies.json` on first run
- Real Chrome (`channel: "chrome"`) with bundled-Chromium fallback
- Removed spoofed Chrome-120 user agent, JS stealth init script, and
  Chicago timezone/geolocation spoofing — all were detectable mismatches
- Always headful: headless is the strongest bot signal, and a visible window
  lets the user solve challenges
- `withPage` detects the "Robot or human?" page, leaves the tab open for the
  user to solve, and raises a clear retry message

## dist/index.js (targeted edits)

- Broader add-to-cart and location-picker selectors for current walmart.com
- quantity > 1: clicks the "+" stepper after the first add (stepper only
  renders post-add)
- Login waits: email field 300s, password 120s, post-submit `waitForURL` 120s
  (room for challenges/OTP solved manually)

## Running

`node dist/index.js` (stdio MCP server). `npm install` first for deps.
