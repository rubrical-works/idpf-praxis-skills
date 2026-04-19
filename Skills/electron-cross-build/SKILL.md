---
name: electron-cross-build
type: injector
version: "1.0.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-03-17"
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

This Skill provides patterns and solutions for cross-compiling Electron applications from Linux to produce Windows executables, covering toolchain setup, native module handling, installer generation, and code signing.

## When to Use This Skill

Invoke this Skill when:
- Building Windows Electron packages from a Linux host or CI runner
- Configuring electron-builder or electron-forge for cross-platform targets
- Setting up Wine-based toolchains for Windows builds on Linux
- Using Docker containers for reproducible cross-compilation
- Generating NSIS installers from Linux
- Handling native Node.js modules (node-gyp) in cross-compilation
- Configuring code signing for Windows executables from Linux
- Setting up CI/CD pipelines (GitHub Actions, GitLab CI) for Linux-to-Windows builds

## Prerequisites

- Linux host (Ubuntu/Debian recommended) or Docker
- Node.js and npm
- Wine (for code signing and certain build steps)
- electron-builder or Electron Forge
- Docker (optional, for containerized builds)

---

## Responsibility Acknowledgement Gate

This step implements the pattern defined in the **`responsibility-gate`** skill. See `Skills/responsibility-gate/SKILL.md` for the full contract.

- **When this fires:** before installing Wine, NSIS, Docker images (e.g., `electronuserland/builder:wine`), or electron-builder/electron-forge toolchain components required to cross-compile Windows targets from Linux.
- **What is asked:** acceptance of responsibility for the change this skill will make to system-level packages (Wine, NSIS, mono via apt/sudo), Docker image cache, the project's `package.json`/`node_modules`, and build output directories.
- **On decline:** exit cleanly; report "Declined — no changes made."; make no system changes.
- **Persistence:** per-invocation. The gate re-fires on every subsequent invocation that proposes an execution path; acceptance is never persisted across runs.

Use `AskUserQuestion` with the two required options (`"I accept responsibility — proceed"` and `"Decline — exit without changes"`). See the `responsibility-gate` skill for allowed additional options.

---

## Toolchain Overview

### Wine-Based Approach

Wine allows running Windows executables on Linux, which is required for:
- NSIS installer compilation
- Code signing with signtool
- Running Windows-specific post-processing tools

electron-builder automatically downloads and uses Wine when targeting Windows from Linux, provided Wine is installed on the system.

### Docker-Based Approach

Docker provides a fully isolated, reproducible build environment. The `electronuserland/builder` images come pre-configured with all cross-compilation dependencies.

```bash
docker run --rm -v "$(pwd):/project" \
  -w /project \
  electronuserland/builder:wine \
  bash -c "npm ci && npm run build:win"
```

---

## Key Configuration Patterns

### electron-builder

Configure `electron-builder.yml` or `package.json` to target Windows from Linux:

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

Build command:
```bash
# Build Windows target from Linux
npx electron-builder --win --x64
```

### Electron Forge

For Forge-based projects, configure makers for Windows:

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

**Note:** Squirrel.Windows maker requires Wine on Linux. The `@electron-forge/maker-zip` is a simpler alternative that works without Wine.

---

## Common Pitfalls

| Pitfall | Cause | Solution |
|---------|-------|----------|
| NSIS fails with "makensis not found" | NSIS not installed on Linux | Install `nsis` package or use Docker |
| Native module build fails | node-gyp targets wrong platform | Use `prebuild-install` or rebuild with `--target_arch` |
| `.ico` icon not found | Linux lacks ICO support | Provide pre-built `.ico` file in `build/` |
| Wine errors during code signing | Wine not configured | Install Wine and mono, run `wineboot` |
| DLL not found at runtime | Missing Visual C++ redistributables | Bundle required DLLs or use static linking |
| Path separator issues | Hardcoded backslashes in config | Use `path.join()` or forward slashes |

---

## Resources

| Resource | Description |
|----------|-------------|
| [cross-build-guide.md](resources/cross-build-guide.md) | Comprehensive guide for Linux-to-Windows cross-compilation |

---

**End of Electron Cross-Build Skill**
