# engage-forge — Heuristic Audit + Critique Passes

This document explains the two mandatory quality gates that run on every `engage-forge` invocation: the heuristic audit pass and the persona-driven critique pass.

Both passes run **after** synthesis-as-comparison and **before** the proposal is written. Both apply to the recommended (or top-scoring) artefact. Neither pass has an opt-out flag — they are part of the skill's contract.

---

## The Heuristic Audit Pass (Step 4)

### What it does

Applies a heuristic checklist to the recommended artefact and surfaces findings as a heuristic-finding matrix:

| Heuristic | Artefact Element | Severity | Finding | Recommendation |
|---|---|---|---|---|

Severity is one of `pass | minor | major | critical`. Findings that aren't pass carry a recommendation.

### Checklist selection

The `--audit-checklist` flag picks the checklist:

| Flag value | Use case |
|---|---|
| `nielsen-10` (default) | General-purpose UI/UX heuristic checklist. Applies to most artefact types. |
| `wcag-aa` | When the artefact must support accessibility constraints. Bundled subset filters to checkpoints assessable from a text-based artefact. |
| `custom <path>` | User-supplied checklist conforming to `resources/heuristic-checklist-schema.json`. |

Unknown values fail cleanly with the valid-values list.

### Operational graft

The audit's distinctive move: for each heuristic where the recommended artefact doesn't pass, the audit checks whether a non-winning path's artefact scores higher on that specific heuristic. If yes, the audit emits an **operational-graft recommendation**:

```
Graft recommendation: Path {N}'s {specific structural element} scores
higher on {heuristic} than the recommended Path {M}'s {element}.
Transplant the structural pattern: {specific element}.
```

The graft is **structural**, not merged-artefact. It names a specific element (a flow step, an IA branch, a journey-map row) that can be lifted from the non-winning path and adopted by the winner. The graft never produces a merged artefact — engage-forge synthesis is comparison-not-merger (Step 3 contract). The graft mechanism is the only sanctioned cross-path combination, and it operates along a single heuristic axis.

The operational-graft mechanism is the design-domain analog of `/engage-exocortex`'s operational scoring: the path that wins on cost may lose on cache-locality, and the right move is to graft the loser's data-locality pattern onto the winner's cost-optimal core. In `engage-forge`, the analog is grafting a structural element along a heuristic axis.

If no non-winning path outscores the winner on any heuristic, `graftRecommendation` is `null` and the audit output is the matrix + most-severe-finding summary alone.

### Audit output contract

The audit output schema requires:

- `checklistId` — which checklist was applied.
- `subjectArtefact` — which path was audited.
- `findings[]` — at least one finding entry.
- `mostSevereFinding` — the highest-severity finding (named explicitly so users don't have to sort the matrix).
- `graftRecommendation` — either `null` or a fully-specified transplant instruction.

Missing any of these fails schema validation against `resources/heuristic-audit-output-schema.json`.

---

## The Critique Pass (Step 5)

### What it does

A **separate subagent** with a named persona walks the recommended artefact as a first-time user. The subagent produces **exactly three friction points**, each referencing a specific artefact element.

### Why exactly three

- **Fewer than three** understates the stress test. Even a strong recommendation has three improvable aspects; a critique reporting fewer is signaling laziness, not validation.
- **More than three** dilutes prioritization. A critique with 7 friction points is hard to act on — which three matter most? Three forces the persona to triage at output time.
- **Three** is a deliberate constraint, not a soft target. The schema rejects outputs with fewer or more.

### Persona selection

The `--persona` flag selects the persona:

| Source | Behavior |
|---|---|
| `--persona <free-text-name>` | Primary agent fills in plausible attributes (goal, technical comfort, prior knowledge, accessibility needs, context) and proceeds. |
| `--persona <path-to-json>` | Validate against `resources/persona-schema.json`; halt on validation failure. |
| `--persona` omitted | Primary agent selects a plausible persona from the problem statement, names the selection in the proposal, and proceeds. The user can re-run with an explicit persona if the selection was wrong. |

The `selectionSource` field on the critique output names which of these happened — useful for users reviewing the proposal who want to know whether the persona was supplied or inferred.

### Critique output contract

Each friction point requires:

- `artefactElement` — a specific reference to the element ("Step 4 of the flow", "Stage 'Evaluate' of the journey map", "Feature: Order tracking"). Empty or missing artefactElement fails validation.
- `friction` — what's wrong, in the persona's voice.
- `remediation` — concrete suggestion (≤2 sentences).

The persona block requires `name` and accepts the full optional persona shape from `resources/persona-schema.json` (goal, technicalComfort, accessibilityNeeds, context, etc.).

---

## Why both passes are mandatory

The heuristic audit catches **structural** issues — does the recommended artefact fail on visibility-of-system-status? Match-with-real-world? Error-prevention? Heuristics are checklist-driven, so the audit is reproducible and comprehensive within the checklist's scope.

The critique pass catches **lived-experience** issues — what does this artefact feel like to a specific person in a specific context? The persona's voice surfaces things a heuristic checklist misses: the bus-commuter's intermittent connectivity, the screen-reader user's announcement-cadence, the new-team-member's missing context.

A single-pass design recommendation is brittle. Either an unaudited recommendation ships with a structural gap, or an uncritiqued recommendation ships with a lived-experience gap. Both passes mandatory keeps the recommendation honest.

---

## Reading the proposal sections

In the generated `Proposal/FORGE-{slug}.md`, the audit and critique sections appear in this order:

1. **Heuristic Audit** — the finding matrix + most-severe finding + graft recommendation (or "no graft").
2. **Critique** — the persona attributes + the three friction points with artefact-element references.

The proposal's **What Would Change This Recommendation** section pulls from both — if the audit's checklist changes (e.g., re-run with `--audit-checklist wcag-aa`), the most-severe finding may shift; if the critique's persona changes (e.g., the user supplies `--persona` rather than letting the agent select), the three friction points shift.
