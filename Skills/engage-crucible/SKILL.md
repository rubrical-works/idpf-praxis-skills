---
name: engage-crucible
description: Hybrid scientific-research / hypothesis-generation skill. Refracts one research question into N competing hypotheses (each with a mandatory falsification condition and a structured experimental-design artefact), spawns a paired falsification-attack subagent per hypothesis to propose the cheapest discriminating experiment, and synthesizes a Bayesian prior-update landscape that identifies the highest-information-gain-per-cost crucible experiment plus a research roadmap.
type: invokable
version: "1.0.0"
frameworkCompatibility: ">=0.80.0"
lastUpdated: "2026-05-16"
license: Complete terms in LICENSE.txt
category: analysis
relevantTechStack: [scientific-research, hypothesis-generation, experimental-design, bayesian-reasoning, pico-peco, falsifiability, popperian-method]
argument-hint: "[--paths N] [--no-proposal] [--offline] [--model <opus|sonnet|haiku>] [--prior <uniform|user-supplied-path>]"
copyright: "Rubrical Works (c) 2026"
---

# Engage Crucible — Hypothesis Refraction + Falsification Attack + Bayesian Synthesis

For scientific research and hypothesis-driven engineering questions:
1. **Refract** question into N competing hypotheses (cooperative refraction from `/engage-prism`).
2. **Produce structured experimental-design artefact per hypothesis** (artefact-first from `/engage-forge` #204).
3. **Spawn paired falsification-attack subagent per hypothesis** — constructive: propose cheapest experiment discriminating THIS hypothesis from siblings (mechanic adapted from `/spar-exocortex` #216).
4. **Synthesize Bayesian prior-update landscape** rather than winner-picking — surface highest information gain per cost, produce research roadmap.

Hybrid pattern slot: **artefact-producing refraction + constructive falsification attack + Bayesian synthesis**. Popperian by design — generate conjecture, attempt refutation, measure information gain.

## Runtime Requirements

Applies **No-Runtime Fallback Pattern**. Two paths:

| Path | Requires | What it does |
|---|---|---|
| **Primary** | Node.js 18+ | Validates hypothesis briefs, experimental-design artefacts, attack outputs, Bayesian-synthesis outputs, citations via `ajv` (when present). |
| **Fallback** | None | Claude reads schemas under `resources/`, performs inline structural checks. Higher token cost; no `ajv`-grade validation. |

Both paths produce same artefact + attack + synthesis shapes.

**Web research is optional.** Many research sessions are offline reasoning. Pass `--offline` to declare explicitly.

**No `sharedScripts:`.** Does **not** consume `match-signals.js`. Paradigm catalog is **optional inspiration palette**.

### Preflight (before Step 0)

```bash
node --version
```

1. **Node 18+ available** → primary path. Uses `ajv` when available; missing `ajv` falls back to inline checks for that invocation and names the gap.
2. **Node unavailable** → surface Pattern 4 diagnostic: *"engage-crucible refracts one research question into N competing hypotheses with mandatory falsification conditions, produces structured experimental-design artefact per hypothesis, spawns paired falsification-attack subagents proposing cheapest discriminating experiments, synthesizes Bayesian prior-update landscape identifying highest-information-gain-per-cost crucible test plus research roadmap. With Node, hypothesis briefs, experimental-design artefacts, attack outputs, synthesis outputs validated against bundled JSON Schemas using `ajv`. Without Node, Claude performs same structural checks inline. Cost: validation approximate; no other feature degraded. Or install Node.js 18+ from https://nodejs.org/."* Then execute Fallback.

Preflight returns `{ runtime: "node" | "none", reason: string }`.

### Fallback Procedure

When Node unavailable, perform validation inline. Five operations replace `ajv` validation:

1. **Hypothesis-brief validation.** Read `resources/hypothesis-brief-schema.json`; confirm non-empty `falsificationCondition` (AC3 gate) plus required claim, mechanism, predictions, evidence-base fields.
2. **Experimental-design artefact validation.** Read artefact schema under `resources/artefact-schemas/` matching brief's declared `artefactType` (`pico` | `peco` | `generic-experimental-setup`). Reject pure-prose paths.
3. **Falsification-attack output validation.** Read `resources/attack-output-schema.json`; confirm discriminating prediction, sibling-hypotheses-ruled-out array, experimental setup, expected information gain, cost estimate.
4. **Bayesian-synthesis output validation.** Read `resources/synthesis-output-schema.json`; confirm prior probabilities (or explicit uniform-prior rationale), posterior landscape entries per crucial experiment, highest-information-gain-per-cost identification, research roadmap, learning objective.
5. **Citation tier validation.** Read `resources/citation-schema.json`; confirm each citation carries `evidenceTier` enum value.

Drift bounded by contract tests under `tests/skills/engage-crucible/`.

### Offline mode

Web research is optional. Many sessions are offline reasoning (training-recall + user-supplied evidence). Pass `--offline`:
- Hypothesis briefs MAY have empty `citations[]`.
- `webResearch.performed` set to `false` with `reason: "offline-mode"`.
- **No `attemptedCalls[]` violation fires** — `engage-prism` return-side validation rejecting zero-fetch returns does **not** apply when `--offline` declared.

Without `--offline`, web research opportunistic — citations preferred when available but absence does not block hypothesis generation. Skill's value-add is falsification + Bayesian-synthesis machinery, not citation discipline.

## When to use

For scientific-research / hypothesis-driven questions where:
- About **competing causal hypotheses** ("what explains this observation?", "why does X correlate with Y?").
- About **research-design** ("what experiment would discriminate hypothesis A from B?", "how would we test this mechanism?").
- Output is a **falsifiable hypothesis set** plus **proposed crucible experiment**, not narrative recommendation.
- You want **Bayesian information-gain analysis** of multiple proposed experiments.
- User says "hypothesize", "design an experiment", "what could explain", "how would we test", "which hypothesis is most likely".

**Do NOT use for:**
- Business/market/financial analytical — `/engage-prism` or `/debate-prism`.
- Code/algorithm/IT-architecture — `/engage-exocortex` or `/spar-exocortex`.
- Product/UX design — `/engage-forge`.
- Legal/policy/compliance — `/engage-lexicon`.
- **Medical/clinical decision-making** — `/engage-apothecary` (#205); stricter refusal contract. `engage-crucible` is for *research design*, not clinical decision support.
- Pure literature review — direct answer cheaper.

## Options

| Flag | Description | Default |
|------|-------------|---------|
| `--paths N` | Number of competing hypotheses (2-4) | 3 |
| `--no-proposal` | Skip writing proposal | *(writes)* |
| `--offline` | Declare offline mode — no web research; empty citations[] allowed; no `attemptedCalls` violations | *(web research opportunistic)* |
| `--model <model>` | Override subagent model | `opus` |
| `--prior <uniform\|path>` | Set prior probabilities: `uniform` (default) or path to user-supplied prior JSON | `uniform` |

`--offline` is **scoped opt-out**. Without it, citations opportunistic — paths add when available but absence does not block. With `--offline`, schema accepts empty `citations[]`. `engage-prism`-style return-side fabrication-risk check NOT applied.

`--prior uniform` (default) sets equal prior per hypothesis (`1/N`). `--prior <path>` accepts JSON conforming to `resources/prior-schema.json` mapping hypothesis ids to prior probabilities (must sum to 1.0).

## Core Workflow

```
PRIMARY AGENT
     ├── 0. Research-domain framing — research question, evidence-tier
     │      preferences, domain (biology, social science, physics, engineering),
     │      offline mode if set
     ├── 1. Hypothesis enumeration — primary agent identifies N competing
     │      hypotheses. Each must be falsifiable IN PRINCIPLE.
     ├── 2. Dispatch N hypothesis subagents in PARALLEL
     │       ├── Path 1: [hypothesis] ──► hypothesis brief + experimental-design artefact
     │       ├── Path 2: [hypothesis] ──► hypothesis brief + experimental-design artefact
     │       └── Path N: [hypothesis] ──► hypothesis brief + experimental-design artefact
     ├── 3. FALSIFICATION ATTACK PASS (mandatory; one attacker per hypothesis)
     │       ├── Attacker 1: cheapest experiment discriminating H1 from {H2..HN}
     │       ├── Attacker 2: cheapest experiment discriminating H2 from {H1, H3..HN}
     │       └── Attacker N: cheapest experiment discriminating HN from {H1..HN-1}
     ├── 4. BAYESIAN PRIOR-UPDATE SYNTHESIS (mandatory)
     │       ├── Record prior per hypothesis (uniform unless --prior supplied)
     │       ├── For each proposed crucial experiment, compute posterior landscape
     │       ├── Identify single experiment with highest information gain / cost
     │       ├── Produce research roadmap (ordered experiment sequence)
     │       └── Record learning objective
     └── 5. [Default] Write proposal to Proposal/CRUCIBLE-{question-slug}.md
```

**Opt-out:** `--no-proposal` skips Step 5. Falsification-attack (Step 3) and Bayesian-synthesis (Step 4) are **mandatory** — no opt-out.

## Step 0 — Research-Domain Framing

Primary agent records:
1. **Research question.** Restated in 1–2 sentences.
2. **Domain.** Biology/medicine, social science, physical science, engineering/methods, or other (named).
3. **Evidence-tier preferences.** `systematic-review` > `RCT` > `cohort` > `observational` > `expert` > `anecdote`. Domain-default: clinical/biomedical = RCT-preferred; social science = cohort/observational-tolerant; physical science = replication-weighted.
4. **Offline mode.** If `--offline`, record `offlineMode: true`. Subagents inherit and skip web research.
5. **Prior.** `uniform` (default) or user-supplied prior file (validated against `resources/prior-schema.json`).

Record in proposal's Metadata section.

## Step 1 — Hypothesis Enumeration (Primary Agent)

Primary agent identifies N competing hypotheses (default 3; 2–4 valid). Each must be **falsifiable in principle**. Unfalsifiable hypothesis ("complexity emerges from holism") rejected and re-formulated.

Each hypothesis at this stage is one paragraph: claim + proposed mechanism + sketch of what would falsify. Full hypothesis brief produced by subagent in Step 2.

### Hypothesis-diversity requirement

N hypotheses must propose **genuinely different mechanisms**, not same mechanism with different parameters. Primary agent verifies before dispatch — if two collapse to "same explanation with different magnitudes," they are merged and fresh distinct hypothesis generated.

## Step 2 — Dispatch N Hypothesis Subagents in Parallel

Spawn all N **at same time**. Each produces:

1. **Hypothesis brief** conforming to `resources/hypothesis-brief-schema.json`:
   - `id` (kebab-case)
   - `claim` (precise statement)
   - `mechanism` (proposed causal mechanism)
   - `predictions[]` (observable consequences if true)
   - `falsificationCondition` (specific observation that would disprove — **mandatory**, **AC3 gate**)
   - `priorEvidenceBase[]` (citations with `evidenceTier`)
   - `assumptions[]` (load-bearing assumptions whose violation would invalidate hypothesis)

2. **Structured experimental-design artefact** conforming to one of `resources/artefact-schemas/`:
   - `pico` — Population, Intervention, Comparison, Outcome (clinical/biomedical)
   - `peco` — Population, Exposure, Comparison, Outcome (epidemiological/observational)
   - `generic-experimental-setup` — Subject, Manipulation, Measurement, Confounders, Sample-size, DAG-sketch (physical sciences, engineering, social)

Brief + artefact = path's output envelope.

### Brief generation (slot-filling)

Read `resources/path-brief-template.json`. Fill:
- `researchQuestion` — restated from Step 0.
- `assignedHypothesis` — claim + sketch from Step 1.
- `domain` — from Step 0.
- `evidenceTierPreferences` — from Step 0.
- `offlineMode` — boolean.
- `assignedArtefactType` — one of `pico` | `peco` | `generic-experimental-setup`.

### Falsification gate (AC3)

Each brief MUST declare non-empty `falsificationCondition`:

| Failure | Action |
|---|---|
| `falsificationCondition` missing/empty | Reject; re-dispatch once with directive "the hypothesis must declare an observation that would disprove it"; second failure tags `unfalsifiable` and excludes from attack + synthesis. |
| `falsificationCondition` references unmeasurable construct ("if consciousness were not material") | Reject; re-dispatch with directive "specify a measurable observation, not a philosophical condition." |

### Artefact-contract enforcement (AC4)

Primary agent validates each returned artefact. Pure-prose returns (no structured artefact, or artefact missing required schema fields) fail with same re-dispatch / second-failure-tagging pattern.

## Step 3 — Falsification Attack Pass (Mandatory)

One attacker subagent per hypothesis. Job is **constructive, not rhetorical** — does NOT try to break the hypothesis. Tries to design **cheapest experiment that would discriminate assigned hypothesis from siblings**.

Scientific analog of `/spar-exocortex`'s failing-input attack: in spar, attacker produces concrete input breaking baseline; in crucible, attacker produces concrete experiment distinguishing assigned hypothesis from siblings.

### Attack brief (slot-filled)

Read `resources/attack-brief-template.json`. Fill:
- `assignedHypothesis` — hypothesis this attacker paired with.
- `siblingHypotheses` — other N-1 hypotheses.
- `evidenceTierPreferences` — inherited.
- `offlineMode` — inherited.
- `costGuidance` — qualitative tiers: `trivial` (no new data), `cheap` (existing dataset + analysis), `moderate` (new measurement on existing population), `expensive` (new study/RCT/instrument), `prohibitive` (out of scope).

### Attack output (AC5)

Conforms to `resources/attack-output-schema.json`:
- `assignedHypothesisId` — hypothesis being defended/discriminated.
- `discriminatingPrediction` — specific prediction this hypothesis makes that no sibling makes (or makes with substantially different magnitude/direction).
- `siblingHypothesesRuledOutByDiscriminatingResult[]` — sibling ids whose probability would meaningfully drop if prediction holds.
- `experimentalSetup` — re-uses one of three artefact schemas under `artefact-schemas/`.
- `expectedInformationGain` — `low | medium | high` (qualitative ranking acceptable; full Bayesian computation optional).
- `costEstimate` — `trivial | cheap | moderate | expensive | prohibitive`.
- `rationale` — ≤200-word narrative justifying discriminating-prediction choice.

### Why constructive, not adversarial

Cooperative spirit preserved across all engage-* siblings. Pure adversarial attack ("here's why H1 is wrong") would produce one-sided dismissal; constructive attack ("here's the cheapest test that would discriminate H1 from H2 and H3") produces actionable experimental design. Attacker is on hypothesis-set's side, not against any individual hypothesis.

## Step 4 — Bayesian Prior-Update Synthesis (Mandatory)

Synthesis pass replaces winner-picking with **prior-update landscape**. Given N hypotheses, their priors, and N crucial experiments proposed by attackers, what does posterior landscape look like? Which experiment resolves most uncertainty per dollar?

### Prior

- `--prior uniform` (default) → each hypothesis starts at `1/N`.
- `--prior <path>` → user-supplied JSON, conforms to `resources/prior-schema.json`, must sum to 1.0 (within 0.01 tolerance).

If priors don't sum to 1.0, HALT: *"Prior probabilities sum to {sum}, not 1.0. Either correct the prior file or invoke with --prior uniform."*

### Posterior landscape

For each proposed crucial experiment, compute (or qualitatively rank) posterior probability per hypothesis if experiment's discriminating prediction holds. Full Bayesian computation optional — qualitative ranking acceptable (`up | unchanged | down` per hypothesis per experiment).

### Highest-information-gain-per-cost

Across all N proposed experiments, identify single experiment resolving most uncertainty per cost unit. This is the **crucible test** — experiment user should run first.

Information-gain ranking is qualitative when tractable, qualitative-with-rationale when not. Cost dimension uses same tiers as attack pass.

### Research roadmap

Ordered sequence of experiments resolving most uncertainty soonest. First item is crucible test. Subsequent items become valuable conditional on crucible test's outcome.

### Learning objective

What Bayesian intuition or research-design principle this case teaches. Examples:
- "Cheap-and-discriminating beats expensive-and-confirming when priors are diffuse."
- "Two hypotheses with similar predictions need different discriminating axis — magnitude differences weaker than direction differences."
- "Confound XYZ dominates outcome variance; controlling it is prerequisite to discriminating any hypothesis here."

### Synthesis output contract (AC6)

`resources/synthesis-output-schema.json` requires:
- `priors` — map `hypothesisId → probability` (sums to 1.0), with `priorSource: "uniform" | "user-supplied"` and rationale if uniform.
- `posteriorLandscape[]` — one entry per proposed crucial experiment, with hypothesis-by-hypothesis posterior shifts.
- `crucibleExperiment` — id of experiment with highest information gain per cost, with rationale.
- `researchRoadmap[]` — ordered list of experiment ids.
- `learningObjective` — non-empty string.

Missing any fails validation.

## Step 5 — Generate Research Proposal Document

**Skip if `--no-proposal`.**

Write at `Proposal/CRUCIBLE-{question-slug}.md`. `{question-slug}` is lowercase-hyphenated summary (e.g., `oa-knee-pain-cause-of-flare`).

Read `resources/proposal-template.json`. Required sections:
1. **Metadata** — Date, skill, research question, domain, paths, prior source, offline mode, crucible experiment id.
2. **Research Question** — Restated user question.
3. **Hypotheses** — One section per hypothesis with full brief, structured experimental-design artefact, and prior probability.
4. **Falsification Attacks** — One section per attacker with discriminating prediction, siblings ruled out, experimental setup, expected information gain, cost.
5. **Bayesian Synthesis** — Prior table, posterior-landscape table (hypotheses × proposed experiments), crucible-experiment call-out, research-roadmap list.
6. **Crucible Experiment** — Detailed write-up of highest-information-gain-per-cost experiment.
7. **Research Roadmap** — Ordered sequence of experiments + conditional-next-steps decision points.
8. **Learning Objective** — What Bayesian or research-design lesson this case teaches.

## Error Handling

| Failure Mode | Expected Behavior |
|---|---|
| Node missing | Surface Pattern 4; switch to Fallback. No halt. |
| `ajv` missing on Node path | Note schema-validation degradation; proceed with inline checks. |
| Hypothesis brief missing `falsificationCondition` | Reject + re-dispatch; second failure tags `unfalsifiable` and excludes (AC3). |
| Hypothesis brief lacks structured experimental-design artefact | Reject + re-dispatch (AC4). |
| Attacker output missing `discriminatingPrediction` | Reject + re-dispatch (AC5). |
| Synthesis missing `crucibleExperiment` identification | Reject + re-run synthesis (AC6). |
| Priors sum ≠ 1.0 (±0.01) | HALT with diagnostic; correct prior file or use `--prior uniform`. |
| `--offline` set AND path returns citations[] entries | Allowed; offline mode permits citations but doesn't require them. |
| `--offline` NOT set AND path returns empty citations[] without rationale | Warn (not block) — citations opportunistic. |

## Important Constraints

- **Falsifiability is mandatory.** Each hypothesis declares specific, measurable observation that would disprove. Unfalsifiable hypotheses fail validation.
- **Artefact-first.** Each path emits structured experimental-design artefact. Pure-prose paths fail.
- **Falsification-attack pass is mandatory.** One attacker per hypothesis; no opt-out.
- **Bayesian-synthesis is mandatory.** No opt-out; output must include crucible-experiment identification and research roadmap.
- **Synthesis is NOT winner-picking.** No "best hypothesis" named; output is posterior-update landscape and research roadmap.
- **Web research optional.** `--offline` declares pure-reasoning mode without `attemptedCalls` violations.
- **Paradigm catalog is palette, not routing.** Full-catalog routing through `match-signals.js` is a violation.
- **No `sharedScripts:`.** Does not consume any shared script.
- **Cooperative spirit.** Attack pass is constructive (designing discriminating experiments), not rhetorical. Hypotheses are not opponents; they are conjectures jointly under test.

## Reference Files

In `resources/`. Each JSON data file has colocated schema.

| File | Purpose |
|---|---|
| `paradigms.json` | Optional palette: hypothesis-driven inquiry, mechanistic reasoning, causal-DAG modeling, replication-design |
| `structures.json` | Optional palette: experimental structures (factorial, time-series, cross-sectional, case-control) |
| `strategies.json` | Optional palette: research strategies (replication-first, mechanism-first, prediction-first) |
| `path-brief-template.json` | Subagent brief slot template (hypothesis path) |
| `attack-brief-template.json` | Attacker brief slot template |
| `hypothesis-brief-schema.json` | Hypothesis brief shape with falsification-gate |
| `artefact-schemas/pico.schema.json` | PICO experimental-design artefact (clinical/biomedical) |
| `artefact-schemas/peco.schema.json` | PECO experimental-design artefact (epidemiological/observational) |
| `artefact-schemas/generic-experimental-setup.schema.json` | Generic experimental setup (physical, engineering, social) |
| `attack-output-schema.json` | Falsification-attack output shape |
| `synthesis-output-schema.json` | Bayesian prior-update synthesis output shape |
| `citation-schema.json` | Citation shape with `evidenceTier` enum |
| `prior-schema.json` | User-supplied prior shape (hypothesis-id → probability, sums to 1.0) |
| `proposal-template.json` | Document structure template |

## Relationship to sibling skills

**Hybrid-pattern** skill. Pulls structural moves from three siblings:

| Move | Pulled from | Adapted as |
|---|---|---|
| Cooperative parallel refraction | `/engage-prism`, `/engage-exocortex`, `/engage-forge` | Hypothesis enumeration — N competing causal hypotheses |
| Artefact-first output contract | `/engage-forge` (#204) | Every hypothesis path produces structured experimental-design artefact (PICO/PECO/generic) |
| Constructive attack mechanic | `/spar-exocortex` (#216) | One attacker per hypothesis proposing cheapest discriminating experiment (NOT rhetorical refutation) |

Distinctive contributions:
- **Falsifiability gate** — each hypothesis declares observation that would disprove; unfalsifiable rejected.
- **Bayesian prior-update synthesis** — replaces winner-picking with posterior-update landscape + crucible-experiment identification + research roadmap.
- **Evidence-tier-weighted citations** — explicit tier (systematic-review > RCT > cohort > observational > expert > anecdote); synthesis weights accordingly.
- **`--offline` mode is first-class** — pure-reasoning mode without `attemptedCalls` violations.

See `Skills/MAINTENANCE.md` → Cooperative Refraction Patterns and Adversarial Sibling Skills.

**End of engage-crucible SKILL.md**
