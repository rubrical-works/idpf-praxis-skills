# Using electron-development Without IDPF Framework
Patterns and solutions for Electron app development with Vite, Playwright E2E testing, and per-OS notes for Windows, macOS and Linux hosts — a problem/solution reference library.
## What's Included
| File | Purpose |
|------|---------|
| `SKILL.md` | Quick reference table, prerequisites, and workflow guidance |
| `resources/vite-renderer-output-path.md` | Fix Vite output directory configuration |
| `resources/electron-fuses-playwright.md` | Enable Playwright with Electron fuses |
| `resources/electron-app-naming.md` | Handle spaces in app/product names |
| `resources/e2e-testing-packaged.md` | E2E testing against packaged apps |
| `resources/e2e-fresh-install-testing.md` | First-run and fresh install test strategies |
| `resources/process-cleanup.md` | Stopping the app before a rebuild (Windows, macOS, Linux) |
| `resources/electron-ipc-pattern.md` | Three-layer contextBridge IPC pattern |
| `resources/electron-store-settings.md` | Settings persistence with electron-store |
| `resources/github-api-update-checking.md` | Update checking via GitHub API |
| `resources/download-extraction-progress.md` | Download and extraction progress tracking |
| `resources/multi-screen-navigation.md` | Multi-screen navigation patterns |
| `resources/cross-platform-deb-build.md` | Windows host → Linux `.deb` target build |
| `resources/fail-safe-file-reading.md` | Fail-safe file I/O patterns |
## Quick Start
> This is one approach. Adapt it to your project's structure.
1. Install the skill into your project (e.g., via Praxis Hub Manager or by placing it in `.claude/skills/electron-development/`)
2. Add a rule in `.claude/rules/` or `CLAUDE.md` that references it:
```
When working on Electron development, read .claude/skills/electron-development/SKILL.md for the quick reference table.
Load specific resources from .claude/skills/electron-development/resources/ as needed:

- IPC setup: electron-ipc-pattern.md
- E2E testing: e2e-testing-packaged.md, electron-fuses-playwright.md
- Process cleanup before rebuild: process-cleanup.md
- Vite config: vite-renderer-output-path.md
- Load other resources matching the current problem from the quick reference table
```
## Customization
The resources are self-contained markdown files:
- **Load selectively** — reference only the resources relevant to the current problem
- **Add patterns** — create new resource files for project-specific Electron patterns
- **Adjust for your stack** — if not using Vite or Playwright, omit those resources from your rule
## How IDPF Projects Use This
In IDPF projects, framework commands load this skill's resources from `.claude/skills/electron-development/` when Electron development work is detected. The approach above replicates that for any Claude Code project.
