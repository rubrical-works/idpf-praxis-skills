# E2E Fresh Install Testing
## Problem
E2E tests need to simulate the first-run experience, but electron-store persists settings between runs.
## Solution
Trigger a settings clear on app startup via an environment variable.
## Implementation
### Main Process
electron-store is ESM-only and needs Electron 35+; see [electron-store-settings.md](electron-store-settings.md) for a bundled or CommonJS main process.
```typescript
// main.ts
import Store from 'electron-store';

const store = new Store<Settings>({
  name: 'app-settings',
  defaults: { setupCompleted: false },
});

// Clear settings when CLEAR_CONFIG env var is set
if (process.env.CLEAR_CONFIG === 'true') {
  store.clear();
}
```
### E2E Test Launch
```typescript
import { _electron as electron } from 'playwright';

const electronApp = await electron.launch({
  executablePath: getExecutablePath(),
  env: {
    ...process.env,
    CLEAR_CONFIG: 'true',  // Triggers fresh state
  },
});
```
## Test Patterns
### First Run Test
```typescript
test('shows setup wizard on first run', async () => {
  const electronApp = await electron.launch({
    executablePath,
    env: { ...process.env, CLEAR_CONFIG: 'true' },
  });

  const window = await electronApp.firstWindow();
  const wizard = window.locator('#setup-wizard');
  await expect(wizard).toBeVisible();

  await electronApp.close();
});
```
### Normal Run Test
```typescript
test('shows main screen when setup complete', async () => {
  // Don't clear config - use existing state
  const electronApp = await electron.launch({ executablePath });

  const window = await electronApp.firstWindow();
  const mainScreen = window.locator('#main-screen');
  await expect(mainScreen).toBeVisible();

  await electronApp.close();
});
```
## Alternative Approaches
| Approach | Pros | Cons |
|----------|------|------|
| Env var clear | Simple, works with packaged app | Requires code in main process |
| Delete config file | No code changes | Path varies by platform |
| Test-specific config | Isolated tests | More complex setup |
## Config File Locations
| Platform | Path |
|----------|------|
| Windows | `%APPDATA%/{app-name}/config.json` |
| macOS | `~/Library/Application Support/{app-name}/config.json` |
| Linux | `~/.config/{app-name}/config.json` |
## Consequences
- Each test suite chooses fresh vs persisted state
- Main process carries minimal test-aware code
- Works with the packaged app (no source access needed)
