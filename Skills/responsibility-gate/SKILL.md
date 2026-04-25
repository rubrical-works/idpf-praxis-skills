---
name: responsibility-gate
description: Shared specification for the per-invocation responsibility-acknowledgement gate that every install-capable or modify-capable skill must present before executing any install, modify, or uninstall path. Defines when the gate fires, what it asks, decline behavior, and the per-invocation (never persisted) requirement.
type: reference
version: "1.0.0"
frameworkCompatibility: ">=0.80.0"
lastUpdated: "2026-04-19"
license: Complete terms in LICENSE.txt
category: devops
relevantTechStack: [skill-authoring, safety, installation, user-consent]
copyright: "Rubrical Works (c) 2026"
---
# Responsibility-Acknowledgement Gate (Shared Pattern)
Single source of truth for the mandatory per-invocation user consent step every install/modify-capable skill must present before executing install, modify, or uninstall actions. Install-capable skills reference this document (`see responsibility-gate skill`) rather than re-describing the gate.
## When this skill is relevant
Reference skill — never auto-invoked. Relevant when:
- Authoring a new skill that installs, configures, or modifies software.
- Reviewing a skill for gate compliance.
- Updating any in-scope skill (see Audit).
## The Gate — Contract
Every install-capable skill MUST implement the following without exception:
### 1. When the gate fires
Before any execution path that:
- installs software (package manager, script download-and-run, binary download)
- modifies system state (PATH edits, shell rc files, services, daemons)
- uninstalls software the skill previously installed
- applies non-reversible config (cloud-CLI auth, credential writes, registry edits)

Fires once per **execution path**, not per skill invocation. A skill proposing both `install` and `configure` must gate both. MUST NOT fire for read-only ops (status, version, file reads) — overuse trains dismissal.
### 2. What the gate asks
Use `AskUserQuestion` with wording structurally equivalent to:
```
I'm about to {action description} on your system. This skill does not persist your acknowledgement — you will see this prompt every time the skill proposes an execution path.

Do you accept responsibility for the change this skill will make to {what it changes — e.g., your Node installation, system PATH, and version-manager state}?

Options:
  - "I accept responsibility — proceed"
  - "Decline — exit without changes"
```
Skills MAY add options (e.g., "Preview the command first") but MUST include the two above. Accept MUST require explicit selection — no pre-selected default.
### 3. Decline behavior
On decline: exit cleanly with **zero system changes**; report `"Declined — no changes made."` (or equivalent); do not retry, do not offer "are you sure?", do not route to alternative path without re-firing the gate.
### 4. Per-invocation, never persisted
- Acceptance state MUST NOT be persisted to disk, env, session storage, or cache.
- Every subsequent invocation proposing an execution path MUST re-present the gate.
- A skill that passed the gate once MUST NOT skip it next time, even for same action on same system.

Rationale: the gate transfers responsibility at the moment of action. Persisted acknowledgement lets stale consent authorize later actions.
### 5. Independence from command-confirmation
The responsibility gate is **independent** of any command-confirmation step. A skill needing both must present **two separate prompts**: responsibility first, then command. Bundling is NOT compliant.
### 6. Degradation when `AskUserQuestion` is unavailable
If unavailable (tool not permitted, sandboxed, non-interactive):
- MUST NOT execute the gated action.
- SHOULD report the recommended command and that the gate could not fire.
- SHOULD exit cleanly.

Do NOT fall back to "proceed without the gate". Silent execution defeats the pattern.
## How to reference this skill from another SKILL.md
```markdown
### Step N — Responsibility Acknowledgement Gate

This step implements the pattern defined in the `responsibility-gate` skill. See `Skills/responsibility-gate/SKILL.md` for the full contract.

- **When this fires:** before {action description}.
- **What is asked:** acceptance of responsibility for {what the skill changes}.
- **On decline:** exit cleanly; report "Declined — no changes made."; make no system changes.
- **Persistence:** per-invocation; the gate re-fires on every subsequent run.
```
Linking to `Skills/responsibility-gate/SKILL.md` is compliant; do not reproduce contract prose.
## Audit — in-scope skills (2026-04-19)
| Skill | Action |
|---|---|
| `install-node` | Installs Node.js via winget / brew / nvm; modifies PATH. |
| `flask-setup` | `pip install flask`; creates virtualenv. |
| `sinatra-setup` | `gem install sinatra`; runs `bundle install`. |
| `sqlite-integration` | Installs sqlite client library via gem/pip. |
| `playwright-setup` | `npm install @playwright/test`; downloads browser binaries. |
| `vercel-project-setup` | Installs Vercel CLI. |
| `render-project-setup` | Installs Render CLI. |
| `railway-project-setup` | Installs Railway CLI. |
| `digitalocean-app-setup` | Installs `doctl`. |
| `i18n-setup` | Installs i18n libraries (`i18next`, `react-intl`, etc.). |
| `postgresql-integration` | Installs PostgreSQL client library. |
| `observability-setup` | Installs OpenTelemetry SDK packages. |
### Borderline — reclassified
| Skill | Final | Reason |
|---|---|---|
| `electron-cross-build` | **in-scope** | Toolchain setup (Wine, NSIS, signing certs). |
| `electron-development` | **out of scope** | Injector skill; no install commands. |
| `mutation-testing` | **out of scope** | Reference; install in prose only. |
| `common-errors` | **out of scope** | Educational; install in error examples only. |
| `beginner-testing` | **out of scope** | Educational; install in tutorial prose only. |
## Authoring guidance
Ask: **"does this skill execute any command that changes the user's system state?"** If yes, in-scope.
- Add `Step N — Responsibility Acknowledgement Gate` before the first execution step.
- Link to `Skills/responsibility-gate/SKILL.md`.
- Add acceptance criterion: "Decline at the responsibility gate exits cleanly with no system changes."
- Do NOT reproduce the contract inline.

New install-capable skills without a gate reference MUST fail review.
## Why a separate skill, not a doc
- **Discoverability.** Enumerated by `/skill-validate` and `build-skill-registry.js`.
- **Versioning.** Semver; contract evolution is explicit and auditable.
- **Distribution.** Ships in the same pipeline as install-capable skills.
- **Single source of truth.** Install-capable skills link by path; duplication prohibited.
## Reference files
| File | Purpose |
|---|---|
| `SKILL.md` | Complete gate contract. |
| `LICENSE.txt` | MIT license. |

Ships with no data or script files.
