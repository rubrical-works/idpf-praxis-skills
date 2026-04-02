# Electron Fuses and Playwright E2E Testing

## Problem

Playwright E2E tests timeout during `electron.launch()` even though the packaged Electron app works correctly when launched manually.

## Symptoms

- `electron.launch()` times out after 30 seconds
- Deprecation warning: `DEP0190: Passing args to a child process with shell option true`
- App visible on screen but Playwright can't connect
- Direct `spawn()` works, Playwright doesn't

## Root Cause

Electron Fuses in `forge.config.ts` block the debugging port Playwright needs:

```typescript
new FusesPlugin({
  [FuseV1Options.EnableNodeCliInspectArguments]: false,  // BLOCKS PLAYWRIGHT
});
```

## How Playwright Connects

1. Playwright launches Electron with `--remote-debugging-port=XXXXX`
2. Playwright connects to that port via Chrome DevTools Protocol (CDP)
3. If fuse is `false`, Electron ignores the debugging port argument
4. Playwright can never connect → timeout

## Solution

Enable the fuse for testing:

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

For production releases, consider environment-based toggle:

```typescript
const isProduction = process.env.NODE_ENV === 'production';

new FusesPlugin({
  [FuseV1Options.EnableNodeCliInspectArguments]: !isProduction,
});
```

Or maintain separate forge configs:
- `forge.config.ts` - development/testing (debugging enabled)
- `forge.config.production.ts` - releases (debugging disabled)

## Troubleshooting

| Symptom | Likely Cause |
|---------|--------------|
| Timeout in `electron.launch()` | Fuses blocking debug port |
| Timeout in `firstWindow()` | DevTools opening, window not loading |
| DEP0190 warning | Spaces in path (cosmetic, not blocking) |
| App opens but tests fail | CDP connection blocked by fuses |

## Diagnostic Script

```javascript
const { spawn } = require('child_process');

// If this works but Playwright doesn't, it's a fuse issue
const proc = spawn('path/to/app.exe', [], { detached: true });
```
