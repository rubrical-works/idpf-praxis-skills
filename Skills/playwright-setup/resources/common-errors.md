# Common Playwright Errors and Solutions
**Version:** v0.8.0
## Installation Errors
### "Executable doesn't exist"
```
Error: Executable doesn't exist at /home/user/.cache/ms-playwright/chromium-1234/chrome-linux/chrome
```
**Cause:** Browsers not downloaded after npm install.
```bash
npx playwright install
# Or specific browser
npx playwright install chromium
```
**Prevention:** Always run `npx playwright install` after `npm install`.
### "Host system is missing dependencies"
```
Host system is missing dependencies to run browsers.
Missing libraries: libatk-1.0.so.0, libatk-bridge-2.0.so.0, ...
```
**Cause:** Linux missing required shared libraries.
```bash
npx playwright install-deps
# Or combined
npx playwright install --with-deps
```
**CI Solution:** Use `mcr.microsoft.com/playwright:v1.40.0-jammy`
### "Cannot find module '@playwright/test'"
**Cause:** Package not installed.
```bash
npm install -D @playwright/test
npm ls @playwright/test  # verify
```
### "Browser closed unexpectedly" During Install
**Cause:** Corrupted browser download or incompatible version.
```bash
npx playwright install --force
# Or clear cache and reinstall (Linux/macOS)
rm -rf ~/.cache/ms-playwright
npx playwright install
# Windows
rmdir /s /q "%USERPROFILE%\AppData\Local\ms-playwright"
npx playwright install
```
## Runtime Errors
### "browserType.launch: Timeout exceeded"
**Cause:** Browser taking too long to start, often in CI.
1. Increase launch timeout:
```javascript
const browser = await chromium.launch({ timeout: 60000 });
```
2. Ensure headless mode in CI:
```javascript
const browser = await chromium.launch({ headless: true });
```
### "Target page, context or browser has been closed"
**Cause:** Accessing page/browser after closure (navigation, race condition).
```javascript
// Bad: page might close during navigation
await page.click('a[href="/logout"]');
await page.waitForSelector('#login');
// Good: expect page might close
await Promise.all([
  page.waitForNavigation({ waitUntil: 'load' }),
  page.click('a[href="/logout"]')
]);
```
### "Timeout exceeded while waiting for selector"
**Cause:** Element doesn't appear within timeout.
```javascript
// Debug: screenshot to see page state
await page.screenshot({ path: 'debug.png' });
// Increase timeout
await page.waitForSelector('#my-element', { timeout: 60000 });
// Wait for network to settle
await page.goto(url, { waitUntil: 'networkidle' });
// Wait for visible, not just present
await page.waitForSelector('#my-element', { state: 'visible' });
```
### "Navigation timeout exceeded"
**Cause:** Page takes too long to load.
```javascript
// Increase navigation timeout
await page.goto(url, { timeout: 60000 });
// Less strict wait condition
await page.goto(url, { waitUntil: 'domcontentloaded' });
// Global timeout in config
// playwright.config.js
export default {
  timeout: 60000,
  use: { navigationTimeout: 60000 },
};
```
### Tests Hang Indefinitely
1. **Dialog not handled:**
```javascript
page.on('dialog', dialog => dialog.accept());
await page.click('#trigger-alert');
```
2. **Download not handled:**
```javascript
const [download] = await Promise.all([
  page.waitForEvent('download'),
  page.click('#download-button')
]);
await download.saveAs('./downloads/' + download.suggestedFilename());
```
3. **Popup/new tab not handled:**
```javascript
const [popup] = await Promise.all([
  page.waitForEvent('popup'),
  page.click('a[target="_blank"]')
]);
await popup.waitForLoadState();
```
### "net::ERR_CONNECTION_REFUSED"
**Cause:** Application server not running.
```javascript
// playwright.config.js - auto-start server
export default {
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
};
```
## CI-Specific Errors
### Tests Pass Locally, Fail in CI
| Cause | Solution |
|-------|----------|
| Different browser versions | Pin Playwright version, use Docker |
| Timing differences | Add explicit waits, increase timeouts |
| Missing environment variables | Check CI env configuration |
| Different screen resolution | Set viewport explicitly |
| Different OS | Use same OS in CI as local |
```javascript
// Debug: add to failing test
test.beforeEach(async ({ page }) => {
  page.on('console', msg => console.log(msg.text()));
  page.on('pageerror', err => console.log(err.message));
});
```
### "Failed to launch browser" in Docker
**Solution:** Use official Playwright image:
```dockerfile
FROM mcr.microsoft.com/playwright:v1.40.0-jammy
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
CMD ["npx", "playwright", "test"]
```
### Screenshot Shows Blank Page
```javascript
await page.waitForSelector('#main-content', { state: 'visible' });
await page.screenshot({ path: 'screenshot.png' });
// Or wait for network
await page.goto(url, { waitUntil: 'networkidle' });
await page.screenshot({ path: 'screenshot.png' });
```
## Memory and Performance Errors
### "Out of Memory" / OOM Killed
1. Reduce workers:
```javascript
export default { workers: 2 };
```
2. Close contexts properly:
```javascript
test.afterEach(async ({ context }) => { await context.close(); });
```
3. Docker workaround:
```javascript
export default {
  use: { launchOptions: { args: ['--disable-dev-shm-usage'] } }
};
```
### Tests Slow in CI
| Cause | Solution |
|-------|----------|
| Too many workers | Reduce `workers` count |
| Screenshot on every test | Only screenshot on failure |
| Video recording | Disable or record only on failure |
| Network latency | Mock API responses |
| Browser startup | Reuse browser context |
```javascript
export default {
  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
};
```
## Quick Reference
| Error Contains | Likely Fix |
|----------------|------------|
| "Executable doesn't exist" | `npx playwright install` |
| "missing dependencies" | `npx playwright install-deps` |
| "Cannot find module" | `npm install -D @playwright/test` |
| "Timeout" | Increase timeout or add waits |
| "closed unexpectedly" | `npx playwright install --force` |
| "net::ERR_" | Check server is running |
| "Target closed" | Fix race conditions |
