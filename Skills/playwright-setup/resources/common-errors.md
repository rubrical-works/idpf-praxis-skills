# Common Playwright Errors and Solutions

**Version:** v0.4.2

Detailed solutions for common Playwright installation and runtime errors.

---

## Installation Errors

### "Executable doesn't exist"

**Full Error:**
```
Error: Executable doesn't exist at /home/user/.cache/ms-playwright/chromium-1234/chrome-linux/chrome
```

**Cause:** Browsers were not downloaded after installing the npm package.

**Solution:**
```bash
# Download all browsers
npx playwright install

# Or specific browser only
npx playwright install chromium
```

**Prevention:** Always run `npx playwright install` after `npm install`.

---

### "Host system is missing dependencies"

**Full Error:**
```
Host system is missing dependencies to run browsers.
Missing libraries: libatk-1.0.so.0, libatk-bridge-2.0.so.0, ...
```

**Cause:** Linux system is missing required shared libraries.

**Solution:**
```bash
# Install system dependencies (requires sudo)
npx playwright install-deps

# Or combined with browser install
npx playwright install --with-deps
```

**CI Solution:** Use official Playwright Docker image:
```yaml
image: mcr.microsoft.com/playwright:v1.40.0-jammy
```

---

### "Cannot find module '@playwright/test'"

**Full Error:**
```
Error: Cannot find module '@playwright/test'
```

**Cause:** Playwright package not installed in project.

**Solution:**
```bash
npm install -D @playwright/test
```

**Verification:**
```bash
npm ls @playwright/test
```

---

### "Browser closed unexpectedly" During Install

**Full Error:**
```
browserType.launch: Browser closed unexpectedly
```

**Cause:** Corrupted browser download or incompatible version.

**Solution:**
```bash
# Force reinstall browsers
npx playwright install --force

# Clear cache and reinstall (Linux/macOS)
rm -rf ~/.cache/ms-playwright
npx playwright install

# Clear cache (Windows)
rmdir /s /q "%USERPROFILE%\AppData\Local\ms-playwright"
npx playwright install
```

---

## Runtime Errors

### "browserType.launch: Timeout exceeded"

**Full Error:**
```
browserType.launch: Timeout 30000ms exceeded.
```

**Cause:** Browser taking too long to start, often in CI environments.

**Solutions:**

1. **Increase launch timeout:**
```javascript
const browser = await chromium.launch({
  timeout: 60000  // 60 seconds
});
```

2. **Ensure headless mode in CI:**
```javascript
const browser = await chromium.launch({
  headless: true  // Default, but explicit is safer
});
```

3. **Check available resources:** CI runners may be overloaded.

---

### "Target page, context or browser has been closed"

**Full Error:**
```
Error: Target page, context or browser has been closed
```

**Cause:** Accessing page/browser after it was closed, often due to:
- Navigation causing page to close
- Test cleanup running during test
- Race condition

**Solution:**
```javascript
// Bad: page might close during navigation
await page.click('a[href="/logout"]');
await page.waitForSelector('#login');  // Page might be closed!

// Good: expect page might close
await Promise.all([
  page.waitForNavigation({ waitUntil: 'load' }),
  page.click('a[href="/logout"]')
]);
```

---

### "Timeout exceeded while waiting for selector"

**Full Error:**
```
Timeout 30000ms exceeded while waiting for selector "#my-element"
```

**Cause:** Element doesn't appear within timeout.

**Solutions:**

1. **Check selector is correct:**
```javascript
// Debug: take screenshot to see page state
await page.screenshot({ path: 'debug.png' });
```

2. **Increase timeout for slow pages:**
```javascript
await page.waitForSelector('#my-element', { timeout: 60000 });
```

3. **Wait for network to settle:**
```javascript
await page.goto(url, { waitUntil: 'networkidle' });
```

4. **Use more specific waiting:**
```javascript
// Wait for element to be visible, not just present
await page.waitForSelector('#my-element', { state: 'visible' });
```

