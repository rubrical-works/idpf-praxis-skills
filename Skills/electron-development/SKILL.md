---
name: electron-development
description: Patterns and solutions for Electron app development with Vite, Playwright E2E testing, and Windows platform considerations
type: injector
version: "1.0.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-03-17"
license: Complete terms in LICENSE.txt
category: platform
relevantTechStack: [electron, vite, playwright, typescript, windows]
copyright: "Rubrical Works (c) 2026"
---

# Electron Development


This Skill provides patterns and solutions for Electron application development, with focus on Electron Forge + Vite, Playwright E2E testing, and Windows platform considerations.

## When to Use This Skill

Invoke this Skill when:
- Setting up a new Electron application with Vite
- Configuring Playwright E2E tests for Electron
- Debugging Windows-specific issues (process locking, path issues)
- Implementing IPC communication patterns
- Adding settings persistence with electron-store
- Building update checking or download features (autoUpdater)
- Packaging for cross-platform distribution (`.deb`, DMG, AppImage, Snap, Docker-based builds)
- Code signing and notarization for macOS apps

## Prerequisites

- Node.js and npm
- Electron Forge (recommended) or electron-builder
- Vite for bundling (if using Electron Forge + Vite template)
- Playwright for E2E testing
- Windows development environment (for Windows-specific sections)

---

## Quick Reference

| Problem | Solution | Resource |
|---------|----------|----------|
| Vite output in wrong location | Set explicit `build.outDir` | [vite-renderer-output-path.md](resources/vite-renderer-output-path.md) |
| Playwright times out on launch | Enable `EnableNodeCliInspectArguments` fuse | [electron-fuses-playwright.md](resources/electron-fuses-playwright.md) |
| Spaces in app name cause issues | Use no-space `productName` | [electron-app-naming.md](resources/electron-app-naming.md) |
| E2E tests flaky in dev mode | Test packaged app instead | [e2e-testing-packaged.md](resources/e2e-testing-packaged.md) |
| Windows processes lock files | PowerShell `Stop-Process` | [windows-process-kill.md](resources/windows-process-kill.md) |
| IPC communication pattern | Three-layer contextBridge | [electron-ipc-pattern.md](resources/electron-ipc-pattern.md) |
| Settings persistence | electron-store package | [electron-store-settings.md](resources/electron-store-settings.md) |
| E2E fresh install testing | CLEAR_CONFIG env var | [e2e-fresh-install-testing.md](resources/e2e-fresh-install-testing.md) |
| Simple multi-screen nav | CSS class toggling | [multi-screen-navigation.md](resources/multi-screen-navigation.md) |
| Config file reading | Fail-safe pattern | [fail-safe-file-reading.md](resources/fail-safe-file-reading.md) |
| GitHub update checking | Electron net module | [github-api-update-checking.md](resources/github-api-update-checking.md) |
| Download with progress | IPC events pattern | [download-extraction-progress.md](resources/download-extraction-progress.md) |
| Linux .deb build from Windows | Docker + MSYS_NO_PATHCONV | [cross-platform-deb-build.md](resources/cross-platform-deb-build.md) |

---

## Setup & Build

### Vite Renderer Configuration

When using Electron Forge with Vite and setting `root` to a subdirectory in `vite.renderer.config.ts`, explicitly set `build.outDir` to an absolute path.

**Problem:** `root: 'src/renderer'` causes output to go to `src/renderer/.vite/` instead of where Electron Forge expects.

**Solution:**
```typescript
// vite.renderer.config.ts
import * as path from 'path';

export default defineConfig({
  root: 'src/renderer',
  build: {
    outDir: path.resolve(__dirname, '.vite/renderer/main_window'),
    emptyOutDir: true,
  },
});
```

**Detection:** If packaged app shows blank window, check if renderer files are in the ASAR.

See: [vite-renderer-output-path.md](resources/vite-renderer-output-path.md)

---

## Windows Platform

### Dangerous rm Patterns

**NEVER use `rm -rf` with multiple paths on Windows Git Bash.**

