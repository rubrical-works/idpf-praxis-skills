# Using electron-cross-build Without IDPF Framework

Cross-compilation guidance for building Windows Electron executables from Linux, covering toolchain setup, native module handling, installer generation, and code signing.

## What's Included

| File | Purpose |
|------|---------|
| `SKILL.md` | Toolchain overview, prerequisites, and build workflow |
| `resources/cross-build-guide.md` | Detailed cross-compilation procedures and CI/CD configuration |

## Quick Start

> This is one approach. Adapt it to your project's structure.

1. Install the skill into your project (e.g., via Praxis Hub Manager or by placing it in `.claude/skills/electron-cross-build/`)
2. Add a rule in `.claude/rules/` or `CLAUDE.md` that references it:

```
When cross-compiling Electron apps from Linux to Windows, read .claude/skills/electron-cross-build/SKILL.md
and .claude/skills/electron-cross-build/resources/cross-build-guide.md.
Follow the toolchain setup and build procedures for:

- Wine-based toolchain configuration
- Docker containerized builds
- Native module (node-gyp) cross-compilation
- NSIS installer generation from Linux
- Code signing for Windows executables
- CI/CD pipeline configuration (GitHub Actions, GitLab CI)
```

## Customization

The resources are self-contained markdown files. You can:

- **Scope to your builder** — focus on electron-builder or Electron Forge sections as applicable
- **Scope to your CI** — reference only the CI/CD pipeline patterns matching your environment
- **Add guides** — create new resource files for project-specific build configurations

## How IDPF Projects Use This

In IDPF projects, framework commands automatically load this skill's resources from `.claude/skills/electron-cross-build/` when cross-compilation work is detected. The approach above replicates that behavior for any Claude Code project.
