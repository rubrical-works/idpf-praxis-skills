---
name: tdd-process
description: TDD phase enforcement checklists for RED/GREEN/REFACTOR cycle and failure recovery
type: injector
disable-model-invocation: true
user-invocable: false
defaultSkill: true
version: "1.0.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-04-01"
license: Complete terms in LICENSE.txt
category: testing
relevantTechStack: [tdd, testing]
copyright: "Rubrical Works (c) 2026"
---

# TDD Process

Consolidated injector skill carrying `tdd-checklist.json` — structured TDD enforcement consumed by `/work` Step 3 at each RED/GREEN/REFACTOR gate.

## What This Skill Provides

- `tdd-checklist.json` — Required checks and gates for each TDD phase
- `tdd-checklist-schema.json` — JSON Schema for validation

## How It Works

This skill is never invoked by Claude or the user. When installed as a project default, `/work` reads `tdd-checklist.json` directly from `.claude/skills/tdd-process/` at each TDD gate:

```
RED: Re-read tdd-checklist.json. Verify all red.required items. Do NOT cross red.gate.
GREEN: Verify all green.required items. Do NOT cross green.gate.
REFACTOR: Verify all refactor.required items. Do NOT cross refactor.gate.
On unexpected behavior: Follow failure-recovery.steps.
```

## Relationship to TDD Phase Skills

The 4 existing TDD phase skills (tdd-red-phase, tdd-green-phase, tdd-refactor-phase, tdd-failure-recovery) contain deep reference material — patterns, examples, and explanations. This skill replaces their enforcement role with structured JSON that commands consume deterministically.

## Refactor Coverage Audit (Optional Companion)

The refactor phase includes a `required[]` checklist item that invokes the `tdd-refactor-coverage-audit` companion skill. The audit mechanically checks whether source files added during the current TDD cycle have paired tests, using JSON-driven language conventions.

**Advisory only.** Warnings are surfaced inline; the audit never blocks the refactor gate (`gate` remains "Do not proceed to next AC until commit made for this TDD cycle"). The audit returns JSON `{ ok, newSources, missingTests, coverage }` to stdout — `/work` reports the warnings and continues.

**Invocation:**

```bash
node .claude/skills/tdd-refactor-coverage-audit/scripts/test-coverage-audit.js \
  --since-commit <last-cycle-sha>
```

**Graceful soft-skip.** If the audit script is not present in the project (i.e. the `tdd-refactor-coverage-audit` skill is not installed), `/work` skips the checklist item with a one-line notice:

```
Coverage audit skipped: tdd-refactor-coverage-audit skill not installed
```

The TDD gate is unaffected. Detection is a simple `fs.existsSync` on the script path; no error, no warning escalation.

**No code coupling.** `tdd-process` references `tdd-refactor-coverage-audit` only by name and invocation path in `tdd-checklist.json` (`refactor.required[]` and `refactor.deepReferences[]`). There are no imports, symlinks, or shared modules. The two skills remain independently installable.

**Schema:** `tdd-checklist-schema.json` accepts both the legacy single-object `deepReference` (used by `red`, `green`, `failure-recovery`) and the new `deepReferences[]` array form (used by `refactor`). Phases may use either or neither, but not both.

## Requires

IDPF Praxis framework. The JSON is consumed by framework command specs (`/work` Step 3). Without the framework installed, this skill has no effect.
