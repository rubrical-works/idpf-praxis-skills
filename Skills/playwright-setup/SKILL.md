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

Installation verification, error solutions, and CI configuration for Playwright.

## Step 0 — Re-read Config (MANDATORY)

Read `resources/playwright-setup.config.json` and validate against `resources/playwright-setup.config.schema.json` at every invocation. Config is source of truth for package name, install/verify command templates, browser list, per-platform cache locations, CI Docker image, GitHub Action pins. SKILL.md must not duplicate config values.

## When to Use

- Setting up Playwright in a new project
- Debugging "browser not found" or installation errors
- Configuring Playwright for CI/CD
- Tests pass locally but fail in CI
- Onboarding team members

## Prerequisites

- Node.js `prerequisites.nodeMinimumMajor`+ (from config — currently 18)
- npm or yarn
- For Linux CI: system deps or Docker with `ci.dockerImage` (from config)

---

## Responsibility Acknowledgement Gate

Implements pattern from **`responsibility-gate`** skill. See `Skills/responsibility-gate/SKILL.md` for full contract.

- **When this fires:** before `npm install -D @playwright/test`, `npx playwright install`, or `npx playwright install-deps`.
- **What is asked:** acceptance for changes to `package.json`/`node_modules`, ~500MB browser binaries, and (Linux) sudo system libraries.
- **On decline:** exit cleanly; report "Declined — no changes made."; make no system changes.
- **Persistence:** per-invocation. Re-fires every invocation; never persisted.

Use `AskUserQuestion` with required options (`"I accept responsibility — proceed"` and `"Decline — exit without changes"`).

---

## Installation Checklist

Complete setup requires **three steps**, not just `npm install`. Commands from config (`install.*`):

| Step | Config field | What It Does |
|------|-------------|--------------|
| 1. Install package | `install.installPackageCommand` (substitute `{package}` with `install.package`) | Adds Playwright to devDependencies |
| 2. Download browsers | `install.installBrowsersCommand` | Downloads browsers in `browsers` (~500MB) |
| 3. System deps (Linux) | `install.installSystemDepsCommand` | Installs system libs (sudo) |

For CI, prefer `install.installWithDepsCommand` (combines 2 and 3).

**Common Mistake:** Stopping after step 1 → "Executable doesn't exist" errors.

---

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

---

## Common Errors

| Error Message | Cause | Fix |
|---------------|-------|-----|
| "Executable doesn't exist at ..." | Browsers not downloaded | `npx playwright install` |
| "Host system is missing dependencies" | Linux system libs missing | `npx playwright install-deps` |
| "browserType.launch: Browser closed unexpectedly" | Corrupted install | `npx playwright install --force` |
| "Cannot find module '@playwright/test'" | Package not installed | `npm install -D @playwright/test` |
| Tests hang in CI | Missing display server (Linux) | Headless mode or `xvfb-run` |
| "Target page, context or browser has been closed" | Race condition | Add explicit waits |
| "Browser closed. Most likely the page has been closed" | Navigation timeout | Increase timeout or check network |

See: [common-errors.md](resources/common-errors.md).

---

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
- Upload report artifact for debugging
- `if: always()` uploads even on failure

See: [ci-patterns.md](resources/ci-patterns.md) for GitLab CI and others.

---

## Platform Notes

### Windows
- Browsers: `%USERPROFILE%\AppData\Local\ms-playwright`
- No system deps needed
- Git Bash may have issues with interactive prompts

### macOS
- Browsers: `~/Library/Caches/ms-playwright`
- No system deps needed
- Rosetta 2 required for Apple Silicon (automatic)

### Linux
- Browsers: `~/.cache/ms-playwright`
- System deps **required** — `npx playwright install-deps`
- Docker alternative: `mcr.microsoft.com/playwright`

### CI Environments

| Environment | Browser Location | Notes |
|-------------|------------------|-------|
| GitHub Actions | Runner-local | Use `--with-deps` |
| GitLab CI | Docker image | Use official Playwright image |
| Jenkins | Agent-local | Pre-install on agents |
| CircleCI | Docker image | Use orb or Playwright image |

---

## Headless vs Headed

```javascript
// Headless (default, for CI)
const browser = await chromium.launch();

// Headed (debugging)
const browser = await chromium.launch({ headless: false });

// Slow motion (demos)
const browser = await chromium.launch({ headless: false, slowMo: 100 });
```

**CI Requirement:** Always headless in CI unless using Xvfb.

---

## Browser Selection

### Test-Specific Browsers

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

### Install Specific Browsers Only

```bash
npx playwright install chromium
npx playwright install chromium --with-deps
```

---

## Troubleshooting Matrix

| Symptom | Check | Solution |
|---------|-------|----------|
| Works locally, fails in CI | Browser binaries | Add `npx playwright install` to CI |
| Works in CI, fails locally | Version mismatch | `npx playwright install --force` |
| Timeout on launch | Headless mode | Ensure `headless: true` in CI |
| Random failures | Race conditions | Add explicit `waitFor*` calls |
| Memory issues | Browser leaks | Ensure `browser.close()` in `afterAll` |
| Screenshot blank | Page not loaded | Wait for network idle |

---

## Resources

| Resource | Description |
|----------|-------------|
| `resources/playwright-setup.config.json` | Volatile knobs (install/verify templates, browser list, cache paths, CI pins). Re-read every invocation. |
| `resources/playwright-setup.config.schema.json` | JSON Schema validating the config. |
| [ci-patterns.md](resources/ci-patterns.md) | GitHub Actions, GitLab CI, Jenkins configs |
| [common-errors.md](resources/common-errors.md) | Detailed error → fix reference |
| `docs/playwright-setup-rationale.md` | Original prose rationale. |

---

## Related Skills

- **electron-development** — Playwright with Electron apps (fuse config, packaged app testing)
