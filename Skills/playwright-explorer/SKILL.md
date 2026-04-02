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
Interactive browser exploration connecting to running web apps via Playwright for natural language-driven DOM inspection, element interaction, and session management.
## Prerequisites
Node.js 18+, a running web application (dev server), Playwright and Chromium (auto-installed if missing).
## Modules
| Module | Purpose |
|--------|---------|
| `preflight.js` | Pre-flight verification — detects and installs required components |
| `detect-components.js` | Detects Node.js, Playwright, Chromium, system deps |
| `auto-install.js` | Installs missing components (package install requires user confirmation) |
| `browser-connection.js` | URL and CDP browser connection with dev server auto-detection |
| `dom-reader.js` | Extracts visible text, interactive elements, layout, styles, test IDs |
| `nl-interaction.js` | Natural language action execution with priority-based selector resolution |
| `session-lifecycle.js` | Background process persistence, file-based IPC, health checks, cleanup |
| `error-recovery.js` | Crash handling, timeout recovery, orphaned process cleanup |
## Workflow
### 1. Pre-Flight Check
Run `preflight.verifyAll()` to detect: Node.js 18+, `@playwright/test`, Chromium binary, system deps (Linux). Missing components auto-installed (packages require user confirmation).
### 2. Connect to Application
Use `browser-connection.connect()` with target URL or auto-detect common dev server ports (3000, 5173, 8080, 4200, 8000, 4000, 3001).
### 3. Explore
- Read DOM — `dom-reader.extractVisibleText()`, `extractInteractiveElements()`, `extractTestIds()`
- Interact — `nl-interaction.executeAction()` supports click, fill, type, goto, goBack, waitForSelector
- Selector priority — data-testid > ARIA role > visible text > CSS
### 4. Session Management
Sessions persist via file-based IPC (`.tmp-pw-cmd.json`, `.tmp-pw-result.json`). Health checks detect stale sessions. Error recovery handles crashes, timeouts, connection loss with automatic cleanup.
## Error Handling
All modules return structured results with `success`/`error` fields. Recovery handles: target app crashes (page close/error), action timeouts (30s navigation, 10s element), orphaned browser processes and temp files, connection loss with reconnection guidance.