---
name: install-node
description: Safe, guided installer for Node.js. Detects existing Node and version managers, recommends a single vetted package-manager command per platform, runs dry-run by default, and requires explicit responsibility acknowledgement before any execution path. Bootstrap does not itself require Node.
type: invokable
version: "2.0.0"
frameworkCompatibility: ">=0.80.0"
lastUpdated: "2026-04-25"
license: Complete terms in LICENSE.txt
category: devops
relevantTechStack: [node, nodejs, nvm, fnm, volta, winget, brew, apt, installer]
copyright: "Rubrical Works (c) 2026"
---

# Install Node — Safe, Guided Node.js Installation

Detects platform and existing Node/version-manager state, recommends a single vetted command from `resources/install-node.config.json`, executes only after responsibility acknowledgement and command confirmation. Used as the bootstrap remediation for skills that require Node (e.g., `engage-exocortex`, `engage-prism`).

**No executable install logic of its own.** Orchestrates `Bash` and `AskUserQuestion` around detect-first-act-second. Skill itself runs without Node — it must bootstrap Node.

## When to use

Invoke when:
- User asks how to install Node.js.
- Another skill reports Node missing and routes here.
- User wants to update existing Node to current LTS.
- User wants to uninstall a Node installation this skill previously created.

Do **not** use to:
- Install other runtimes (Python, Go, Ruby, etc.) — out of scope.
- Manage Node versions after installation — defer to the version manager.
- Install when no `AskUserQuestion` is available — report the recommended command from config and stop.

## Options

| Flag | Description | Default |
|------|-------------|---------|
| `--apply` | Execute after both gates pass. Without it, dry-run prints the command. | *(dry-run)* |
| `--version <spec>` | `lts` (default), `latest`, or `X.Y.Z`. | `lts` |
| `--scope <scope>` | `user` (default) or `system` (admin/sudo, discouraged, extra warning). | `user` |
| `--force-manager <name>` | Force route (must be in `versionManagers.preferenceOrder` or a platform `primaryRoute`). Use only when auto-detection is wrong. | *(auto)* |

## Step 0 — Re-read Config (MANDATORY)

Read `resources/install-node.config.json` from disk every invocation. Validate against `resources/install-node.config.schema.json`. Config is the source of truth for every volatile value (LTS majors, manager commands, per-platform installer commands, bootstrap URLs). If a step needs a value not in config, report and stop; do not invent a fallback.

All steps reference values by JSON path (e.g., `platforms.windows.winget.installCommand`).

## Core Workflow

```
PRIMARY AGENT
     │
     ├── 0. Re-read resources/install-node.config.json + schema
     ├── 1. Detect platform (Windows / macOS / Linux)
     ├── 2. Detect existing Node (`node --version`)
     ├── 3. Detect version managers (preferenceOrder + per-manager detectCommand)
     │
     ├── 4. Branch:
     │     ├── Node present and acceptable → report and STOP (no install proposed)
     │     ├── Version manager present → recommend via versionManagers.<chosen>.installCommand
     │     └── No Node, no manager → recommend platforms.<platform>.<primaryRoute>.installCommand
     │
     ├── 5. Print the recommended command (dry-run), show uninstall command alongside
     ├── 6. Responsibility Acknowledgement Gate (MANDATORY)
     ├── 7. Confirm the exact command (MANDATORY second gate)
     ├── 8. Execute only if --apply AND both gates passed
     └── 9. Post-execution verification: re-run `node --version`, report outcome
```

**Two-gate rule:** Steps 6 and 7 are **independent** gates. Decline at either exits cleanly with zero system changes. Both must fire on every invocation — acknowledgement is **per-invocation, never persisted**.

## Step 1 — Detect Platform

```bash
uname -s     # Linux → "Linux"; macOS → "Darwin"
```

On Windows, `uname` typically unavailable. Fall back to `$OS` (contains `Windows_NT`) or existence of `$WINDIR`. Record as `windows`, `macos`, or `linux` — keys under `platforms` in config.

## Step 2 — Detect Existing Node

```bash
node --version     # e.g., "v20.11.0"
which node         # POSIX; falls back to "command -v node"
```

On Windows: `where node`. Normalize to a semver major (e.g., `20`). Record absolute path (first hit).

### Acceptable version policy

Acceptable = major in `lts.supportedMajors`. If present and acceptable, **do not propose an install** — report and stop.

Resolve current LTS live from `lts.resolveFrom` (e.g., `https://nodejs.org/dist/index.json`); on fetch failure use `lts.fallbackMajor`. Resolved current LTS must also be in `lts.supportedMajors` — if not, warn user the skill is stale.

If `--version` is passed explicitly, it drives acceptability: exact match acceptable; mismatch proposes install/route through detected manager.

## Step 3 — Detect Version Managers

For each manager in `versionManagers.preferenceOrder`, run its `detectCommand` (or `windowsDetectCommand` on Windows):

```bash
volta --version                 # versionManagers.volta.detectCommand
fnm --version                   # versionManagers.fnm.detectCommand
nvm --version                   # versionManagers.nvm.detectCommand (POSIX)
nvm version                     # versionManagers.nvm.windowsDetectCommand (nvm-windows)
```

If any present, **route through detected manager** rather than installing parallel system Node. With multiple, pick first per `preferenceOrder`.

## Step 4 — Decide Route

| Condition | Route (config path) |
|---|---|
| Acceptable Node present AND no `--version` override | **no-op** — report and stop |
| Version manager present | `versionManagers.<chosen>.installCommand` |
| Windows, no Node, no manager | `platforms.windows.winget.installCommand` |
| macOS, no Node, no manager | `platforms.macos.brew.installCommand` (then `linkCommand` if PATH misses binary) |
| Linux, no Node, no manager | `versionManagers.nvm.bootstrap.*` then `versionManagers.nvm.installCommand` |
| `--force-manager` passed | Route via forced manager (skip auto-detection) |

