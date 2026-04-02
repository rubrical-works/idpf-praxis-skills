---
name: playwright-explorer
description: Interactive browser exploration using Playwright with natural language interaction, DOM reading, and session management
type: invokable
version: "1.0.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-03-17"
license: Complete terms in LICENSE.txt
category: testing
relevantTechStack: [playwright, e2e, browser-testing, web-app, frontend]
copyright: "Rubrical Works (c) 2026"
---
# Playwright Explorer
Interactive browser exploration via Playwright: natural language DOM inspection, element interaction, session management. Requires Node.js 18+, running dev server, Playwright/Chromium (auto-installed if missing).
## When to Use
- Exploring a running web app interactively
- Inspecting DOM structure, visible text, or interactive elements
- Natural language browser interactions (click, fill, navigate)
- Debugging UI issues with live inspection
- Verifying UI state during development
## Modules
| Module | Purpose |
|--------|---------|
| `preflight.js` | Detects and installs required components |
| `detect-components.js` | Detects Node.js, Playwright, Chromium, system deps |
| `auto-install.js` | Installs missing components (user confirmation required) |
| `browser-connection.js` | URL/CDP connection with dev server auto-detection |
| `dom-reader.js` | Extracts visible text, interactive elements, layout, styles, test IDs |
| `nl-interaction.js` | Natural language actions with priority-based selectors |
| `session-lifecycle.js` | Background persistence, file-based IPC, health checks |
| `error-recovery.js` | Crash handling, timeout recovery, orphan cleanup |
## Workflow
1. **Pre-Flight:** `preflight.verifyAll()` detects/installs Node.js 18+, `@playwright/test`, Chromium, system deps
2. **Connect:** `browser-connection.connect()` with URL or auto-detect ports (3000, 5173, 8080, 4200, 8000, 4000, 3001)
3. **Explore:**
   - **Read DOM** -- `extractVisibleText()`, `extractInteractiveElements()`, `extractTestIds()`
   - **Interact** -- `executeAction()`: click, fill, type, goto, goBack, waitForSelector
   - **Selector priority** -- data-testid > ARIA role > visible text > CSS
4. **Sessions:** File-based IPC (`.tmp-pw-cmd.json`, `.tmp-pw-result.json`). Health checks detect stale sessions. Recovery handles crashes, timeouts, connection loss.
## Error Handling
All modules return `success`/`error` fields. Recovery: app crashes, timeouts (30s nav, 10s element), orphaned processes, connection loss.