```bash
# DANGEROUS
rm -rf .vite/ out/ dist/

# SAFE - one at a time
rm -rf .vite
rm -rf out
rm -rf dist
```

### Process Management

Use PowerShell for killing processes (Git Bash mangles Windows command flags):

```bash
# Kill Electron processes before rebuild
powershell -Command 'Stop-Process -Name "electron" -Force -ErrorAction SilentlyContinue'

# Wait for file handles to release
sleep 2

# Now safe to clean
rm -rf .vite
rm -rf out
```

**Detection:** "Device or resource busy" errors mean processes are still running.

See: [windows-process-kill.md](resources/windows-process-kill.md)

---

## E2E Testing with Playwright

### Test Packaged App, Not Dev Mode

Dev mode is unreliable for E2E testing:
- Vite dev server may not start correctly
- Timing issues with server startup
- Different behavior from production

**Solution:** Package the app first, then test the executable.

```typescript
const electronApp = await electron.launch({
  executablePath: getExecutablePath(), // Points to packaged .exe
  timeout: 30000,
});
```

**CI workflow:**
```yaml
- run: npm run package
- run: npm run test:e2e
```

See: [e2e-testing-packaged.md](resources/e2e-testing-packaged.md)

### Electron Fuses Configuration

Playwright connects via Chrome DevTools Protocol (CDP). The `EnableNodeCliInspectArguments` fuse must be `true`.

```typescript
// forge.config.ts
new FusesPlugin({
  [FuseV1Options.EnableNodeCliInspectArguments]: true, // Required for Playwright
});
```

**Symptom:** `electron.launch()` times out but app opens manually → fuses blocking CDP.

See: [electron-fuses-playwright.md](resources/electron-fuses-playwright.md)

### App Naming

Use no-space executable names to avoid path parsing issues:

```json
// package.json
{
  "productName": "PraxisManager"  // No spaces
}
```

```html
<!-- HTML title for display -->
<title>Praxis Project Manager</title>
```

See: [electron-app-naming.md](resources/electron-app-naming.md)

### Fresh Install Testing

Use environment variables to clear settings for first-run tests:

```typescript
// main.ts
if (process.env.CLEAR_CONFIG === 'true') {
  clearSettings();
}

// E2E test
const electronApp = await electron.launch({
  executablePath,
  env: { ...process.env, CLEAR_CONFIG: 'true' },
});
```

See: [e2e-fresh-install-testing.md](resources/e2e-fresh-install-testing.md)

---

## Architecture Patterns

### IPC Communication

Use the three-layer pattern for secure main-renderer communication:

1. **Main process:** `ipcMain.handle('channel', handler)`
2. **Preload:** `contextBridge.exposeInMainWorld('api', { ... })`
3. **Types:** `preload.d.ts` with Window interface extension

**Channel naming:** Use namespaced channels like `settings:get`, `dialog:selectDirectory`

See: [electron-ipc-pattern.md](resources/electron-ipc-pattern.md)

### Settings Persistence

Use `electron-store` for cross-platform settings:

```typescript
import Store from 'electron-store';

const store = new Store<Settings>({
  name: 'app-settings',
  defaults: { setupCompleted: false },
});
```

**Storage locations:**
- Windows: `%APPDATA%/{app-name}/`
- macOS: `~/Library/Application Support/{app-name}/`
- Linux: `~/.config/{app-name}/`

See: [electron-store-settings.md](resources/electron-store-settings.md)

### Multi-Screen Navigation

For simple apps (2-5 screens), use CSS class toggling:

```html
<main id="screen-a" class="hidden">...</main>
<main id="screen-b">...</main>
```

```typescript
function showScreen(id: string) {
  document.querySelectorAll('main').forEach(el => el.classList.add('hidden'));
  document.getElementById(id)?.classList.remove('hidden');
}
```

See: [multi-screen-navigation.md](resources/multi-screen-navigation.md)

### Fail-Safe File Reading

Return typed objects with `found` boolean, never throw:

