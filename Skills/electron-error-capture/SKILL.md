---
name: electron-error-capture
description: Interactive error capture harness for Electron apps. Launches the app headed via Playwright, records page errors, console errors and warnings, renderer crashes and main-process stderr while a human drives the app by hand, and writes a timestamped markdown + JSON report with screenshots. For exploratory testing and bug reproduction, where errors are transient in DevTools and E2E tests cannot explore freely.
type: invokable
version: "1.0.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-09-12"
license: Complete terms in LICENSE.txt
category: testing
relevantTechStack: [electron, playwright, e2e, debugging]
keywords: [error capture, capture session, pageerror, debug session, renderer crash, unhandled rejection, csp violation, ipc failure]
copyright: "Rubrical Works (c) 2026"
---
# Electron Error Capture
A capture session for an Electron app you drive **by hand**. The app launches headed under Playwright, every error is recorded as it happens, and on exit you get a report to paste into a bug.
## When to Use This Skill
When the errors you care about are **transient** — seen scrolling past in DevTools while clicking around, gone before you can act. Fills the gap between DevTools (ephemeral, needs watching) and E2E tests (scripted, cannot explore). Typical: reproducing a bug, exploring intermittent misbehaviour, sweeping before a release.
## What This Is Not
| Skill | Why it is not this |
|-------|--------------------|
| `playwright-explorer` | Web app by URL/CDP, Claude-driven — different target and different actor |
| `playwright-setup` | Installation only. **This skill installs nothing** and points there when Playwright is missing |
| `electron-development` | Reference patterns incl. `_electron.launch` snippets — knowledge, not a harness: no listener wiring, no capture, no report |
**#276 (E2E Flake Diagnosis)** names this harness as one instrument on its checklist — a consumer, not an overlap. That one for *why does this test flake*; this one for *what is this app actually throwing*.
## Prerequisites
`@playwright/test` must resolve from the target project, and the project must have an Electron binary (normally `require('electron')`).
The skill **installs nothing**. If Playwright does not resolve the script stops and points at `playwright-setup` — installing a browser runtime as a side effect of asking for an error report is a surprise, and that skill owns the platform cases this harness does not know.
## Workflow
### Step 0 — Re-read config
Read `resources/electron-error-capture.config.json` from disk, validate against `resources/electron-error-capture.config.schema.json`, and use only values from the parsed config below — not memory, not values quoted here. It carries everything that drifts: output filenames, launch timeout, entry candidates, per-platform binary fallbacks, the listener list, the classification patterns.
### Step 1 — Launch
```bash
node ${CLAUDE_SKILL_DIR}/scripts/capture-session.mjs
```
Run from the **target project's root**. Playwright and Electron resolve from the working directory, not the skill directory — the skill sits under `.claude/skills/`, which has no `node_modules` of its own.
### Step 2 — Drive the app
Interact normally. Every error is written to the session log as it arrives, so the terminal can be watched while you work.
### Step 3 — Stop
Press Ctrl+C, or close the app window. The report is generated on either path.
## Flags
| Flag | Default | Meaning |
|------|---------|---------|
| `--entry <path>` | first existing `launch.entryCandidates` | App main script |
| `--bin <path>` | `require('electron')`, else `binaryResolution.relativeToPackage` | Electron binary |
| `--screenshots` / `--no-screenshots` | on | Screenshot per error-class entry |
| `--warnings` | off | Also record `console.warn`. **Not** counted as errors |
| `--output <dir>` | `output.defaultDir` | Root for session directories |
| `--timeout <ms>` | `launch.defaultTimeoutMs` | Launch timeout. Raise when `electron.launch()` hangs — usually the `EnableNodeCliInspectArguments` fuse is off |
| `--args <...>` | none | Everything after goes to the **app**, verbatim |
`--args` is a terminator, not a value flag: an app with its own `--output` would otherwise be unlaunchable. `--flag value` and `--flag=value` both work. An unknown flag is an error, never ignored — a mistyped `--warning` would run a session recording no warnings that reads exactly like one that had none.
## Output
```
<output>/<timestamp>/
    report.md       human-readable report
    report.json     same content, structured
    error-1.png     screenshot per error-class entry
    session.log     timestamped line-by-line log
```
Timestamped, so previous sessions are preserved.
## Capture Channels — observed vs inferred
**This distinction is the point, and the report preserves it.** Five channels are real hooks; three are patterns matched over what those hooks emit. Presenting all eight alike would claim coverage the harness does not have.
**Observed — five listeners** (`listeners` in the config; each names its hook, so the claim is checkable against the script):
| Channel | Hook |
|---------|------|
| Page errors | `window.on('pageerror')` |
| Console errors | `window.on('console')`, `type() === 'error'` |
| Console warnings | `window.on('console')`, `type() === 'warning'` — opt-in via `--warnings` |
| Renderer crashes | `window.on('crash')` |
| Main process | `app.process().stderr` |
**Inferred — three derived classifications** (`derivedClassifications`): unhandled promise rejections, IPC failures, CSP violations. None has a listener of its own. Each declares `appliesTo` (channels it may fire on) and `patterns` — config, not code.
A zero on an observed channel is evidence of absence. A zero on a derived classification means **no captured line matched the patterns**, not that no such failure occurred. The report says so in as many words.
## Extending the classifications
Add an entry to `derivedClassifications`. Narrow `appliesTo` to channels the message can genuinely arrive on, or a console line quoting stderr is reclassified as one. `patterns` must be non-empty — the schema enforces it, since a classification with none can never fire and reports as clean rather than broken. `flags` accepts `i`, `m`, `s`, `u`; `g` is excluded, because a global regex carries `lastIndex` between calls and matches every other line.
## Structure
| Path | Purpose |
|------|---------|
| `scripts/capture-session.mjs` | Shell: Playwright wiring and all I/O. ESM, because `_electron` is |
| `lib/capture-core.js` | Decisions: flags, classification, rendering. CommonJS, so testable without Electron, Playwright or a person |
| `resources/*.config.json` / `.schema.json` | Everything that drifts, and its schema |
Decisions in `lib/`, I/O in `scripts/`. Logic that cannot be required is logic nobody tests.
