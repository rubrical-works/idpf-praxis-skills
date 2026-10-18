---
name: diff-review
description: Lightweight, unanchored per-diff code review against an issue's acceptance criteria and the project charter, emitting machine-readable findings
type: injector
disable-model-invocation: true
user-invocable: false
defaultSkill: true
version: "1.1.0"
frameworkCompatibility: ">=0.108.0"
lastUpdated: "2026-10-18"
license: Complete terms in LICENSE.txt
category: code-quality
relevantTechStack: [code-review, git, json-schema]
copyright: "Rubrical Works (c) 2026"
---

# Diff Review

Injector skill carrying `review-criteria.json` and `output-schema.json` — the contract for a **lightweight, unanchored, per-diff code review** performed by a read-only reviewer Agent that a framework command spawns. The reviewer reads one commit range, judges it against the issue's acceptance criteria and the project charter, and returns a findings document a script can act on without reading prose.

Primary consumer: the Merge-Back Review Gate (Tier 3) of concurrent `/work --nonstop`, which reviews each member's worktree branch before it is merged back onto the shared tracker branch. The skill is the last independent read before code lands.

## What This Skill Provides

| File | Purpose |
|------|---------|
| `review-criteria.json` | The criteria the reviewer evaluates — id, severity, what to check, what counts as evidence — plus the read budget, the verdict rule and the opt-in extension |
| `review-criteria-schema.json` | JSON Schema (draft-07) that `review-criteria.json` validates against. The criteria file's own `$schema` names the draft-07 meta-schema, as draft-07 requires of that keyword; this companion is named here and by its `$id`, not through `$schema` |
| `output-schema.json` | JSON Schema (draft-07) for the findings document the reviewer returns |
| `resources/HOWTO.md` | Worked example: a reviewer prompt, the resulting findings document, and wiring for non-IDPF projects |

## Input Contract

The reviewer receives exactly these inputs:

| Input | Form | Why |
|-------|------|-----|
| Commit range | `<base>..<branch>`, e.g. `skills/0.23.0..work/375` | The only code under review: the branch's commits since its merge base with `<base>`. Nothing outside that set is judged — see Read Budget for why `git diff` is run with three dots |
| Issue number and its acceptance criteria | `#N` plus the AC checklist text, and the issue's `Files to modify:` declaration when one exists | Every hunk is mapped against these |
| Charter path | `CHARTER.md` (or the project's equivalent) | Tech stack, conventions and declared spelling policy |
| Domain ids | Optional list, e.g. `security`, `accessibility` | Narrows which extension checks apply; absent means core criteria only |

**Explicitly not inputs — the read is unanchored.** The implementer's summary is never an input, and neither is the implementing agent's report, any prior verdict, or any statement of what the diff is "supposed" to do beyond the acceptance criteria themselves. Commit messages are read only to check `Refs #N`; their descriptions are not trusted as evidence of what the code does. A reviewer handed the implementer's account tends to confirm it; withholding it is what makes the second read independent.

## Read Budget

What makes this review lightweight is a **count-first** read, the same pattern the framework's prior-art sweep uses:

1. **Count before reading.** Run `git diff --numstat <base>...<branch>` to list every changed file with its added and removed line counts, and `git log --oneline <base>..<branch>` to list the commits. Record the file list, the per-file counts and the totals in the findings document's `budget` block before any hunk is read. The dot counts differ on purpose: for `git log`, `A..B` is the commit range `^A B`; for `git diff`, `A..B` compares the two endpoints and `A...B` compares from their merge base, so only the three-dot form confines the diff to the branch's own commits once `<base>` has moved on. Every `git diff` the reviewer runs uses three dots; `git log` keeps two. A numstat row of `-` `-` is a binary file: list it in `budget.binaryFiles[]` by path, count it as 0 lines in the totals and treat it as changed but unreadable. Never invent a line count for it and never drop it — a binary file in the range is itself something the `scope-declared` check must see.
2. **Read within caps.** The caps come from `review-criteria.json` → `budget`: `filesReadInFull` (default 20) and `diffLinesReadInFull` (default 1500). The caller may override either. Read files in `budget.readOrder`: files the issue declares in `Files to modify:` first, then test files, then the remaining files by diff size ascending, so the files most likely to decide the verdict are read while budget remains.
3. **Report what was not read.** A file not read in full because a cap was reached is listed in `budget.countedNotRead[]` with its path and line count. Counted-not-read files are never silently dropped or omitted: the count is itself evidence, and the verdict rule below caps a review that could not read everything at `warn`.

Every criterion is still evaluated against what was read; the `budget` block tells the consumer how complete the read was.

## Criteria

Re-read `review-criteria.json` from disk and evaluate **every** entry in `criteria[]` — the reviewer cannot skip one. Each criterion carries an `id`, a `severity` (`fail` or `warn`), a `check` describing what to look for and an `evidence` line describing what a finding must cite. The core set covers: every hunk maps to an acceptance criterion or is flagged unrelated; no files outside the declared scope; tests present for new behavior; tests authentic (judged by the framework's `/bad-test-review` criteria, which this skill points at rather than restates); charter conventions honored; obvious security faults; every commit in range carries `Refs #N`; the declared spelling policy honored; no debugging leftovers.

**Emit at least one finding per criterion.** A criterion with no violation emits one `pass` finding so the consumer can see it was evaluated; each violation emits its own `warn` or `fail` finding at the criterion's severity, naming the file and line.

## Output Contract

The reviewer's final message is **one JSON document and nothing else**, valid against `output-schema.json`:

- `issue`, `range`, `budget` — what was reviewed and how completely.
- `findings[]` — one entry per finding: `criterion` id, `file`, `line` (null when the finding is not line-anchored, such as a commit message), `status` of `pass` / `warn` / `fail`, and `evidence` quoting or locating what was seen. Same shape as the framework's `findings-schema.json` entries so review tooling can read both.
- `verdict` — **exactly one** of `pass`, `warn`, `fail`, derived by `review-criteria.json` → `verdict`: any `fail` finding → `fail`; otherwise any `warn` finding or a non-empty `countedNotRead[]` → `warn`; otherwise `pass`.

The gate acts on `verdict` and routes `findings[]` without reading prose. No recommendation text, no summary paragraph.

## Optional Extension: anti-pattern-analysis

Not loaded by default. When the caller names the `anti-patterns` domain id, read the checklist at `review-criteria.json` → `extensions.anti-pattern-analysis.path` (the installed `anti-pattern-analysis` skill's `resources/code-review-checklist.md`) and emit any matches as findings whose `criterion` carries that extension's `criterionPrefix`. Skip with a one-line `pass` finding naming the extension when the skill is not installed.

## How IDPF Projects Use This

A framework command builds the reviewer prompt from `resources/HOWTO.md`'s template, spawns a read-only Agent with it, and parses the returned JSON. The Agent reads `.claude/skills/diff-review/review-criteria.json` from disk at review time; the command validates the document against `.claude/skills/diff-review/output-schema.json` before acting on the verdict.

## Requires

IDPF Praxis framework for automatic consumption. Without the framework, wire the skill by hand per `resources/HOWTO.md`.
