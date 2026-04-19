---
name: playwright-setup
description: Installation verification and troubleshooting for Playwright browser automation framework
type: invokable
version: "1.0.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-03-17"
license: Complete terms in LICENSE.txt
category: testing
relevantTechStack: [playwright, e2e, browser-testing, typescript]
copyright: "Rubrical Works (c) 2026"
---
# Playwright Setup
Installation verification, common error solutions, and CI configuration for Playwright.
## When to Use
- Setting up Playwright in a new project
- Debugging "browser not found" or install errors
- Configuring Playwright for CI/CD
- Troubleshooting tests that pass locally but fail in CI
- Onboarding to a Playwright project
## Prerequisites
- Node.js 18+
- npm or yarn
- Linux CI: system deps or Playwright Docker image
## Responsibility Acknowledgement Gate
Implements pattern from `responsibility-gate` skill (`Skills/responsibility-gate/SKILL.md`).
- **Fires before:** `npm install -D @playwright/test`, `npx playwright install`, `npx playwright install-deps`.
- **Asks:** acceptance of changes to `package.json`/`node_modules`, ~500MB browser binaries, (Linux) sudo system libs.
- **Decline:** exit cleanly; "Declined — no changes made."
- **Persistence:** per-invocation, never persisted.
Use `AskUserQuestion` with `"I accept responsibility — proceed"` and `"Decline — exit without changes"`.
## Installation Checklist
Complete setup is **three steps**, not just `npm install`:
| Step | Command | What It Does |
|------|---------|--------------|
| 1. Install package | `npm install -D @playwright/test` | Adds to devDependencies |
| 2. Download browsers | `npx playwright install` | Chromium, Firefox, WebKit (~500MB) |
| 3. System deps (Linux) | `npx playwright install-deps` | Installs system libraries (sudo) |
**Common Mistake:** Stopping after step 1 → "Executable doesn't exist" errors.
## Verification Steps
### Quick Check
```bash
npm ls @playwright/test
npx playwright install --dry-run
npx playwright test --list
```
### Browser Launch Test
```javascript
// verify-playwright.js
const { chromium, firefox, webkit } = require('playwright');

async function verify() {
  for (const browserType of [chromium, firefox, webkit]) {
    try {
      const browser = await browserType.launch();
      console.log(`${browserType.name()}: OK`);
      await browser.close();
    } catch (error) {
      console.log(`${browserType.name()}: FAILED - ${error.message}`);
    }
  }
}

verify();
```
```bash
node verify-playwright.js
```
## Common Errors
| Error Message | Cause | Fix |
|---------------|-------|-----|
| "Executable doesn't exist at ..." | Browsers not downloaded | `npx playwright install` |
| "Host system is missing dependencies" | Linux system libs missing | `npx playwright install-deps` |
| "browserType.launch: Browser closed unexpectedly" | Corrupted install | `npx playwright install --force` |
| "Cannot find module '@playwright/test'" | Package not installed | `npm install -D @playwright/test` |
| Tests hang in CI | Missing display server | Headless mode or `xvfb-run` |
| "Target page, context or browser has been closed" | Race condition | Add explicit waits |
| "Browser closed. Most likely the page has been closed" | Navigation timeout | Increase timeout or check network |
See: [common-errors.md](resources/common-errors.md).
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
- `--with-deps` combines browser download + system deps
- Upload report artifact for debugging
- `if: always()` uploads even on failure
See: [ci-patterns.md](resources/ci-patterns.md).
## Platform Notes
- **Windows:** browsers in `%USERPROFILE%\AppData\Local\ms-playwright`. No system deps. Git Bash may have issues with prompts.
- **macOS:** browsers in `~/Library/Caches/ms-playwright`. No system deps. Rosetta 2 auto for Apple Silicon.
- **Linux:** browsers in `~/.cache/ms-playwright`. System deps required: `npx playwright install-deps`. Alternative: `mcr.microsoft.com/playwright` image.
### CI Environments
| Environment | Browser Location | Notes |
|-------------|------------------|-------|
| GitHub Actions | Runner-local | Use `--with-deps` |
| GitLab CI | Docker image | Official Playwright image |
| Jenkins | Agent-local | Pre-install on agents |
| CircleCI | Docker image | Orb or Playwright image |
## Headless vs Headed Mode
```javascript
const browser = await chromium.launch();                              // Headless (CI)
const browser = await chromium.launch({ headless: false });           // Headed
const browser = await chromium.launch({ headless: false, slowMo: 100 }); // Slow motion
```
**CI:** Always headless unless using Xvfb.
## Browser Selection
```javascript
// playwright.config.js
export default {
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } },
  ],
};
```
```bash
npx playwright install chromium                # Chromium only
npx playwright install chromium --with-deps    # With system deps
```
## Troubleshooting Matrix
| Symptom | Check | Solution |
|---------|-------|----------|
| Works locally, fails in CI | Browser binaries | Add `npx playwright install` to CI |
| Works in CI, fails locally | Version mismatch | `npx playwright install --force` |
| Timeout on launch | Headless mode | Ensure `headless: true` in CI |
| Random failures | Race conditions | Add explicit `waitFor*` |
| Memory issues | Browser leaks | `browser.close()` in `afterAll` |
| Screenshot blank | Page not loaded | Wait for network idle |
## Resources
| Resource | Description |
|----------|-------------|
| [ci-patterns.md](resources/ci-patterns.md) | GitHub Actions, GitLab CI, Jenkins |
| [common-errors.md](resources/common-errors.md) | Error → fix reference |
## Related Skills
- **electron-development** — Playwright with Electron apps
