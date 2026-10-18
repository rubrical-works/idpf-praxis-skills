---
name: responsibility-gate
description: Shared specification for the per-invocation responsibility-acknowledgement gate that every install-capable or modify-capable skill must present before executing any install, modify, or uninstall path. Defines when the gate fires, what it asks, decline behavior, and the per-invocation (never persisted) requirement.
type: reference
disable-model-invocation: true
version: "1.0.1"
frameworkCompatibility: ">=0.80.0"
lastUpdated: "2026-10-17"
license: Complete terms in LICENSE.txt
category: devops
relevantTechStack: [skill-authoring, safety, installation, user-consent]
copyright: "Rubrical Works (c) 2026"
---
# Responsibility-Acknowledgement Gate (Shared Pattern)
Defines the **responsibility-acknowledgement gate** — a mandatory, per-invocation user consent step every install-capable or modify-capable skill must present before any install, modify, or uninstall action on the user's system.
**Single source of truth.** Install-capable skills do not re-describe the gate; they reference this document by name (`see responsibility-gate skill for the pattern`) and cite the relevant section.
## When this skill is relevant
Reference skill — never auto-invoked, no user-facing workflow. Relevant when:
- Authoring a skill that installs, configures, or modifies software on the user's system
- Reviewing an existing skill for gate compliance
- Updating `install-node`, `flask-setup`, `playwright-setup`, or any skill on the in-scope list (see Audit)
## The Gate — Contract
Every install-capable skill MUST implement all of the following:
### 1. When the gate fires
**Before any execution path** that:
- installs software (package manager invocations, script downloads-and-runs, binary downloads)
- modifies system state (PATH edits, shell rc files, system services, daemons)
- uninstalls software the skill previously installed
- applies non-reversible configuration changes (cloud-CLI authentication, credential writes, registry edits)
Fires once per **execution path**, not once per invocation — a skill proposing both `install` and `configure` gates both.
**MUST NOT fire for read-only operations** (status checks, version probes, file reads) — overuse trains users to dismiss it.
### 2. What the gate asks
`AskUserQuestion` with wording structurally equivalent to:
```
I'm about to {action description} on your system. This skill does not persist your acknowledgement — you will see this prompt every time the skill proposes an execution path.

Do you accept responsibility for the change this skill will make to {what it changes — e.g., your Node installation, system PATH, and version-manager state}?

Options:
  - "I accept responsibility — proceed"
  - "Decline — exit without changes"
```
Skills MAY add options (e.g., "Preview the command first") but MUST include the two above. The accept option MUST require explicit selection — no pre-selected default.
### 3. Decline behavior
- Exit cleanly with **zero system changes**
- Report `"Declined — no changes made."` (or equivalent)
- No retry, no "are you sure?", no routing to an alternative execution path without re-firing the gate
### 4. Per-invocation, never persisted
- Acceptance state must not be persisted to disk, environment, session storage, or any cache
- Every subsequent invocation proposing an execution path MUST present the gate again
- Passing the gate once MUST NOT skip it on the next invocation, even for the same action on the same system
Rationale: the gate transfers responsibility at the moment of action; persisted acknowledgement lets stale consent authorize actions the user has not explicitly approved.
### 5. Independence from command-confirmation
Independent of any command-confirmation step. A skill that also needs an exact command confirmed (e.g., `install-node` Step 7) presents **two separate prompts**: responsibility first, then command. Bundling both in one prompt is NOT compliant.
### 6. Degradation when `AskUserQuestion` is unavailable
If the gate cannot be presented (tool not permitted, sandbox, non-interactive shell):
- MUST NOT execute the gated action
- SHOULD report the recommended command and that the gate could not fire
- SHOULD exit cleanly
Never fall back to "proceed without the gate" — silent execution defeats the pattern.
## How to reference this skill from another SKILL.md
```markdown
### Step N — Responsibility Acknowledgement Gate

This step implements the pattern defined in the `responsibility-gate` skill. See `Skills/responsibility-gate/SKILL.md` for the full contract.

- **When this fires:** before {action description}.
- **What is asked:** acceptance of responsibility for {what the skill changes}.
- **On decline:** exit cleanly; report "Declined — no changes made."; make no system changes.
- **Persistence:** per-invocation; the gate re-fires on every subsequent run.
```
Do not reproduce the contract prose; linking to `Skills/responsibility-gate/SKILL.md` is the compliant reference.
## Audit — in-scope skills (2026-04-19)
These install, configure, or modify software and MUST implement the gate:
| Skill | Action |
|---|---|
| `install-node` | Installs Node.js via winget / brew / nvm; modifies PATH. |
| `flask-setup` | `pip install flask`; creates virtualenv. |
| `sinatra-setup` | `gem install sinatra`; runs `bundle install`. |
| `sqlite-integration` | Installs sqlite client library via gem/pip. |
| `playwright-setup` | `npm install @playwright/test`; downloads browser binaries via `playwright install`. |
| `vercel-project-setup` | Installs Vercel CLI. |
| `render-project-setup` | Installs Render CLI. |
| `railway-project-setup` | Installs Railway CLI. |
| `digitalocean-app-setup` | Installs `doctl`. |
| `i18n-setup` | Installs i18n libraries (`i18next`, `react-intl`, etc.). |
| `postgresql-integration` | Installs PostgreSQL client library. |
| `observability-setup` | Installs OpenTelemetry SDK packages. |
| `react-native-android-setup` | Installs JDK 17, Android command-line tools, SDK packages and Maestro; sets user environment variables and PATH; moves AVDs; admin phase changes OS networking and hypervisor settings and needs a reboot. Added 2026-10-17 (#343). |
### Borderline — reclassified in this audit
| Skill | Original flag | Final classification | Reason |
|---|---|---|---|
| `electron-cross-build` | borderline | **in-scope** | Toolchain setup (Wine, NSIS, signing certs) — real system changes. |
| `electron-development` | borderline | **out of scope** | Injector skill carrying reference JSON; does not drive install commands. |
| `mutation-testing` | borderline | **out of scope** | Reference skill — install commands appear only in prose examples. |
| `common-errors` | borderline | **out of scope** | Educational — install commands appear in error examples only. |
| `beginner-testing` | borderline | **out of scope** | Educational — install commands appear in tutorial prose only. |
## Authoring guidance
Ask: **"does this skill execute any command that changes the user's system state?"** If yes, it is in scope.
- Add a `Step N — Responsibility Acknowledgement Gate` section before the first execution step
- Link to `Skills/responsibility-gate/SKILL.md`
- Add a behavior note at the end of SKILL.md: "Decline at the responsibility gate exits cleanly with no system changes."
- Do NOT reproduce the full contract inline — single source of truth is enforced by convention and review
New install-capable skills without a gate reference MUST fail review.
## Why this is a separate skill, not a doc
- **Discoverability:** skills are enumerated by `/skill-validate` and `build-skill-registry.js`; a docs fragment is not
- **Versioning:** skills carry semver, so contract changes are explicit and auditable
- **Distribution:** ships in the same pipeline as install-capable skills, so consumers always hold the contract
- **Single source of truth:** install-capable skills link by path; duplicating the prose is prohibited
## Reference files
| File | Purpose |
|---|---|
| `SKILL.md` | This file — the complete gate contract. |
| `LICENSE.txt` | MIT license. |
Ships with no data or script files.
