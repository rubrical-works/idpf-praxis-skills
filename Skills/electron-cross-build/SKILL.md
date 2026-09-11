---
name: electron-cross-build
type: reference
disable-model-invocation: true
defaultSkill: false
version: "1.1.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-09-10"
description: Cross-compile Electron apps from Linux to produce Windows executables
license: Complete terms in LICENSE.txt
category: platform
relevantTechStack: [electron, linux, windows, wine, docker, electron-builder, electron-forge]
keywords:
  - electron
  - cross-compile
  - windows
  - linux
  - wine
  - electron-builder
  - electron-forge
  - nsis
  - code-signing
copyright: "Rubrical Works (c) 2026"
---
# Electron Cross-Build
## When to Use This Skill
- Building Windows Electron packages from a Linux host or CI runner
- Configuring electron-builder or electron-forge for cross-platform targets
- Wine-based toolchains for Windows builds on Linux
- Docker containers for reproducible cross-compilation
- Generating NSIS installers from Linux
- Native Node.js modules (node-gyp) in cross-compilation
- Code signing for Windows executables from Linux
- CI/CD pipelines (GitHub Actions, GitLab CI) for Linux-to-Windows builds
## Prerequisites
Linux host (Ubuntu/Debian) or Docker; Node.js and npm; Wine (code signing and certain build steps); electron-builder or Electron Forge; Docker optional.
## Responsibility Acknowledgement Gate
Implements the **`responsibility-gate`** skill; see `Skills/responsibility-gate/SKILL.md` for the full contract.
- **Fires:** before installing Wine, NSIS, Docker images (e.g. `electronuserland/builder:wine`), or electron-builder/electron-forge toolchain components.
- **Asks:** acceptance of responsibility for changes to system-level packages (Wine, NSIS, mono via apt/sudo), Docker image cache, the project's `package.json`/`node_modules`, and build output directories.
- **On decline:** exit cleanly; report "Declined — no changes made."; make no system changes.
- **Persistence:** per-invocation; re-fires every invocation proposing an execution path, never persisted.
Use `AskUserQuestion` with the two required options (`"I accept responsibility — proceed"`, `"Decline — exit without changes"`).
## Toolchain Overview
**Wine** — required for NSIS installer compilation, code signing with signtool, and Windows-specific post-processing. electron-builder downloads and uses Wine automatically when targeting Windows from Linux, provided Wine is installed.
**Docker** — isolated, reproducible environment; `electronuserland/builder` images are pre-configured with all cross-compilation dependencies.
```bash
docker run --rm -v "$(pwd):/project" \
  -w /project \
  electronuserland/builder:wine \
  bash -c "npm ci && npm run build:win"
```
## Key Configuration Patterns
### electron-builder
Configure `electron-builder.yml` or `package.json`:
```json
{
  "build": {
    "linux": {
      "target": ["AppImage", "deb"]
    },
    "win": {
      "target": ["nsis", "portable"],
      "icon": "build/icon.ico"
    }
  }
}
```
```bash
# Build Windows target from Linux
npx electron-builder --win --x64
```
### Electron Forge
```javascript
// forge.config.js
module.exports = {
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: { name: 'MyApp' },
      platforms: ['win32'],
    },
  ],
};
```
**Note:** Squirrel.Windows maker requires Wine on Linux. `@electron-forge/maker-zip` works without Wine.
## Common Pitfalls
| Pitfall | Cause | Solution |
|---------|-------|----------|
| NSIS fails with "makensis not found" | NSIS not installed on Linux | Install `nsis` package or use Docker |
| Native module build fails | node-gyp targets wrong platform | Use `prebuild-install` or rebuild with `--target_arch` |
| `.ico` icon not found | Linux lacks ICO support | Provide pre-built `.ico` file in `build/` |
| Wine errors during code signing | Wine not configured | Install Wine and mono, run `wineboot` |
| DLL not found at runtime | Missing Visual C++ redistributables | Bundle required DLLs or use static linking |
| Path separator issues | Hardcoded backslashes in config | Use `path.join()` or forward slashes |
## Resources
| Resource | Description |
|----------|-------------|
| [cross-build-guide.md](resources/cross-build-guide.md) | Comprehensive guide for Linux-to-Windows cross-compilation |