---

### "Navigation timeout exceeded"

**Full Error:**
```
page.goto: Timeout 30000ms exceeded
```

**Cause:** Page takes too long to load.

**Solutions:**

1. **Increase navigation timeout:**
```javascript
await page.goto(url, { timeout: 60000 });
```

2. **Use less strict wait condition:**
```javascript
// Don't wait for all resources
await page.goto(url, { waitUntil: 'domcontentloaded' });
```

3. **Global timeout in config:**
```javascript
// playwright.config.js
export default {
  timeout: 60000,
  use: {
    navigationTimeout: 60000,
  },
};
```

---

### Tests Hang Indefinitely

**Symptoms:** Tests never complete, CI job times out.

**Common Causes:**

1. **Dialog not handled:**
```javascript
// Bad: alert() blocks execution
await page.click('#trigger-alert');

// Good: set up handler first
page.on('dialog', dialog => dialog.accept());
await page.click('#trigger-alert');
```

2. **Download not handled:**
```javascript
// Handle file downloads
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

---

### "net::ERR_CONNECTION_REFUSED"

**Full Error:**
```
page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/
```

**Cause:** Application server not running.

**Solutions:**

1. **Start server before tests:**
```javascript
// playwright.config.js
export default {
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
};
```

2. **Wait for server in CI:**
```yaml
- name: Start server
  run: npm run start &

- name: Wait for server
  run: npx wait-on http://localhost:3000

- name: Run tests
  run: npx playwright test
```

---

## CI-Specific Errors

### Tests Pass Locally, Fail in CI

**Common Causes:**

| Cause | Solution |
|-------|----------|
| Different browser versions | Pin Playwright version, use Docker |
| Timing differences | Add explicit waits, increase timeouts |
| Missing environment variables | Check CI env configuration |
| Different screen resolution | Set viewport explicitly |
| Different OS | Use same OS in CI as local |

**Debug Steps:**
```javascript
// Add to failing test
test.beforeEach(async ({ page }) => {
  page.on('console', msg => console.log(msg.text()));
  page.on('pageerror', err => console.log(err.message));
});
```

---

### "Failed to launch browser" in Docker

**Full Error:**
```
Failed to launch chromium because executable doesn't exist
```

**Cause:** Running in Docker without browsers.

**Solution:** Use official Playwright image:
```dockerfile
FROM mcr.microsoft.com/playwright:v1.40.0-jammy

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

CMD ["npx", "playwright", "test"]
```

---

### Screenshot Shows Blank Page

**Cause:** Screenshot taken before page renders.

**Solution:**
```javascript
// Wait for specific content
await page.waitForSelector('#main-content', { state: 'visible' });
await page.screenshot({ path: 'screenshot.png' });

// Or wait for network to settle
await page.goto(url, { waitUntil: 'networkidle' });
await page.screenshot({ path: 'screenshot.png' });
```

---

## Memory and Performance Errors

### "Out of Memory" / OOM Killed

**Cause:** Too many parallel workers or browser contexts.

**Solutions:**

1. **Reduce workers:**
```javascript
// playwright.config.js
export default {
  workers: 2,  // Instead of default (CPU cores)
};
```

2. **Close contexts properly:**
```javascript
test.afterEach(async ({ context }) => {
  await context.close();
});
```

3. **Use single browser for all tests:**
```javascript
// playwright.config.js
export default {
  use: {
    launchOptions: {
      args: ['--disable-dev-shm-usage']  // Docker workaround
    }
  }
};
```

---

### Tests Slow in CI

**Causes and Solutions:**

| Cause | Solution |
|-------|----------|
| Too many workers | Reduce `workers` count |
| Screenshot on every test | Only screenshot on failure |
| Video recording | Disable or record only on failure |
| Network latency | Mock API responses |
| Browser startup | Reuse browser context |

```javascript
// playwright.config.js
export default {
  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
};
```

---

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

---

**End of Common Errors**
