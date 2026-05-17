---
name: responsibility-gate
description: Shared specification for the per-invocation responsibility-acknowledgement gate that every install-capable or modify-capable skill must present before executing any install, modify, or uninstall path. Defines when the gate fires, what it asks, decline behavior, and the per-invocation (never persisted) requirement.
type: reference
disable-model-invocation: true
version: "1.0.0"
frameworkCompatibility: ">=0.80.0"
lastUpdated: "2026-05-17"
license: Complete terms in LICENSE.txt
category: devops
relevantTechStack: [skill-authoring, safety, installation, user-consent]
copyright: "Rubrical Works (c) 2026"
---
# Responsibility-Acknowledgement Gate (Shared Pattern)
Defines the **responsibility-acknowledgement gate** — a mandatory, per-invocation user consent step every install-capable or modify-capable skill in this repository must present before executing any install, modify, or uninstall action on the user's system.
This document is the **single source of truth** for the pattern. Install-capable skills do not re-describe the gate in their own SKILL.md files; they reference this document by name (`see responsibility-gate skill for the pattern`) and cite the relevant section.
## When this skill is relevant
**Reference** skill — never auto-invoked, no user-facing workflow. Relevant when: authoring a new skill that installs/configures/modifies software on user's system; reviewing existing skill for gate compliance; updating any in-scope skill.
## The Gate — Contract
Every install-capable skill MUST implement the following, without exception:
### 1. When the gate fires
**Before any execution path** that:
- installs software (package manager invocations, script downloads-and-runs, binary downloads)
- modifies system state (PATH edits, shell rc files, system services, daemons)
- uninstalls software the skill previously installed
- applies non-reversible configuration changes (cloud-CLI authentication, credential writes, registry edits)
Gate fires once per **execution path**, not once per skill invocation. A skill proposing both `install` and `configure` actions must gate both.
**The gate MUST NOT fire for read-only operations** (status checks, version probes, file reads) — overusing the gate trains users to dismiss it.
### 2. What the gate asks
Use `AskUserQuestion` with wording structurally equivalent to:
```
I'm about to {action description} on your system. This skill does not persist your acknowledgement — you will see this prompt every time the skill proposes an execution path.

Do you accept responsibility for the change this skill will make to {what it changes — e.g., your Node installation, system PATH, and version-manager state}?

Options:
  - "I accept responsibility — proceed"
  - "Decline — exit without changes"
```
Skills MAY add more options (e.g., "Preview the command first") but MUST include the two above. The accept option MUST require explicit selection — no pre-selected default.
### 3. Decline behavior
When user declines:
- Skill exits cleanly with **zero system changes**.
- Skill reports `"Declined — no changes made."` (or functionally equivalent).
- Skill does not retry, does not offer "are you sure?", does not route to alternative execution path without re-firing the gate.
### 4. Per-invocation, never persisted
Acknowledgement MUST be **per-invocation**. Specifically:
- Acceptance state must not be persisted to disk, environment, session storage, or any cache.
- Every subsequent invocation that proposes an execution path MUST present the gate again.
- A skill passing the gate in one invocation MUST NOT skip it on the next invocation, even if the next invocation proposes the same action on the same system.
Rationale: gate transfers responsibility at exact moment of action. Persisted acknowledgement weakens that transfer by allowing stale consent to authorize later actions user has not explicitly approved.
### 5. Independence from command-confirmation
Responsibility gate is **independent** of any command-confirmation step. A skill that also needs user to confirm an exact command (e.g., `install-node`'s Step 7) must present **two separate prompts**: responsibility first, then command. A single prompt that bundles both is NOT compliant — bundling obscures what user is agreeing to.
### 6. Degradation when `AskUserQuestion` is unavailable
If skill cannot present `AskUserQuestion` (tool not permitted, sandboxed environment, non-interactive shell):
- Skill MUST NOT execute gated action.
- Skill SHOULD report recommended command and fact that gate could not fire.
- Skill SHOULD exit cleanly.
Do NOT fall back to "proceed without the gate" for any reason. Silent execution defeats the pattern.
## How to reference this skill from another SKILL.md
Add a step structured: heading `Step N — Responsibility Acknowledgement Gate`; opening line "This step implements the pattern defined in the `responsibility-gate` skill. See `Skills/responsibility-gate/SKILL.md` for the full contract."; bullets for **When this fires** (action), **What is asked** (changes), **On decline** ("exit cleanly; report 'Declined — no changes made.'; no system changes"), **Persistence** ("per-invocation; gate re-fires on every subsequent run").
SKILL.md does not need to reproduce contract prose. Linking to `Skills/responsibility-gate/SKILL.md` is the compliant reference.
## Audit — in-scope skills (2026-04-19)
These install/configure/modify software and MUST implement the gate: `install-node` (Node via winget/brew/nvm; PATH); `flask-setup` (`pip install flask`; virtualenv); `sinatra-setup` (`gem install sinatra`; `bundle install`); `sqlite-integration` (sqlite client via gem/pip); `playwright-setup` (`npm install @playwright/test`; browser binaries); `vercel-project-setup` (Vercel CLI); `render-project-setup` (Render CLI); `railway-project-setup` (Railway CLI); `digitalocean-app-setup` (`doctl`); `i18n-setup` (i18next, react-intl); `postgresql-integration` (PG client); `observability-setup` (OpenTelemetry SDK).
### Borderline — reclassified (#180)
| Skill | Final | Reason |
|---|---|---|
| `electron-cross-build` | **in-scope** | Toolchain setup (Wine, NSIS, signing certs). |
| `electron-development` | **out of scope** | Injector skill with reference JSON; no install commands. |
| `mutation-testing` | **out of scope** | Reference; install commands in prose examples only. |
| `common-errors` | **out of scope** | Educational; install commands in error examples only. |
| `beginner-testing` | **out of scope** | Educational; install commands in tutorial prose only. |
## Authoring guidance
When creating a new skill, ask: **"does this skill execute any command that changes the user's system state?"** If yes, the skill is in-scope for the gate.
- Add `Step N — Responsibility Acknowledgement Gate` section before first execution step.
- Link to `Skills/responsibility-gate/SKILL.md`.
- Add acceptance criterion at end of SKILL.md: "Decline at the responsibility gate exits cleanly with no system changes."
- Do NOT reproduce full contract inline — single-source-of-truth rule enforced by convention and review.
New install-capable skills without gate reference MUST fail review.
## Why this is a separate skill, not a doc
- **Discoverability.** Skills enumerated by `/skill-validate` and `build-skill-registry.js`. Reference skill visible in registry; buried docs fragment is not.
- **Versioning.** Skills carry semver. When gate contract evolves, version bump is explicit and auditable.
- **Distribution.** Ships inside same distribution pipeline as install-capable skills, so consumers always have contract in hand when they have any in-scope skill.
- **Single source of truth.** Install-capable skills link to this skill by path — duplication prohibited.
## Reference files
| File | Purpose |
|---|---|
| `SKILL.md` | This file — the complete gate contract. |
| `LICENSE.txt` | MIT license. |
This skill intentionally ships with no data or script files.