**Never** use `curl ... | sh` or `wget ... | bash` without inspection. Linux nvm bootstrap uses **download → verify → run** under `versionManagers.nvm.bootstrap` — print `scriptUrl`, follow `verifyGuidance`, then `downloadCommand` followed by `runCommand` only after explicit Step 7 confirm.

## Step 5 — Dry-Run Output

Substitute config values (replace `{packageId}`, `{major}`, `{scriptUrl}`), then emit:

```
Recommended Install
-------------------
Platform:          {windows | macos | linux}
Detected Node:     {version | none}
Detected Manager:  {volta | fnm | nvm | none}
Target Version:    {lts | latest | X.Y.Z}
Scope:             {user | system}

Command to run:
  {the substituted command, as a copy-pasteable line}

Uninstall command (keep this):
  {the matching uninstall command from the same config entry}

Notes:
  - {any platform-specific caveat from the config's _note fields, e.g. "brew link may require admin password"}
```

**Always print uninstall alongside install.** Every config entry with `installCommand` must have matching `uninstallCommand` (or bootstrap equivalent) — if missing, refuse to recommend that route.

## Step 6 — Responsibility Acknowledgement Gate (MANDATORY)

Use `AskUserQuestion`:

```
I'm about to install Node.js on your system. This skill does not persist your acknowledgement — you will see this prompt every time the skill proposes an execution path.

Do you accept responsibility for the change this skill will make to your Node installation, system PATH, and version-manager state?

Options:
  - "I accept responsibility — proceed" (required to continue)
  - "Decline — exit without changes"
```

- Accept → Step 7.
- Decline → exit cleanly. Report `"Declined — no changes made."` and stop.

MUST fire on every invocation where execution is proposed, including `--apply`. Skipping is a defect.

## Step 7 — Command Confirmation Gate (MANDATORY)

Use `AskUserQuestion` with the exact substituted command:

```
Run this exact command?

  {the substituted command}

Options:
  - "Yes, run this command"
  - "No — exit without running"
  - "Let me edit the command first"
```

- Yes → Step 8.
- No → exit cleanly. Report `"Confirmation declined — no changes made."` and stop.
- Edit → accept edited command, re-run Steps 6 and 7 (responsibility gate re-fires). Never execute edited command without re-confirmation.

## Step 8 — Execute (only if `--apply` AND both gates passed)

Run via `Bash`. Timeout generously (installers can take minutes). On failure, report and quote the uninstall command. Do **not** retry automatically.

## Step 9 — Post-Execution Verification

```bash
node --version
```

Report installed version, binary path (`which node` / `where node`), `<manager> current`-equivalent if applicable, and the uninstall command restated.

If `node --version` still fails, do not declare success. Report failure, dump last ~50 lines of installer output if available, point user at uninstall command.

## Discouraged Routes

Config records discouraged routes per platform under `platforms.<platform>.discouraged` with `reason`. When user requests one (e.g., via `--force-manager`), report the reason and ask explicit confirmation. Do not silently substitute.

Background on each discouraged route (.pkg on macOS, distro Node on Linux, Chocolatey first-time on Windows): `docs/install-node-rationale.md`.

## Error Handling

| Situation | Response |
|---|---|
| Config missing or invalid | Report `"install-node config missing or fails schema validation — skill cannot proceed."` and exit. |
| `AskUserQuestion` unavailable | Report recommended command; **do not execute**. Exit cleanly. |
| Declined responsibility gate | `"Declined — no changes made."` → exit |
| Declined confirmation gate | `"Confirmation declined — no changes made."` → exit |
| `--apply` without confirmation | Cannot happen — Step 7 blocks it. |
| Installer fails | Report failure + stderr tail + uninstall command. Do not retry. |
| Post-install verification fails | Do not declare success. Report failure + uninstall command. |
| `--version latest` on skill not tracking "latest" | Accept; pass through to manager. |
| `--scope system` on Windows | Warn: requires admin shell. Offer `--scope user`. (`winget.systemScopeCommand` provided but discouraged.) |
| Resolved current LTS not in `lts.supportedMajors` | Warn: config stale. Use `lts.fallbackMajor`. Encourage user to update skill. |

## Important Constraints

- **Bootstrap is Node-free.** Skill orchestrates native tools only — invariant for bootstrapping Node.
- **No `curl | sh`.** Scripts must be downloaded, optionally verified, then run. Pipe-to-shell refused even if requested.
- **Dry-run by default.** `--apply` mandatory for execution.
- **Two independent gates.** Neither skippable. Neither persisted.
- **User-scope by default.** `--scope system` discouraged.
- **LTS by default.** `--version` must explicitly deviate.
- **Uninstall always quoted** in dry-run and post-execution verification.
- **No multi-install chains.** Installs Node only. Route `npm`-global packages or scaffolding to other skills.
- **Config is source of truth.** SKILL.md must not duplicate values. Updates are JSON edit + `lastUpdated` bump.

## Reference Files

| File | Purpose |
|---|---|
| `SKILL.md` | Workflow and gates. |
| `resources/install-node.config.json` | Volatile knobs (LTS majors, manager commands, installer commands, bootstrap URLs). Re-read every invocation. |
| `resources/install-node.config.schema.json` | JSON Schema validating the config. |
| `docs/install-node-rationale.md` | Prose rationale — why each platform recommendation is what it is. |
| `LICENSE.txt` | MIT license. |

Ships no script files. Entire contract lives in SKILL.md + config JSON, executed by Claude against the user's terminal via native tools.