```typescript
function getConfig(path: string): { found: boolean; data?: Config } {
  try {
    if (!fs.existsSync(path)) return { found: false };
    const data = JSON.parse(fs.readFileSync(path, 'utf-8'));
    return { found: true, data };
  } catch {
    return { found: false };
  }
}
```

See: [fail-safe-file-reading.md](resources/fail-safe-file-reading.md)

---

## Network & Updates

### GitHub API Update Checking

Use Electron's `net` module (respects system proxy):

```typescript
import { net } from 'electron';

const request = net.request({
  url: `https://api.github.com/repos/${owner}/${repo}/releases/latest`,
  method: 'GET',
});
request.setHeader('Accept', 'application/vnd.github.v3+json');
```

**Rate limit:** 60 requests/hour unauthenticated.

See: [github-api-update-checking.md](resources/github-api-update-checking.md)

### Download with Progress

Send progress updates via IPC events:

```typescript
// Main process
ipcMain.handle('download', async (event, url, dest) => {
  const onProgress = (progress) => {
    event.sender.send('download:progress', progress);
  };
  return downloadFile(url, dest, onProgress);
});
```

**GitHub releases:** Follow 302 redirects to S3 for asset downloads.

See: [download-extraction-progress.md](resources/download-extraction-progress.md)

---

## Workflow Best Practices

### Commit Incrementally

**Always commit after each working change.** Lost work is common when making many changes across multiple files without committing.

**Bad pattern:**
- Change package.json
- Change forge.config.ts
- Change HTML
- Change TypeScript
- Add icons
- Write tests
- *Catastrophic failure* → All lost

**Good pattern:**
- Change package.json → commit
- Change forge.config.ts → commit
- And so on...

---

## Troubleshooting Matrix

| Symptom | Likely Cause | Solution |
|---------|--------------|----------|
| Blank window in packaged app | Renderer files not in ASAR | Check Vite output path |
| `electron.launch()` timeout | Fuses blocking CDP | Enable `EnableNodeCliInspectArguments` |
| `firstWindow()` timeout | DevTools opening, window not loading | Check for console errors |
| DEP0190 warning | Spaces in executable path | Use no-space productName |
| "Device or resource busy" | Processes holding file handles | Kill processes before cleanup |
| E2E different from manual | Testing dev mode, not packaged | Test packaged executable |
| Settings persist between tests | electron-store not cleared | Use CLEAR_CONFIG env var |
| `Cannot find "fpm"` on Windows | Linux packaging tools missing | Use Docker build |
| Docker path `C:/Program Files/Git/...` | MSYS2 rewrites `/` paths | Set `MSYS_NO_PATHCONV=1` |

---

## Resources

All detailed guides are in the `resources/` directory:

| Resource | Description |
|----------|-------------|
| [vite-renderer-output-path.md](resources/vite-renderer-output-path.md) | Vite config when using root subdirectory |
| [windows-process-kill.md](resources/windows-process-kill.md) | PowerShell approach for Windows |
| [electron-fuses-playwright.md](resources/electron-fuses-playwright.md) | Fuse configuration for E2E testing |
| [electron-app-naming.md](resources/electron-app-naming.md) | No-space executable naming |
| [e2e-testing-packaged.md](resources/e2e-testing-packaged.md) | Testing packaged apps |
| [electron-ipc-pattern.md](resources/electron-ipc-pattern.md) | Three-layer IPC pattern |
| [e2e-fresh-install-testing.md](resources/e2e-fresh-install-testing.md) | Fresh install simulation |
| [electron-store-settings.md](resources/electron-store-settings.md) | Settings persistence |
| [multi-screen-navigation.md](resources/multi-screen-navigation.md) | Simple navigation pattern |
| [fail-safe-file-reading.md](resources/fail-safe-file-reading.md) | Defensive file reading |
| [github-api-update-checking.md](resources/github-api-update-checking.md) | Update checking pattern |
| [download-extraction-progress.md](resources/download-extraction-progress.md) | Download with progress |
| [cross-platform-deb-build.md](resources/cross-platform-deb-build.md) | Linux .deb packaging from Windows |

---

**End of Electron Development Skill**
