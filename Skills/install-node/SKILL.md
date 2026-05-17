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
Helps users install Node.js with strong safety guardrails. Detects platform and existing Node/version-manager state, recommends a single vetted command from `resources/install-node.config.json`, executes only after explicit responsibility acknowledgement and command confirmation. Exists because several skills (e.g., `engage-exocortex`, `engage-prism`) require Node on critical path; users hitting missing-Node need a consistent, safe remediation path.
**This skill contains no executable install logic of its own.** It orchestrates native tool calls (`Bash`, `AskUserQuestion`) around a strict detect-first-act-second workflow. Itself runs without Node — that's the point: must be usable to bootstrap Node.
## When to use this skill
Invoke when:
- User asks how to install Node.js
- Another skill reports Node missing and routes here
- User wants to update existing Node to current LTS
- User wants to uninstall a Node installation this skill previously created
Do **not** use to:
- Install other runtimes (Python, Go, Ruby) — out of scope
- Manage Node versions after installation — defer to version manager directly
- Install Node on machine where skill cannot prompt user (no `AskUserQuestion`) — report recommended command from config and stop
## Options
| Flag | Description | Default |
|------|-------------|---------|
| `--apply` | Execute the recommended command after responsibility acknowledgement and user confirmation. Without this flag the skill runs in dry-run mode and prints the command instead of executing. | *(dry-run)* |
| `--version <spec>` | Target a specific Node version. Accepts `lts` (default), `latest`, or an explicit `X.Y.Z`. | `lts` |
| `--scope <scope>` | Install scope: `user` (default, per-user install) or `system` (requires admin/sudo). `system` is discouraged and emits an extra warning. | `user` |
| `--force-manager <name>` | Force a specific route by name (must be one of `versionManagers.preferenceOrder` from the config, or a platform `primaryRoute`). Used only when the auto-detected route is wrong. | *(auto)* |
## Step 0 — Re-read Config (MANDATORY)
Read `resources/install-node.config.json` from disk at start of every invocation. Validate against `resources/install-node.config.schema.json`. Do not rely on memory or prior runs — config is source of truth for every volatile value (LTS majors, manager commands, per-platform installer commands, bootstrap URLs).
All subsequent steps reference config values by JSON path (e.g., `platforms.windows.winget.installCommand`). If a step needs a value not in the config, that is a defect — report and stop; do not invent fallback inline.
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
**Two-gate rule:** Step 6 (responsibility) and Step 7 (command confirmation) are **independent** gates. Decline at either gate exits cleanly with zero system changes. Both must be presented on every invocation — acknowledgement is **per-invocation, never persisted** across runs.
## Step 1 — Detect Platform
`uname -s` (Linux → "Linux"; macOS → "Darwin"). On Windows, `uname` typically unavailable — check `$OS` (should contain `Windows_NT`) or existence of `$WINDIR`. Record platform as `windows`, `macos`, `linux` — keys under `platforms` in config.
## Step 2 — Detect Existing Node
`node --version` (e.g., "v20.11.0"); `which node` (POSIX; falls back to `command -v node`); Windows: `where node` (Git Bash works with node.exe path output). Normalize to semver major (e.g., `20`). Record absolute path to `node` (first hit).
### "Acceptable version" policy
By default, an existing installation is **acceptable** when its major version is in `lts.supportedMajors` from config. If `node` is present and acceptable, **do not propose an install** — report detected version and stop.
Current LTS major may be resolved live from `lts.resolveFrom` (e.g., `https://nodejs.org/dist/index.json`); on fetch failure, fall back to `lts.fallbackMajor`. Resolved current LTS must also appear in `lts.supportedMajors` — if not, config is stale; warn user this skill needs update.
If `--version` passed explicitly, target version drives acceptability: exact match acceptable, mismatch proposes install/route through detected version manager.
## Step 3 — Detect Version Managers
For each manager in `versionManagers.preferenceOrder`, run its `detectCommand` (or `windowsDetectCommand` if defined and Windows): `volta --version`, `fnm --version`, `nvm --version` (POSIX), `nvm version` (nvm-windows).
If any listed manager present, **must route through detected manager** rather than installing parallel system Node. When more than one installed, pick first present per `versionManagers.preferenceOrder`.
## Step 4 — Decide Route
| Condition | Route (config path) |
|---|---|
| Acceptable Node already present AND no `--version` override | **no-op** — report and stop |
| Version manager present | `versionManagers.<chosen>.installCommand` |
| Windows, no Node, no manager | `platforms.windows.winget.installCommand` |
| macOS, no Node, no manager | `platforms.macos.brew.installCommand` (followed by `linkCommand` if PATH does not pick up the binary) |
| Linux, no Node, no manager | `versionManagers.nvm.bootstrap.*` then `versionManagers.nvm.installCommand` |
| Any platform, user passed `--force-manager` | Route via the forced manager (skip auto-detection) |
**Never** use `curl ... | sh` or `wget ... | bash` style one-liners without inspection. Linux nvm bootstrap uses **download → verify → run** sequence under `versionManagers.nvm.bootstrap` — print `scriptUrl`, follow `verifyGuidance`, then `downloadCommand` followed by `runCommand` only after explicit confirm in Step 7.
## Step 5 — Produce the Dry-Run Output
Substitute config values into chosen command (replace `{packageId}`, `{major}`, `{scriptUrl}` placeholders), then emit structured block with: Platform; Detected Node; Detected Manager; Target Version; Scope; Command to run (copy-pasteable); Uninstall command (matching); Notes (platform-specific caveats from config's `_note` fields).
**Always print uninstall command alongside install command.** Every config entry with `installCommand` must have matching `uninstallCommand` — if missing, refuse to recommend that route.
## Step 6 — Responsibility Acknowledgement Gate (MANDATORY)
Use `AskUserQuestion`:
```
I'm about to install Node.js on your system. This skill does not persist your acknowledgement — you will see this prompt every time the skill proposes an execution path.

Do you accept responsibility for the change this skill will make to your Node installation, system PATH, and version-manager state?

Options:
  - "I accept responsibility — proceed" (required to continue)
  - "Decline — exit without changes"
```
- Accept → continue to Step 7.
- Decline → exit cleanly with no system changes. Report `"Declined — no changes made."` and stop.
This gate MUST fire on every invocation where execution path proposed, including `--apply` runs. Skipping for any reason is a defect.
## Step 7 — Command Confirmation Gate (MANDATORY)
Use `AskUserQuestion` with substituted command as question: "Run this exact command? {command}" with options "Yes, run this command", "No — exit without running", "Let me edit the command first".
- Yes → Step 8.
- No → exit cleanly. Report `"Confirmation declined — no changes made."` and stop.
- Edit → accept user's edited command, re-run Steps 6 and 7 (responsibility gate re-fires). Never execute edited command without re-confirmation.
## Step 8 — Execute (only if `--apply` AND both gates passed)
Run approved command via `Bash`. Timeout generously (installers can take minutes).
If command fails, report failure and uninstall command that would roll back any partial state. Do **not** retry automatically.
## Step 9 — Post-Execution Verification
```bash
node --version
```
Report:
- Installed version (from `node --version` after install).
- Path to binary (`which node` / `where node`).
- If version manager was used, `<manager> current`-equivalent output.
- Uninstall command, restated for user's records.
If `node --version` still fails after reported-success install, do not declare success. Report failure, dump last ~50 lines of installer output if available, and point user at uninstall command.
## Discouraged Routes
Config records discouraged routes per platform under `platforms.<platform>.discouraged`. Each entry includes `reason`. When user asks for one of these routes (e.g., by `--force-manager`), report reason from config and ask for explicit confirmation before proceeding. Do not silently substitute.
For background on each discouraged route (.pkg installer on macOS, distro Node packages on Linux, Chocolatey for first-time installs on Windows), see `docs/install-node-rationale.md`.
## Error Handling
| Situation | Response |
|---|---|
| `resources/install-node.config.json` missing or invalid | Report `"install-node config missing or fails schema validation — skill cannot proceed."` and exit. |
| `AskUserQuestion` unavailable | Report recommended command from config; **do not execute**. Exit cleanly. |
| Declined responsibility gate | `"Declined — no changes made."` → exit |
| Declined confirmation gate | `"Confirmation declined — no changes made."` → exit |
| `--apply` without confirmation | Cannot happen — Step 7 blocks it. |
| Installer command fails | Report failure + stderr tail + uninstall command. Do not retry. |
| Post-install verification fails | Do not declare success. Report failure + uninstall command. |
| `--version latest` on a skill that does not track "latest" | Accept; pass through to manager (which resolves `latest`). |
| `--scope system` on Windows | Warn: requires admin shell. Offer to switch to `--scope user` (config's `winget.systemScopeCommand` provided but discouraged). |
| Resolved current LTS not in `lts.supportedMajors` | Warn: config is stale. Use `lts.fallbackMajor`. Encourage user to update this skill. |
## Important Constraints
- **Bootstrap is Node-free.** Skill does not require Node to run — orchestrates native tools only. Invariant that makes skill useful for bootstrapping Node.
- **No `curl | sh`.** Scripts must be downloaded to disk, optionally verified, then run. One-line pipe-to-shell refused even if requested.
- **Dry-run by default.** Without `--apply`, skill never executes install command. `--apply` mandatory for execution.
- **Two independent gates.** Responsibility acknowledgement and command confirmation are separate prompts. Neither can be skipped. Neither can be persisted across invocations.
- **User-scope by default.** System-wide installs require `--scope system` and are discouraged.
- **LTS by default.** `--version` must be explicitly set to deviate from LTS.
- **Uninstall is always quoted.** Every install path declares matching uninstall command in dry-run output and post-execution verification.
- **No multi-install chains.** Installs Node. Does not bundle `npm`-global packages or set up project scaffolding. Route those to other skills.
- **Config is the source of truth.** SKILL.md must not duplicate values from `resources/install-node.config.json`. Updating LTS majors, package IDs, or installer commands is a JSON edit + `lastUpdated` bump.
## Reference Files
| File | Purpose |
|---|---|
| `SKILL.md` | This file — the workflow and gates. |
| `resources/install-node.config.json` | Volatile knobs (LTS majors, manager commands, per-platform installer commands, bootstrap URLs). Re-read at every invocation. |
| `resources/install-node.config.schema.json` | JSON Schema validating the config. |
| `docs/install-node-rationale.md` | Original prose rationale preserved during refurbishment. |
| `LICENSE.txt` | MIT license. |
The skill ships no script files. Entire contract lives in SKILL.md + config JSON, executed by Claude against user's terminal via native tools.
