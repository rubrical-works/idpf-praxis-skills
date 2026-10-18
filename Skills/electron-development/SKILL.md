---
name: electron-development
description: Patterns and solutions for Electron app development with Vite, Playwright E2E testing, and per-OS notes for Windows, macOS and Linux hosts
type: reference
disable-model-invocation: true
defaultSkill: false
version: "1.3.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-10-18"
license: Complete terms in LICENSE.txt
category: platform
relevantTechStack: [electron, vite, playwright, typescript, windows, macos, linux]
copyright: "Rubrical Works (c) 2026"
---
# Electron Development
Patterns and solutions for Electron development: Electron Forge + Vite, Playwright E2E testing, and what differs by development host — process cleanup, packaged executable paths, host/target builds — on Windows, macOS and Linux.
## When to Use This Skill
- Setting up a new Electron application with Vite
- Configuring Playwright E2E tests for Electron
- Debugging host-specific issues (a running app locking build files, packaged executable paths) on Windows, macOS or Linux
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
- A Windows, macOS or Linux development host — Platform Notes covers what differs
## Quick Reference
| Problem | Solution | Resource |
|---------|----------|----------|
| Vite output in wrong location | Set explicit `build.outDir` | [vite-renderer-output-path.md](resources/vite-renderer-output-path.md) |
| Playwright times out on launch | Enable `EnableNodeCliInspectArguments` fuse | [electron-fuses-playwright.md](resources/electron-fuses-playwright.md) |
| Spaces in app name cause issues | Use no-space `productName` | [electron-app-naming.md](resources/electron-app-naming.md) |
| E2E tests flaky in dev mode | Test packaged app instead | [e2e-testing-packaged.md](resources/e2e-testing-packaged.md) |
| Running app locks build files | Stop it per OS, wait, then clean | [process-cleanup.md](resources/process-cleanup.md) |
| IPC communication pattern | Three-layer contextBridge | [electron-ipc-pattern.md](resources/electron-ipc-pattern.md) |
| Settings persistence | electron-store package | [electron-store-settings.md](resources/electron-store-settings.md) |
| E2E fresh install testing | CLEAR_CONFIG env var | [e2e-fresh-install-testing.md](resources/e2e-fresh-install-testing.md) |
| Simple multi-screen nav | CSS class toggling | [multi-screen-navigation.md](resources/multi-screen-navigation.md) |
| Config file reading | Fail-safe pattern | [fail-safe-file-reading.md](resources/fail-safe-file-reading.md) |
| GitHub update checking | Electron net module | [github-api-update-checking.md](resources/github-api-update-checking.md) |
| Download with progress | IPC events pattern | [download-extraction-progress.md](resources/download-extraction-progress.md) |
| Windows host → Linux `.deb` target (one host/target pairing) | Docker + `MSYS_NO_PATHCONV` | [cross-platform-deb-build.md](resources/cross-platform-deb-build.md) |
| Errors scroll past in DevTools while you click around | Record them in a headed capture session | `electron-error-capture` skill |
**Related skill — `electron-error-capture`.** The `_electron.launch` snippets below are for *scripted* E2E. To drive the app by hand and keep every error (page errors, console errors, renderer crashes, main-process stderr) with screenshots and a report, use `electron-error-capture` instead of rebuilding the harness here.
## Setup & Build
### Vite Renderer Configuration
With Electron Forge + Vite and `root` set to a subdirectory in `vite.renderer.config.ts`, set `build.outDir` to an absolute path explicitly.
**Problem:** `root: 'src/renderer'` sends output to `src/renderer/.vite/` instead of where Electron Forge expects.
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
**Detection:** packaged app shows a blank window → check whether renderer files are in the ASAR. See: [vite-renderer-output-path.md](resources/vite-renderer-output-path.md)
## Platform Notes
Almost everything here applies on every host. What differs per OS is how you stop a running app before a rebuild — a process still holding file handles is why `rm` of a build directory fails — and where the packaged executable lands.
### Windows
- **File locking:** Electron processes hold handles on `.vite/` and `out/`; `Device or resource busy` means something is still running.
- **Process cleanup:** use PowerShell with **single quotes** so Git Bash passes the command verbatim (`taskkill /F` is mangled — Git Bash reads `/F` as a path):
  ```bash
  powershell -Command 'Stop-Process -Name "YourAppName" -Force -ErrorAction SilentlyContinue'
  powershell -Command 'Stop-Process -Name "electron" -Force -ErrorAction SilentlyContinue'
  sleep 2
  ```
