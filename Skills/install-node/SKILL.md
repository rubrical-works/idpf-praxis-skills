---
name: install-node
description: Safe, guided installer for Node.js. Detects existing Node and version managers, recommends a single vetted package-manager command per platform, runs dry-run by default, and requires explicit responsibility acknowledgement before any execution path. Bootstrap does not itself require Node.
type: invokable
version: "1.0.0"
frameworkCompatibility: ">=0.80.0"
lastUpdated: "2026-04-19"
license: Complete terms in LICENSE.txt
category: devops
relevantTechStack: [node, nodejs, nvm, fnm, volta, winget, brew, apt, installer]
copyright: "Rubrical Works (c) 2026"
---
# Install Node — Safe, Guided Node.js Installation
Safe Node.js install with detect-first-act-second workflow. Orchestrates native tools (`Bash`, `AskUserQuestion`); skill itself runs without Node so it can bootstrap Node. Required by skills like `engage-exocortex`, `engage-prism`.
## When to use this skill
- User asks how to install Node.js
- Another skill reports Node missing and routes here
- User wants to update Node to current LTS
- User wants to uninstall a Node install this skill created
Do NOT use for: other runtimes, post-install version management (defer to `nvm`/`fnm`/`volta`), or machines without `AskUserQuestion` (report command and stop).
## Options
| Flag | Description | Default |
|------|-------------|---------|
| `--apply` | Execute after both gates pass. Without it, dry-run. | *(dry-run)* |
| `--version <spec>` | `lts` (default), `latest`, or `X.Y.Z`. | `lts` |
| `--scope <scope>` | `user` (default) or `system` (discouraged, admin/sudo). | `user` |
| `--force-manager <name>` | Force `nvm`/`fnm`/`volta`/`winget`/`brew`/`apt`. | *(auto)* |
## Core Workflow
```
1. Detect platform (Windows / macOS / Linux)
2. Detect existing Node (`node --version`)
3. Detect version managers (nvm/fnm/volta)
4. Branch:
   - Node present and acceptable → report, STOP
   - Version manager present → recommend via manager
   - No Node, no manager → per-platform package manager
5. Print recommended command (dry-run) + uninstall command
6. Responsibility Acknowledgement Gate (MANDATORY)
7. Command Confirmation Gate (MANDATORY)
8. Execute only if --apply AND both gates passed
9. Post-execution verification: `node --version`
```
**Two-gate rule:** Steps 6 and 7 are independent. Decline at either exits cleanly. Both presented every invocation — per-invocation, never persisted.
## Step 1 — Detect Platform
```bash
uname -s     # Linux → "Linux"; macOS → "Darwin"
```
Windows: check `$OS` contains `Windows_NT` or `$WINDIR` exists. Record as `windows`/`macos`/`linux`.
## Step 2 — Detect Existing Node
```bash
node --version
which node    # or: command -v node
```
Windows: `where node`. Normalize to semver major. Record absolute path to `node`.
### "Acceptable version" policy
Default: active LTS or previous LTS (Node 20 or 22 as of `lastUpdated`). If present and acceptable, do not propose install — report and stop. If `--version` passed, exact match is acceptable; mismatch proposes install.
## Step 3 — Detect Version Managers
```bash
nvm --version
fnm --version
volta --version
```
Windows: `nvm` is `nvm-windows` — detect via `nvm version` or `where nvm`. If any present, route through detected manager. Preference: `volta` > `fnm` > `nvm`.
## Step 4 — Decide Route
| Condition | Route |
|---|---|
| Acceptable Node present AND no `--version` override | **no-op** — report, stop |
| Version manager present | `manager-install` |
| Windows, no Node/manager | `winget install --id OpenJS.NodeJS.LTS -e --scope=user` |
| macOS, no Node/manager | `brew install node@<lts-major>` (then `brew link --force --overwrite node@<lts-major>`) |
| Linux, no Node/manager | `nvm-bootstrap` — bootstrap `nvm` after gate, then `nvm install --lts` |
| `--force-manager` passed | Route via forced manager |
**Never** use `curl ... | sh` / `wget ... | bash` without inspection. On Linux, print script URL for inspection, include `sha256sum` verify step, do download + run only after Step 7.
## Step 5 — Dry-Run Output
```
Recommended Install
-------------------
Platform:          {windows | macos | linux}
Detected Node:     {version | none}
Detected Manager:  {nvm | fnm | volta | none}
Target Version:    {lts | latest | X.Y.Z}
Scope:             {user | system}

Command to run:
  {command}

Uninstall command (keep this):
  {uninstall command}

Notes:
  - {platform-specific caveat}
```
Always print uninstall alongside install.
## Step 6 — Responsibility Acknowledgement Gate (MANDATORY)
Use `AskUserQuestion`:
```
I'm about to install Node.js on your system. This skill does not persist your acknowledgement — you will see this prompt every time the skill proposes an execution path.

Do you accept responsibility for the change this skill will make to your Node installation, system PATH, and version-manager state?

Options:
  - "I accept responsibility — proceed"
  - "Decline — exit without changes"
```
Accept → Step 7. Decline → exit `"Declined — no changes made."`. MUST fire every invocation with execution path, including `--apply`.
## Step 7 — Command Confirmation Gate (MANDATORY)
Use `AskUserQuestion` with the exact command:
```
Run this exact command?

  {the command}

Options:
  - "Yes, run this command"
  - "No — exit without running"
  - "Let me edit the command first"
```
Yes → Step 8. No → `"Confirmation declined — no changes made."`. Edit → re-run Steps 6 and 7 with edited command.
## Step 8 — Execute (only if `--apply` AND both gates passed)
Run approved command via `Bash`. Timeout generously. On failure, report failure + uninstall command. Do not retry.
## Step 9 — Post-Execution Verification
```bash
node --version
```
Report: installed version, binary path (`which node`/`where node`), `<manager> current` if applicable, restate uninstall command.
If `node --version` fails after reported-success install, do not declare success. Dump last ~50 lines of installer output; point at uninstall command.
## Platform-Specific Recommendations
### Windows
- **Preferred:** `winget install --id OpenJS.NodeJS.LTS -e --scope=user`
- **Uninstall:** `winget uninstall --id OpenJS.NodeJS.LTS`
- **Do not use:** `choco install nodejs-lts` unless user already uses Chocolatey.
### macOS
- **Preferred:** `brew install node@20` (replace `20` with current LTS major).
- **Post-install:** `brew link --force --overwrite node@20` if PATH doesn't pick up binary.
- **Uninstall:** `brew uninstall node@20`
- **Do not use:** `.pkg` from nodejs.org — writes to system paths, hard to uninstall.
### Linux
- **Preferred:** `nvm` (per-user, no sudo).
- **Bootstrap:**
  1. Print URL: `https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh`
  2. Print `sha256sum` verification line.
  3. After Step 7: `curl -o nvm-install.sh <URL>`, verify, `bash nvm-install.sh`.
