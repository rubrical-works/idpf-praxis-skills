# Electron Fuses and Playwright E2E Testing
## Problem
Playwright E2E tests time out during `electron.launch()` although the packaged app works when launched manually.
## Symptoms
- `electron.launch()` times out after 30 seconds
- `DEP0190: Passing args to a child process with shell option true` may also appear — unrelated to the fuse (see Troubleshooting)
- App visible on screen but Playwright can't connect
- Direct `spawn()` works, Playwright doesn't
## Root Cause
The `EnableNodeCliInspectArguments` fuse in `forge.config.ts` disables the Node inspector flags Playwright depends on:
```typescript
new FusesPlugin({
  [FuseV1Options.EnableNodeCliInspectArguments]: false,  // BLOCKS PLAYWRIGHT
});
```
## How Playwright Connects
1. Playwright launches Electron with both `--inspect=0` (Node inspector for the main process) and `--remote-debugging-port=0` (Chromium DevTools Protocol for windows)
2. It waits for the main process to print `Debugger listening on ws://…`, connects to the **Node inspector**, and uses that connection to bootstrap the app
3. The `nodeCliInspect` fuse (`EnableNodeCliInspectArguments`) controls only whether `--inspect`, `--inspect-brk` and similar flags are respected — not `--remote-debugging-port`
4. With the fuse `false`, `--inspect=0` is ignored, the Node inspector never starts, and `electron.launch()` times out
## Solution
```typescript
new FusesPlugin({
  version: FuseVersion.V1,
  [FuseV1Options.RunAsNode]: false,
  [FuseV1Options.EnableCookieEncryption]: true,
  [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
  [FuseV1Options.EnableNodeCliInspectArguments]: true,  // Required for Playwright
  [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
  [FuseV1Options.OnlyLoadAppFromAsar]: true,
}),
```
## Security Considerations
Environment-based toggle for production:
```typescript
const isProduction = process.env.NODE_ENV === 'production';

new FusesPlugin({
  [FuseV1Options.EnableNodeCliInspectArguments]: !isProduction,
});
```
Or separate configs: `forge.config.ts` (development/testing, debugging enabled) and `forge.config.production.ts` (releases, debugging disabled).
## Troubleshooting
| Symptom | Likely Cause |
|---------|--------------|
| Timeout in `electron.launch()` | `EnableNodeCliInspectArguments` fuse disabling `--inspect` |
| Timeout in `firstWindow()` | DevTools opening, window not loading |
| DEP0190 warning | Node 24+ deprecation of `spawn`/`execFile` with `args` + `shell: true`, emitted by Playwright's Windows launcher — cosmetic, not blocking |
| App opens but tests fail | Node inspector unavailable (fuse `false`) |
## Diagnostic Script
```javascript
const { spawn } = require('child_process');

// If this works but Playwright doesn't, it's a fuse issue
const proc = spawn('path/to/app.exe', [], { detached: true });
```