- **Git Bash quoting:** double quotes let Git Bash expand `$_` and friends before PowerShell sees them; single quotes do not.
- **Multi-path `rm`:** never `rm -rf .vite/ out/ dist/` in one command under Git Bash — one directory per command.
- **Packaged executable:** `out/YourAppName-win32-<arch>/YourAppName.exe`.
### macOS
- **Process cleanup:** `pkill -x "YourAppName" || true` for the packaged app and `pkill -x "Electron" || true` for the dev binary (`killall` works the same). Wait a moment before cleaning.
- **Bundle path:** the executable Playwright launches is `out/YourAppName-darwin-<arch>/YourAppName.app/Contents/MacOS/YourAppName`, not the `.app` directory.
- **Quarantine:** an unsigned downloaded build carries Gatekeeper's quarantine attribute and will not open on double-click. For local testing: `xattr -dr com.apple.quarantine YourAppName.app`; for distribution, sign and notarize.
### Linux
- **Process cleanup:** `pkill -x "yourappname" || true` and `pkill -f electron || true`, then a short wait before `rm`.
- **Executable name casing:** the packaged binary is commonly lowercased (`out/YourAppName-linux-<arch>/yourappname`). The three-platform `getExecutablePath()` in [e2e-testing-packaged.md](resources/e2e-testing-packaged.md) encodes this; match what your packager emits.
See: [process-cleanup.md](resources/process-cleanup.md)
## E2E Testing with Playwright
### Test Packaged App, Not Dev Mode
Dev mode is unreliable for E2E: the Vite dev server may not start correctly, startup timing varies, and behavior differs from production. Package first, then test the executable.
```typescript
const electronApp = await electron.launch({
  executablePath: getExecutablePath(), // resolves the packaged binary for win32, darwin and linux
  timeout: 30000,
});
```
`getExecutablePath()` ([e2e-testing-packaged.md](resources/e2e-testing-packaged.md)) derives `out/<name>-<platform>-<arch>/` from `process.platform` and `process.arch`, then returns the `.exe` on Windows, the binary inside the `.app` bundle on macOS, and the lowercased executable on Linux.
**CI workflow:**
```yaml
- run: npm run package
- run: npm run test:e2e
```
### Electron Fuses Configuration
Playwright launches Electron with `--inspect=0` and bootstraps the app through the main process's Node inspector. The `EnableNodeCliInspectArguments` fuse controls whether `--inspect` is respected, so it must be `true` for Playwright.
```typescript
// forge.config.ts
new FusesPlugin({
  [FuseV1Options.EnableNodeCliInspectArguments]: true, // Required for Playwright
});
```
**Symptom:** `electron.launch()` times out but the app opens manually → the fuse is disabling the Node inspector. See: [electron-fuses-playwright.md](resources/electron-fuses-playwright.md)
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
Clear settings via environment variable for first-run tests:
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
## Architecture Patterns
### IPC Communication
Three-layer pattern for secure main-renderer communication:
1. **Main process:** `ipcMain.handle('channel', handler)`
2. **Preload:** `contextBridge.exposeInMainWorld('api', { ... })`
3. **Types:** `preload.d.ts` with Window interface extension
**Channel naming:** namespaced channels like `settings:get`, `dialog:selectDirectory`. See: [electron-ipc-pattern.md](resources/electron-ipc-pattern.md)
### Settings Persistence
Use `electron-store`. Current electron-store (v12) is **ESM-only** and requires **Electron 35** or later: use it from an ESM or bundled main process, or pin an older major.
```typescript
import Store from 'electron-store';

const store = new Store<Settings>({
  name: 'app-settings',
  defaults: { setupCompleted: false },
});
```
**Storage locations:** Windows `%APPDATA%/{app-name}/`; macOS `~/Library/Application Support/{app-name}/`; Linux `~/.config/{app-name}/`. See: [electron-store-settings.md](resources/electron-store-settings.md)
### Multi-Screen Navigation
For simple apps (2-5 screens), toggle CSS classes:
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
Return typed objects with a `found` boolean, never throw:
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
## Network & Updates
### GitHub API Update Checking
Use Electron's `net` module (respects system proxy):
```typescript
import { net } from 'electron';

const request = net.request({
  url: `https://api.github.com/repos/${owner}/${repo}/releases/latest`,
  method: 'GET',
});
request.setHeader('Accept', 'application/vnd.github+json');
request.setHeader('X-GitHub-Api-Version', '2026-03-10'); // pin a supported version
```
Requests without `X-GitHub-Api-Version` default to `2022-11-28`, which reaches end of support on 2028-03-10 — pin explicitly. **Rate limit:** 60 requests/hour unauthenticated. See: [github-api-update-checking.md](resources/github-api-update-checking.md)
### Download with Progress
Send progress via IPC events:
```typescript
// Main process
ipcMain.handle('download', async (event, url, dest) => {
  const onProgress = (progress) => {
    event.sender.send('download:progress', progress);
  };
  return downloadFile(url, dest, onProgress);
});
```
**GitHub releases:** asset downloads may answer with a 302. `net.request` follows redirects by default (`redirect: 'follow'`), so no manual 3xx handling is needed. See: [download-extraction-progress.md](resources/download-extraction-progress.md)
## Workflow Best Practices
**Commit after each working change** (package.json → commit, forge.config.ts → commit, …). Many uncommitted changes across files are lost together on a catastrophic failure.
## Troubleshooting Matrix
| Symptom | Likely Cause | Solution |
|---------|--------------|----------|
| Blank window in packaged app | Renderer files not in ASAR | Check Vite output path |
| `electron.launch()` timeout | Fuse disabling the Node inspector (`--inspect`) | Enable `EnableNodeCliInspectArguments` |
| `firstWindow()` timeout | DevTools opening, window not loading | Check for console errors |
| DEP0190 warning | Node 24+ deprecation: `spawn`/`execFile` called with an `args` array and `shell: true` (on Windows, Playwright's Electron launcher does this) | Harmless from Playwright; in your own code drop `shell: true` or pass one escaped command string |
| "Device or resource busy" | Processes holding file handles | Kill processes before cleanup |
| E2E different from manual | Testing dev mode, not packaged | Test packaged executable |
| Settings persist between tests | electron-store not cleared | Use CLEAR_CONFIG env var |
| `Cannot find "fpm"` on Windows | Linux packaging tools missing | Use Docker build |
| Docker path `C:/Program Files/Git/...` | MSYS2 rewrites `/` paths | Set `MSYS_NO_PATHCONV=1` |
## Resources
All detailed guides live in `resources/`; the Quick Reference table above links each one.
