# E2E Testing Packaged Electron Apps
## Problem
Playwright can launch Electron two ways: **dev mode** (`args: ['.']`, starts the dev server) or **packaged mode** (`executablePath`, tests the production build). Dev mode is unreliable: the Vite dev server may not start correctly, startup timing varies, and behavior differs from production.
## Solution
Test against the **packaged executable**.
## Prerequisites
1. Run `npm run package` before E2E tests
2. Enable the `EnableNodeCliInspectArguments` fuse (see electron-fuses-playwright.md)
3. Use a no-space executable name (see electron-app-naming.md)
## Test Structure
```typescript
import { _electron as electron, ElectronApplication, Page } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';

const APP_EXECUTABLE_NAME = 'MyApp';

function getExecutablePath(): string {
  const platform = process.platform;
  // electron-forge package defaults --arch to the host arch, so the folder is
  // e.g. MyApp-darwin-arm64 on Apple Silicon and MyApp-win32-arm64 on Windows on ARM
  const outDir = path.join(__dirname, '..', 'out', `${APP_EXECUTABLE_NAME}-${platform}-${process.arch}`);

  if (platform === 'win32') {
    return path.join(outDir, `${APP_EXECUTABLE_NAME}.exe`);
  } else if (platform === 'darwin') {
    return path.join(outDir, `${APP_EXECUTABLE_NAME}.app`, 'Contents', 'MacOS', APP_EXECUTABLE_NAME);
  } else {
    return path.join(outDir, APP_EXECUTABLE_NAME.toLowerCase());
  }
}

test.describe('App Tests', () => {
  let electronApp: ElectronApplication;
  let window: Page;

  test.beforeAll(async () => {
    const executablePath = getExecutablePath();

    // Verify packaged app exists
    if (!fs.existsSync(executablePath)) {
      throw new Error(`Run 'npm run package' first. Expected: ${executablePath}`);
    }

    electronApp = await electron.launch({
      executablePath,
      timeout: 30000,
    });

    window = await electronApp.firstWindow();
    await window.waitForLoadState('domcontentloaded');
  });

  test.afterAll(async () => {
    if (electronApp) {
      await electronApp.close();
    }
  });

  // Tests use `window` to interact with the app
});
```
## Test Categories
**1. File-based tests (no app launch)** — fast, no Electron needed:
```typescript
test('icon files exist', () => {
  expect(fs.existsSync('build/icon.ico')).toBe(true);
});
```
**2. Window tests (app launch required):**
```typescript
test('window title correct', async () => {
  expect(await window.title()).toBe('My App Name');
});
```
## Playwright Configuration
```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './e2e',
  timeout: 60000,  // Longer timeout for Electron
  use: {
    trace: 'on-first-retry',
  },
});
```
## CI Considerations
Package before E2E:
```yaml
steps:
  - run: npm ci
  - run: npm run package  # Build first
  - run: npm run test:e2e  # Then test
```
## Common Issues
| Issue | Solution |
|-------|----------|
| `firstWindow()` hangs | Check fuses, DevTools not opening |
| Path not found | Verify executable name, run package first |
| Timeout on load | Increase timeout, check for startup errors |
| Different behavior | Ensure testing packaged, not dev mode |
