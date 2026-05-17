---
name: playwright-setup
description: Installation verification and troubleshooting for Playwright browser automation framework
type: invokable
version: "2.0.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-04-25"
license: Complete terms in LICENSE.txt
category: testing
relevantTechStack: [playwright, e2e, browser-testing, typescript]
copyright: "Rubrical Works (c) 2026"
---
# Playwright Setup
Provides installation verification, common error solutions, and CI configuration patterns for Playwright browser automation framework.
## Step 0 — Re-read Config (MANDATORY)
Read `resources/playwright-setup.config.json` from disk and validate against `resources/playwright-setup.config.schema.json` at start of every invocation. Config is source of truth for Playwright package name, install/verify command templates, supported browser list, per-platform browser cache locations, CI Docker image, GitHub Action version pins. SKILL.md must not duplicate values.
## When to Use This Skill
Invoke when:
- Setting up Playwright in a new project
- Debugging "browser not found" or installation errors
- Configuring Playwright for CI/CD pipelines
- Troubleshooting tests that pass locally but fail in CI
- Onboarding team members to a Playwright project
## Prerequisites
- Node.js `prerequisites.nodeMinimumMajor`+ (from config — currently 18)
- npm or yarn package manager
- For Linux CI: System dependencies or Docker with `ci.dockerImage` (from config)
## Responsibility Acknowledgement Gate
Implements pattern in **`responsibility-gate`** skill. See `Skills/responsibility-gate/SKILL.md`.
- **When this fires:** before running `npm install -D @playwright/test`, `npx playwright install`, or `npx playwright install-deps` to install Playwright and its browser binaries.
- **What is asked:** acceptance of responsibility for change to `package.json`/`node_modules`, the ~500MB of downloaded browser binaries, and (on Linux) system-level library packages installed via sudo.
- **On decline:** exit cleanly; report "Declined — no changes made."; no system changes.
- **Persistence:** per-invocation; never persisted.
Use `AskUserQuestion` with two required options (`"I accept responsibility — proceed"` and `"Decline — exit without changes"`).
## Installation Checklist
Complete Playwright setup requires **three steps**, not just `npm install`. Commands come from config (`install.*`):
| Step | Config field | What It Does |
|------|-------------|--------------|
| 1. Install package | `install.installPackageCommand` (substitute `{package}` with `install.package`) | Adds Playwright to devDependencies |
| 2. Download browsers | `install.installBrowsersCommand` | Downloads browsers in `browsers` (~500MB) |
| 3. System deps (Linux) | `install.installSystemDepsCommand` | Installs system libraries (requires sudo) |
For CI, prefer `install.installWithDepsCommand` which combines steps 2 and 3.
**Common Mistake:** Stopping after step 1 results in "Executable doesn't exist" errors.
## Verification Steps
### Quick Check
- Verify installed: `npm ls @playwright/test`
- List browsers: `npx playwright install --dry-run`
- Simple test: `npx playwright test --list`
### Browser Launch Test
Create minimal test (`verify-playwright.js`) that iterates `[chromium, firefox, webkit]`, calls `browserType.launch()` in try/catch, logs OK or FAILED with error message, then `browser.close()`. Run with `node verify-playwright.js`.
## Common Errors
| Error Message | Cause | Fix |
|---------------|-------|-----|
| "Executable doesn't exist at ..." | Browsers not downloaded | `npx playwright install` |
| "Host system is missing dependencies" | Linux system libs missing | `npx playwright install-deps` |
| "browserType.launch: Browser closed unexpectedly" | Corrupted browser install | `npx playwright install --force` |
| "Cannot find module '@playwright/test'" | Package not installed | `npm install -D @playwright/test` |
| Tests hang in CI | Missing display server (Linux) | Use headless mode or `xvfb-run` |
| "Target page, context or browser has been closed" | Race condition | Add explicit waits |
| "Browser closed. Most likely the page has been closed" | Navigation timeout | Increase timeout or check network |
See: [common-errors.md](resources/common-errors.md) for detailed solutions.
## CI Configuration
### GitHub Actions
```yaml
name: Playwright Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run tests
        run: npx playwright test

      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```
**Key Points:**
- `--with-deps` combines browser download and system deps
- Upload report artifact for debugging failures
- Use `if: always()` to upload even on test failure
See: [ci-patterns.md](resources/ci-patterns.md) for GitLab CI and other configurations.
## Platform Notes
### Windows
- Browsers install to `%USERPROFILE%\AppData\Local\ms-playwright`
- No system dependencies needed
- Git Bash may have issues with interactive prompts
### macOS
- Browsers install to `~/Library/Caches/ms-playwright`
- No system dependencies needed
- Rosetta 2 required for Apple Silicon (automatic)
### Linux
- Browsers install to `~/.cache/ms-playwright`
- System dependencies **required** - run `npx playwright install-deps`
- Docker alternative: Use `mcr.microsoft.com/playwright` image
### CI Environments
- GitHub Actions (Runner-local): use `--with-deps` flag
- GitLab CI (Docker image): use official Playwright image
- Jenkins (Agent-local): pre-install browsers on agents
- CircleCI (Docker image): use orb or Playwright image
## Headless vs Headed Mode
Headless (default for CI): `await chromium.launch()`. Headed (debugging): `await chromium.launch({ headless: false })`. Slow motion: `await chromium.launch({ headless: false, slowMo: 100 })`.
**CI Requirement:** Always use headless mode in CI unless using Xvfb.
## Browser Selection
### Test-Specific Browsers
In `playwright.config.js`, define `projects: [{name:'chromium', use:{browserName:'chromium'}}, {name:'firefox', use:{browserName:'firefox'}}, {name:'webkit', use:{browserName:'webkit'}}]`.
### Install Specific Browsers Only
`npx playwright install chromium` (faster CI); `npx playwright install chromium --with-deps` (with system deps).
## Troubleshooting Matrix
| Symptom | Check | Solution |
|---------|-------|----------|
| Works locally, fails in CI | Browser binaries | Add `npx playwright install` to CI |
| Works in CI, fails locally | Version mismatch | `npx playwright install --force` |
| Timeout on launch | Headless mode | Ensure `headless: true` in CI |
| Random failures | Race conditions | Add explicit `waitFor*` calls |
| Memory issues | Browser leaks | Ensure `browser.close()` in `afterAll` |
| Screenshot blank | Page not loaded | Wait for network idle |
## Resources
| Resource | Description |
|----------|-------------|
| `resources/playwright-setup.config.json` | Volatile knobs (install/verify templates, browser list, cache paths, CI action pins). Re-read at every invocation. |
| `resources/playwright-setup.config.schema.json` | JSON Schema validating the config. |
| [ci-patterns.md](resources/ci-patterns.md) | GitHub Actions, GitLab CI, Jenkins configs |
| [common-errors.md](resources/common-errors.md) | Detailed error → fix reference |
| `docs/playwright-setup-rationale.md` | Original prose rationale preserved during refurbishment. |
## Related Skills
- **electron-development** - For Playwright with Electron apps (includes fuse configuration, packaged app testing)
---
**End of Playwright Setup Skill**