- **Use:** `nvm install --lts` + `nvm use --lts`.
- **Uninstall:** `rm -rf "$NVM_DIR"` + remove nvm init block from rc.
- **Avoid:** `apt install nodejs` — usually behind LTS.
## Version-Manager Routing
Preference `volta` > `fnm` > `nvm`:
- **volta:** `volta install node@lts`
- **fnm:**   `fnm install --lts && fnm use lts`
- **nvm:**   `nvm install --lts && nvm alias default lts/*`
## Error Handling
| Situation | Response |
|---|---|
| `AskUserQuestion` unavailable | Report command; do not execute. |
| Declined responsibility gate | `"Declined — no changes made."` → exit |
| Declined confirmation gate | `"Confirmation declined — no changes made."` → exit |
| `--apply` without confirmation | Cannot happen — Step 7 blocks it. |
| Installer fails | Report failure + stderr tail + uninstall. No retry. |
| Post-install verification fails | Do not declare success. Report + uninstall. |
| `--version latest` | Pass through to manager. |
| `--scope system` on Windows | Warn: admin shell required. Offer `--scope user`. |
## Important Constraints
- **Bootstrap is Node-free.** Skill does not require Node to run.
- **No `curl | sh`.** Scripts must be downloaded + (optionally) verified before running.
- **Dry-run by default.** `--apply` required for execution.
- **Two independent gates.** Neither skippable, neither persisted.
- **User-scope by default.** System requires `--scope system`, discouraged.
- **LTS by default.**
- **Uninstall is always quoted.**
- **No multi-install chains.** Does not bundle npm globals or scaffolding.
## Reference Files
| File | Purpose |
|---|---|
| `SKILL.md` | This file. |
| `LICENSE.txt` | MIT license. |
Ships with no data or script files. Contract lives in SKILL.md, executed via native tools.
