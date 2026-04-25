# install-node Rationale

This file preserves the original prose rationale for each platform/manager recommendation. SKILL.md no longer carries this detail — it now references `resources/install-node.config.json` for the executable parts. This document is for human readers (developers maintaining the skill, users curious why a route was chosen). It is not loaded by the skill at invocation.

## Platform Choices

### Windows — `winget` is the preferred route

`winget install --id OpenJS.NodeJS.LTS -e --scope=user` is the recommended Windows install. Rationale:

- **`-e` (exact)** forces an exact ID match. Without it, winget may match a similarly-named package, particularly as the package catalog grows.
- **`--scope=user`** installs into the user profile, avoiding both the admin elevation prompt and writes into `C:\Program Files`. Per-user is the default unless the user explicitly opts into `--scope system`.
- The `OpenJS.NodeJS.LTS` package ID is the official Node.js Foundation publisher's LTS channel — distinct from `OpenJS.NodeJS` (current/non-LTS).

### Windows — Why not Chocolatey

`choco install nodejs-lts` is in the discouraged list. Reason: introducing a new package manager as a side effect of installing Node is a heavy footprint for a single-runtime install. Chocolatey is fine when already in use; this skill should not pull it in.

### macOS — `brew` is the preferred route

`brew install node@<lts-major>` followed by `brew link --force --overwrite node@<lts-major>` if PATH does not pick up the binary. Rationale:

- The versioned formula (`node@20`, `node@22`) gives clean per-major isolation, important when other tools have specific major-version constraints.
- `brew link --force --overwrite` is needed because Homebrew keg-only formulas don't auto-link; `--overwrite` handles cases where a previous Node install is in the way.
- Uninstall is `brew uninstall node@<major>` — symmetric and clean.

### macOS — Why not the .pkg installer

The `.pkg` installer from nodejs.org writes to `/usr/local/bin/node`, `/usr/local/include/node/`, `/usr/local/lib/node_modules/` and several other system paths, and tracks them in a receipt under `/var/db/receipts/`. Removing it requires deleting paths from multiple locations or using a third-party uninstaller — fragile compared to `brew uninstall`. Use `brew` or a version manager.

### Linux — `nvm` is the preferred route

`nvm` runs per-user (no sudo), isolates Node versions in `$NVM_DIR` (default `$HOME/.nvm`), and supports trivial version switching. The bootstrap is the trickiest part — see below.

### Linux — Why not `apt install nodejs`

On most distros the packaged Node version is well behind LTS (often two majors back). The packaged version also sometimes ships with a renamed binary (`nodejs` instead of `node`) requiring symlink workarounds. `nvm` avoids both problems.

## The nvm Bootstrap Sequence

The Linux first-time install needs `nvm`, but `nvm` itself ships only as a bash install script. The skill follows a strict download → verify → run sequence:

1. **Print the script URL** (`versionManagers.nvm.bootstrap.scriptUrl`). The user sees what's about to run.
2. **Print the verify guidance** (`versionManagers.nvm.bootstrap.verifyGuidance`). The user is encouraged to inspect and `sha256sum` the downloaded script before executing.
3. **After the user confirms** (Step 7), run the `downloadCommand` to fetch the script to disk.
4. **Run the `runCommand`** to execute the downloaded (and ideally verified) script.

This is the only acceptable substitute for `curl ... | bash`, and it requires the user's explicit confirmation to proceed.

## Version Manager Preference Order

`versionManagers.preferenceOrder` is `[volta, fnm, nvm]`. Rationale:

- **`volta`** has the cleanest per-project pinning model (writes a `node` field into `package.json`) and the lowest install ceremony. First choice when present.
- **`fnm`** is a fast Rust reimplementation of nvm with cross-platform support and minimal startup overhead. Second choice.
- **`nvm`** is the historical default — broadest documentation and tribal knowledge, slightly slower shell startup. Third choice when neither volta nor fnm is present.

When more than one is installed, route through the first present in this order rather than picking arbitrarily.

## Per-Invocation Acknowledgement

The responsibility-acknowledgement gate (Step 6) **never persists** across invocations. This is a deliberate cost. Rationale:

- Installation is a destructive system change. Persisting an acknowledgement creates a path where a user accepts responsibility once during exploration, then later gets a different command applied without re-prompting.
- The skill is invoked rarely — the per-invocation prompt is not annoying.
- The two-gate model (responsibility + command-confirmation) is what makes `--apply` safe to ship; persisting either gate degrades the safety story.

## Why Bootstrap Must Be Node-Free

Several skills in this repository require Node on their critical path. If `install-node` itself depended on Node to run, it could never recover a Node-less environment. The skill therefore orchestrates only native tools (`Bash`, `AskUserQuestion`) — no `node` binary called at any point in its workflow. The config is plain JSON parseable by Claude without needing a JS runtime.
