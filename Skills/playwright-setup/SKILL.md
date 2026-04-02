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
Installation verification, error solutions, and CI config for Playwright. Prereqs: Node.js 18+, npm/yarn, Linux CI needs system deps or Docker.
## Installation Checklist
| Step | Command | What It Does |
|------|---------|--------------|
| 1. Install | `npm install -D @playwright/test` | Adds to devDependencies |
| 2. Browsers | `npx playwright install` | Downloads Chromium, Firefox, WebKit (~500MB) |
| 3. Sys deps | `npx playwright install-deps` | Linux system libraries (requires sudo) |
Stopping after step 1 causes "Executable doesn't exist" errors.
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
## CI Configuration — GitHub Actions
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
- `--with-deps` combines browser download and system deps
- Upload report artifact for debugging failures
- Use `if: always()` to upload even on test failure
See: [ci-patterns.md](resources/ci-patterns.md) for GitLab CI and other configurations.
## Platform Notes
| Platform | Browser Location | Notes |
|----------|-----------------|-------|
| Windows | `%USERPROFILE%\AppData\Local\ms-playwright` | No system deps needed |
| macOS | `~/Library/Caches/ms-playwright` | No system deps; Rosetta 2 auto for Apple Silicon |
| Linux | `~/.cache/ms-playwright` | System deps **required** — `npx playwright install-deps` |
### CI Environments
| Environment | Notes |
|-------------|-------|
| GitHub Actions | Use `--with-deps` flag |
| GitLab CI | Use official Playwright Docker image |
| Jenkins | Pre-install browsers on agents |
| CircleCI | Use orb or Playwright image |
## Headless vs Headed Mode
```javascript
const browser = await chromium.launch();                          // Headless (default, for CI)
const browser = await chromium.launch({ headless: false });       // Headed (debugging)
const browser = await chromium.launch({ headless: false, slowMo: 100 }); // Slow motion (demos)
```
**CI Requirement:** Always use headless mode in CI unless using Xvfb.
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
npx playwright install chromium              # Install only Chromium (faster CI)
npx playwright install chromium --with-deps  # Chromium with system deps
```
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
| [ci-patterns.md](resources/ci-patterns.md) | GitHub Actions, GitLab CI, Jenkins configs |
| [common-errors.md](resources/common-errors.md) | Detailed error to fix reference |
