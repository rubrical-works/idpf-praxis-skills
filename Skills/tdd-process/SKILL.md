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
category: tdd
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

## Requires

IDPF Praxis framework. The JSON is consumed by framework command specs (`/work` Step 3). Without the framework installed, this skill has no effect.
