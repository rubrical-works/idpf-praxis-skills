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
Installation verification, error solutions, and CI configuration for Playwright.
## Prerequisites
Node.js 18+, npm or yarn, Linux CI: system deps or Docker with Playwright image.
## Installation Checklist
Complete setup requires three steps, not just `npm install`:
| Step | Command | What It Does |
|------|---------|--------------|
| 1. Install package | `npm install -D @playwright/test` | Adds to devDependencies |
| 2. Download browsers | `npx playwright install` | Downloads Chromium, Firefox, WebKit (~500MB) |
| 3. System deps (Linux) | `npx playwright install-deps` | Installs system libraries (requires sudo) |
Stopping after step 1 results in "Executable doesn't exist" errors.
## Verification
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
## Common Errors
| Error | Cause | Fix |
|-------|-------|-----|
| "Executable doesn't exist at ..." | Browsers not downloaded | `npx playwright install` |
| "Host system is missing dependencies" | Linux libs missing | `npx playwright install-deps` |
| "browserType.launch: Browser closed unexpectedly" | Corrupted install | `npx playwright install --force` |
| "Cannot find module '@playwright/test'" | Not installed | `npm install -D @playwright/test` |
| Tests hang in CI | Missing display server | Headless mode or `xvfb-run` |
| "Target page, context or browser has been closed" | Race condition | Add explicit waits |
| "Browser closed. Most likely the page has been closed" | Nav timeout | Increase timeout or check network |
See [common-errors.md](resources/common-errors.md) for details.
## CI: GitHub Actions
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
`--with-deps` combines browser download and system deps. Use `if: always()` to upload report even on failure. See [ci-patterns.md](resources/ci-patterns.md) for GitLab CI and others.
## Platform Notes
Windows: browsers install to `%USERPROFILE%\AppData\Local\ms-playwright`, no system deps needed.
macOS: browsers install to `~/Library/Caches/ms-playwright`, no system deps, Rosetta 2 automatic on Apple Silicon.
Linux: browsers install to `~/.cache/ms-playwright`, system deps required via `npx playwright install-deps`, or use `mcr.microsoft.com/playwright` Docker image.
### CI Environments
| Environment | Notes |
|-------------|-------|
| GitHub Actions | Use `--with-deps` flag |
| GitLab CI | Use official Playwright Docker image |
| Jenkins | Pre-install browsers on agents |
| CircleCI | Use orb or Playwright image |
## Headless vs Headed
```javascript
const browser = await chromium.launch();                              // headless (CI)
const browser = await chromium.launch({ headless: false });           // headed (debug)
const browser = await chromium.launch({ headless: false, slowMo: 100 }); // slow motion
```
Always use headless in CI unless using Xvfb.
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
npx playwright install chromium              # single browser (faster CI)
npx playwright install chromium --with-deps  # with system deps
```
## Troubleshooting
| Symptom | Solution |
|---------|----------|
| Works locally, fails in CI | Add `npx playwright install` to CI |
| Works in CI, fails locally | `npx playwright install --force` |
| Timeout on launch | Ensure `headless: true` in CI |
| Random failures | Add `waitFor*` calls |
| Memory issues | Ensure `browser.close()` in `afterAll` |
| Screenshot blank | Wait for network idle |
## Resources
| Resource | Description |
|----------|-------------|
| [ci-patterns.md](resources/ci-patterns.md) | GitHub Actions, GitLab CI, Jenkins configs |
| [common-errors.md](resources/common-errors.md) | Detailed error-fix reference |