---
name: engage-apothecary
description: Strictly educational clinical reasoning explorer. Walks through differential diagnoses with mechanistic pathways, evidence-tier-weighted citations, a mandatory red-flag advocate role (must-not-miss diagnosis + cheapest ruling-out test), and a mandatory Bayesian pre/post-test probability synthesis with educational learning objective. NOT a medical device. NOT for point-of-care decisions. NOT for individual patient care. Refuses dosing, prescribing, individualized-treatment, patient-identifying, and acute-symptom inputs at preflight.
effort: high
type: invokable
version: "1.0.1"
frameworkCompatibility: ">=0.80.0"
lastUpdated: "2026-05-18"
license: Complete terms in LICENSE.txt
category: clinical-education
relevantTechStack: [clinical-reasoning, differential-diagnosis, evidence-based-medicine, bayesian-reasoning, medical-education, refraction]
argument-hint: "[--paths N] [--no-proposal] [--no-web] [--model <opus|sonnet|haiku>] [--recency-years N]"
copyright: "Rubrical Works (c) 2026"
---

# Engage Apothecary — Educational Clinical Reasoning Explorer

> **⚠ STRICTLY EDUCATIONAL. NOT FOR POINT-OF-CARE DECISIONS.**
> For teaching differential-diagnosis reasoning, evidence-tier weighting, and Bayesian pre/post-test intuition. NOT a medical device, NOT medical advice, NOT for individual patient care. Refusal contract is **load-bearing** — dosing, prescribing, individualized-treatment requests, patient-identifying details, and acute-symptom inputs are **refused at preflight** with a redirect to appropriate care. Educational-only disclaimer is stamped verbatim on every output and **cannot be suppressed by any flag**.

Refracts one de-identified hypothetical into N candidate diagnoses with mechanistic reasoning + evidence-tier-weighted citations, surfaces must-not-miss via mandatory red-flag advocate, synthesizes Bayesian pre/post-test landscape naming the educational learning objective.

Built on `/engage-prism` analytical-refraction base with clinical-education contracts layered on:
1. Load-bearing refusal gate at preflight (deterministic rejection of point-of-care inputs).
2. Non-suppressible educational-only disclaimer verbatim on every output.
3. Evidence-tier-weighted citation schema (systematic review > RCT > cohort > case-control > case series > expert opinion).
4. Mandatory red-flag advocate (one per invocation regardless of N).
5. Mandatory Bayesian pre/post-test synthesis.

Does NOT consume `match-signals.js` or any shared script. Paradigm catalog is optional inspiration palette, not routing substrate.

## Runtime Requirements

Applies **No-Runtime Fallback Pattern** (see `SKILL-DEVELOPMENT-GUIDE.md`; rationale in `Construction/Design-Decisions/2026-04-26-no-runtime-fallback-pattern.md`). Two paths chosen by preflight:

| Path | Requires | What it does |
|---|---|---|
| **Primary (default)** | Node.js 18+ on `PATH` | Validates citation/red-flag/Bayesian/differential-brief schemas against bundled JSON Schemas via `ajv` (when present). Deterministic contract enforcement. |
| **Fallback** | None | Claude reads the same schemas under `resources/`, checking structure inline. Higher token cost; no `ajv`-grade validation; contract enforced by the same prose rules. |

**The refusal gate runs in BOTH paths.** Patterns in `resources/refusal-gate-patterns.json` matched against user input regardless of Node availability. Deterministic, not LLM-judgment.

**WebFetch / WebSearch** required by default for evidence-tier citations. When unavailable (sandbox, `--no-web`), each brief records degradation; citation tier capped at "expert opinion."

### Preflight (before Step 0)

Before any other step (scenario framing, differentials, dispatch), run two checks in sequence:

**(1) Point-of-care detection** (runs first; deterministic; non-bypassable):

Read `resources/refusal-gate-patterns.json`. Five categories: `dosing`, `prescribing`, `individualizedCare`, `patientIdentifying`, `acuteSymptom`. Each has regex-like patterns and a redirect message.

For each pattern in each category, test against user input. On any match, emit redirect and **HALT**. Final — no flag bypasses, no rephrasing re-enables.

Message format:
```
REFUSED: This input matches the {category} refusal trigger.
{categorySpecificRedirect}
engage-apothecary is for educational clinical reasoning only — never for
point-of-care decisions or individualized patient care.
```

**(2) Node availability check** (only if refusal gate did not trigger):

```bash
node --version
```

1. **Node 18+ available** → primary path. Uses `ajv` when available; missing `ajv` falls back to inline structural checks for that invocation and names the gap.
2. **Node unavailable** → surface Pattern 4 diagnostic in diagnostic-order: *"engage-apothecary explores differential diagnoses as an educational exercise — refraction into N differentials, mandatory red-flag advocate, mandatory Bayesian pre/post-test synthesis, evidence-tier-weighted citations. With Node, citation/red-flag/Bayesian outputs validated against bundled JSON Schemas using `ajv`. Without Node, Claude performs the same structural checks inline against the same schema files — the contract is enforced by the procedure documented below. Cost: schema validation approximate rather than ajv-grade; refusal gate runs in both paths (deterministic regex match). Or install Node.js 18+ from https://nodejs.org/ for the deterministic primary path."* Then execute Fallback Procedure.

Preflight returns `{ runtime: "node" | "none", reason: string }`.

**Point-of-care detection runs before any other processing — including the Node check.** The refusal gate is the first gate; failure halts the skill regardless of runtime path.

### Fallback Procedure

When Node unavailable, perform schema validation inline:

1. **Differential-brief validation.** Conform to `resources/differential-brief-schema.json` — required: diagnosis, mechanism, evidenceCitations[], testCharacteristics, contraindicationReasoning.
2. **Citation validation.** `resources/citation-schema.json` — required: source, tier (one of: systematic-review, rct, cohort, case-control, case-series, expert-opinion), claim. Synthesis weights by tier.
3. **Red-flag-advocate output.** `resources/red-flag-advocate-output-schema.json` — required: mustNotMissDiagnosis, sharingFeaturesRationale, rulingOutTest, consequenceOfMissingSeverity (severity enum).
4. **Bayesian-synthesis output.** `resources/bayesian-synthesis-output-schema.json` — required: preTestProbabilities[] (per differential), highestImpactTest, postTestProbabilities[], educationalLearningObjective.

The refusal gate runs deterministically on both paths via regex match against `resources/refusal-gate-patterns.json` — no inline fallback drift.

## When to use

For clinical reasoning framed as **educational exercises**:
- "Walk me through the differential for a hypothetical case of {presentation} in {demographic} — what's the must-not-miss?"
- "What's the Bayesian update from a positive {test} when pre-test probability is high vs low?"
- "Compare test characteristics of {test A} vs {test B} for {hypothetical condition}."
- "What evidence tiers should I weight most when reasoning about {educational hypothetical}?"

**Do NOT use for** (refusal gate enforces; illustrative not active filter):
- **Any individual patient.** "My patient has..." / "I have a patient with..." / "What should I do for this person?" — refused.
- **Dosing.** "What dose of X for a Y-kg adult?" — refused.
- **Prescribing.** "Should I prescribe X or Y?" — refused.
- **Acute symptoms.** "Chest pain right now" / "Sudden severe headache" / "Trouble breathing" — refused with emergency-care redirect.
- **Patient-identifying details.** Names, DOBs, MRNs, specific dates/locations of care — refused.
- Business/market/finance — `/engage-prism`.
- Code/algorithm — `/engage-exocortex`.
- Product/UX — `/engage-forge`.
- Narrative — `/engage-codex`.
- Multi-stakeholder negotiation — `/engage-chorus`.

## Options

| Flag | Description | Default |
|------|-------------|---------|
| `--paths N` | Parallel differential paths (2-5) | 3 |
| `--no-proposal` | Skip writing proposal document | *(writes)* |
| `--no-web` | Skip web research; citation tier capped at expert-opinion. Each brief records the degradation. | *(web on)* |
| `--model <model>` | Override subagent model (`opus`, `sonnet`, `haiku`) | `opus` |
| `--recency-years N` | Recency window (≥1); outside-window citations flagged | 10 |

**No flag suppresses the refusal gate.** **No flag suppresses the educational-only disclaimer.** **No flag suppresses the red-flag advocate.** **No flag suppresses the Bayesian synthesis.** Four load-bearing non-optional contracts.

## Core Workflow

```
PRIMARY AGENT
     ├── Preflight A: Point-of-care detection (refusal gate)
     │       └── ANY refusal pattern matches → REFUSE + HALT (no exceptions)
     ├── Preflight B: Node availability check (Pattern 4)
     ├── 1. Educational scenario framing (de-identified, hypothetical)
     ├── 2. Generate differentials (N candidates via mnemonic / priors / red-flag triage)
     ├── 3. Dispatch N differential subagents in PARALLEL
     │       ├── Path 1: differential brief with evidence-tier citations
     │       ├── Path 2: differential brief with evidence-tier citations
     │       └── Path N: differential brief with evidence-tier citations
     ├── 4. RED-FLAG ADVOCATE (mandatory, one per invocation)
     │       └── Must-not-miss diagnosis + sharing features + cheapest ruling-out test
     ├── 5. BAYESIAN PRE/POST-TEST SYNTHESIS (mandatory)
     │       ├── Pre-test probabilities per differential
     │       ├── Highest-impact test/finding
     │       ├── Post-test probability landscape
     │       └── Educational learning objective
     ├── 6. Stamp educational-only disclaimer (verbatim, non-suppressible)
     └── 7. [Default] Write proposal to Proposal/APOTHECARY-{slug}.md
```

## Refusal Gate (Mandatory, Load-Bearing)

**First contract** of this skill. **Deterministic** (regex pattern matching, not LLM judgment), **non-bypassable** (no flag suppresses it).

### Refusal categories

| Category | Examples of triggers | Redirect |
|---|---|---|
| **`dosing`** | "what dose of", "how much X to give", "mg/kg for", "dosing for {patient}" | "For dosing decisions, consult a licensed clinician, a current drug-reference (e.g., your institutional formulary), and the manufacturer's prescribing information." |
| **`prescribing`** | "should I prescribe", "what should I prescribe", "give my patient", "first-line agent for {patient}" | "For prescribing decisions, consult a licensed clinician with the patient in front of them. engage-apothecary does not produce prescribing recommendations." |
| **`individualizedCare`** | "my patient", "for this patient", "what should I do for", "individualized treatment for" | "For individualized patient care, consult a licensed clinician. engage-apothecary teaches differential reasoning on hypothetical de-identified scenarios — not treatment for individual patients." |
| **`patientIdentifying`** | Names, DOBs, MRNs, specific clinic/hospital locations | "Do not share patient-identifying information. Reframe as a de-identified hypothetical (e.g., 'a 45-year-old with X') and re-invoke." |
| **`acuteSymptom`** | "chest pain right now", "sudden severe headache", "trouble breathing", "acute X" | "For acute symptoms, call emergency services (911 / your local equivalent) or seek immediate clinical care. Do not use a learning tool for acute presentations." |

### Refusal procedure

1. **Read** `resources/refusal-gate-patterns.json` at preflight.
2. **Match** each user input against every pattern in every category using case-insensitive regex.
3. **On any match**, emit redirect and HALT. Do not proceed to scenario framing.
4. **On no match**, proceed to Preflight B (Node availability check).

Matches **structural triggers** — phrasing indicating point-of-care. Not a content classifier. False positives acceptable; false negatives are not. If a legitimate educational scenario triggers a refusal, the user reframes (e.g., "a hypothetical 45-year-old with chest pain on exertion" instead of "chest pain right now").

### Why deterministic?

LLM-judgment refusal is fragile — adversarial rephrasings, edge cases, and model drift give inconsistent results. The named categories are well-bounded enough for regex. Accepts higher false-positive rates for zero false negatives.

## Educational-Only Disclaimer (Verbatim, Non-Suppressible)

Stamped verbatim on every output. Lives in `resources/disclaimer.txt` as single source of truth.

**Cannot be suppressed by any flag.** `--no-proposal` skips proposal but disclaimer appears in stdout. `--no-web` does not affect it. No suppression flag exists and none can be added.

```
This is educational reasoning only, not medical advice. Not for
point-of-care decisions. Consult a licensed clinician for individual
patient care.
```

Proposal, stdout, and every example carry the disclaimer verbatim.

## Evidence-Tier Citation Schema

Citations weighted by tier, mirroring `/engage-crucible`'s discipline:

| Tier | Identifier | Weight (illustrative) |
|---|---|---|
| 1 | `systematic-review` | 1.0 |
| 2 | `rct` | 0.8 |
| 3 | `cohort` | 0.6 |
| 4 | `case-control` | 0.4 |
| 5 | `case-series` | 0.2 |
| 6 | `expert-opinion` | 0.1 |

Each citation in a differential brief must declare its tier. Bayesian synthesis weights citations by tier when computing updates (qualitative when LRs not well-published).

`resources/citation-schema.json` enforces shape. Unknown tiers fail validation.

## Step 1 — Educational Scenario Framing

After preflight gates pass, primary agent **restates as educational scenario**:
- De-identified (no patient names, no specific dates/locations, no MRNs).
- Hypothetical framing ("a 45-year-old presenting with X" rather than "my patient with X").
- Records evidence-tier preferences (default: systematic-review and RCT preferred; cohort and case-control acceptable; case-series and expert-opinion flagged) and recency window (default 10 years; `--recency-years N` overrides).

If user input cannot be reframed without losing substance, prompt user to reformulate. The skill does not silently strip identifying information — that would risk masking a real-patient question as an educational one.

## Step 2 — Generate Differentials

Identify N candidate diagnoses (typically 3-5, default 3) using:
1. **Mnemonic-driven enumeration** (e.g., VITAMIN-CDE — Vascular/Infectious/Toxic/Autoimmune/Metabolic/Iatrogenic/Neoplastic/Congenital/Degenerative/Endocrine; or analogous mnemonics scoped to the presentation).
2. **Epidemiologic priors** for the presentation in framed demographic.
3. **Red-flag triage** — explicitly flag must-not-miss diagnoses for Step 4.

Each differential named with diagnosis (with ICD code if well-known) plus one-sentence rationale.

## Step 3 — Dispatch N Differential Subagents in Parallel

Spawn all N at the same time. Each receives a slot-filled brief and produces a structured differential brief conforming to `resources/differential-brief-schema.json`:
- **diagnosis** — name + ICD code if well-known.
- **mechanism** — mechanistic/pathophysiologic reasoning, ≤150 words.
- **evidenceCitations** — array of citation objects (evidence-tier schema), minimum 1.
- **testCharacteristics** — sensitivity/specificity/LR+ where well-published, qualitative ranking otherwise. Explicit "data not well-published" entries valid; fabricated quantitative LRs are not.
- **contraindicationReasoning** — what would argue against this diagnosis given the scenario.

### Web research

Each subagent runs live WebFetch/WebSearch for evidence-tier citations within the recency window. Outside-window sources flagged, not rejected. With `--no-web`, brief records `webResearch: false`; tier capped at expert-opinion.

### Subagent fabrication check

Citations checked against an `attemptedCalls` record (mirrors `/engage-prism` subagent-web-enforcement). Citations without recorded WebFetch/WebSearch invocations are flagged `webResearchSuspect: true`.

## Step 4 — Red-Flag Advocate (Mandatory)

**Dedicated single-role subagent** spawned every invocation, regardless of N or question shape. Sole brief:

> "Given the educational scenario, what is the **must-not-miss diagnosis** that could share this presentation but would be catastrophic to miss? What single feature differentiates it from the other differentials? What is the **cheapest test** that would rule it out, and what is the consequence of missing it?"

### Red-flag-advocate output schema

Conforms to `resources/red-flag-advocate-output-schema.json` — required fields:
- **mustNotMissDiagnosis** — the must-not-miss differential.
- **sharingFeaturesRationale** — what makes this plausibly share the presentation with the others.
- **rulingOutTest** — the single cheapest ruling-out test (with test characteristics where well-published).
- **consequenceOfMissingSeverity** — enum: `catastrophic | severe | moderate`. Catastrophic = death/permanent disability; severe = major morbidity; moderate = significant but reversible.

**Always present.** No skip flag. If no plausible must-not-miss exists (rare for clinical-education scenarios), the advocate must explicitly declare `mustNotMissDiagnosis: "none-identified"` and explain *why* — silent omission is forbidden.

### Why always-mandatory and not optional?

Reasoning that omits the red-flag check teaches premature closure. *Always asking "what's the must-not-miss?"* is load-bearing pedagogy; an optional role would let outputs model the failure mode the skill teaches learners to avoid.

## Step 5 — Bayesian Pre/Post-Test Synthesis (Mandatory)

**Required synthesis.** Runs every invocation. Produces the probability landscape turning "here are differentials" into "here is how evidence updates the landscape."

### Synthesis procedure

1. **Pre-test probability per differential** — based on framed scenario's demographics + presentation. When literature provides published pretest probabilities, cite with tier. Otherwise declare `assumption-based: true` and state the assumption explicitly.
2. **Highest-impact test/finding** — identify the single test or finding (positive or negative) that would most update the landscape. Use likelihood ratios where well-published (LR+ ≥ 10 for "strong rule-in"; LR− ≤ 0.1 for "strong rule-out"); qualitative ranking ("strongest discriminator," "moderate discriminator") otherwise.
3. **Post-test probability landscape** — for each differential, name post-test probability after the highest-impact test result (positive AND negative cases). When LRs not well-published, name the qualitative direction ("rises significantly," "falls below the action threshold").
4. **Educational learning objective** — name the specific Bayesian intuition or test characteristic this case teaches. Examples: "high pre-test probability + moderate-LR test still leaves substantial residual probability"; "low pre-test probability + high LR+ raises post-test probability but not to the action threshold"; "a sensitive test with poor specificity is for ruling out, not ruling in."

### Bayesian-synthesis output schema

Conforms to `resources/bayesian-synthesis-output-schema.json`. Required:
- **preTestProbabilities** — array, one entry per differential, each with `differential` + `preTestProbability` + `basis` (one of: `literature-cited`, `assumption-based`) + optional `citation`.
- **highestImpactTest** — object with `test`, `targetDifferentials` (which it discriminates between), `likelihoodRatios` (when published) or `qualitativeImpact` (when not).
- **postTestProbabilities** — array of `{differential, positiveResultPostTest, negativeResultPostTest}`.
- **educationalLearningObjective** — the named Bayesian/test-characteristic intuition.

### Why mandatory?

Bayesian updating is what the skill *teaches*. Without synthesis the output is a differential list — useful as reference, useless as pedagogy.

## Step 6 — Stamp Educational-Only Disclaimer

Disclaimer read from `resources/disclaimer.txt` and stamped verbatim on every output: stdout, proposal, every example. Disclaimer is the closing element of the proposal and appears in the stdout summary.

No flag suppresses the disclaimer.

## Step 7 — Generate Educational Proposal Document

**Skip if `--no-proposal`.** Disclaimer still appears in stdout regardless.

Write at `Proposal/APOTHECARY-{slug}.md`. Read `resources/proposal-template.json` for structure. Required sections:
1. **Disclaimer** (top — from `resources/disclaimer.txt` verbatim).
2. **Metadata** — Date, skill name, differential count, recency window, web-research flag.
3. **Educational Scenario** — Restated de-identified hypothetical.
4. **Differentials Explored** — Table with one-sentence rationales.
5. **Differential Briefs** — One section per differential with full brief.
6. **Red-Flag Advocate** — Must-not-miss with sharing features, ruling-out test, consequence severity.
7. **Bayesian Pre/Post-Test Synthesis** — Pre-test probabilities, highest-impact test, post-test landscape, educational learning objective.
8. **Educational Learning Summary** — One-paragraph summary of what this case teaches.
9. **Disclaimer** (bottom — from `resources/disclaimer.txt` verbatim).

Disclaimer at both top and bottom.

## Error Handling

| Failure Mode | Expected Behavior |
|---|---|
| Refusal gate triggers | HALT with redirect. No proceeding to scenario framing. |
| Node missing | Surface Pattern 4 diagnostic; switch to Fallback Procedure. No halt. Refusal gate still runs (deterministic regex match). |
| `ajv` missing on Node path | Note schema-validation degradation; proceed with inline structural checks for this invocation only. |
| Differential brief missing required fields | Reject + re-dispatch once; second failure excludes from synthesis. |
| Citation outside recency window | Flag, do not reject. Synthesis weights by tier; recency informational. |
| Red-flag advocate returns no must-not-miss | Require explicit `mustNotMissDiagnosis: "none-identified"` + explanation. Silent omission rejected. |
| Bayesian synthesis missing `educationalLearningObjective` | Reject + re-dispatch. Learning objective is the pedagogical core. |
| Subagent returns citations without recording WebFetch/WebSearch attempts | Flag `webResearchSuspect: true`; brief retained but flagged in synthesis. |
| Input contains both refusal trigger AND educational framing | Refusal gate wins. User can reframe to remove the trigger phrasing. |

## Important Constraints

- **Refusal gate is load-bearing.** No flag suppresses it. Named categories (dosing, prescribing, individualized care, patient-identifying, acute symptom) deterministically detected by regex.
- **Educational-only disclaimer is non-suppressible.** Verbatim text on every output. No suppression flag exists.
- **Red-flag advocate is mandatory.** One per invocation regardless of N.
- **Bayesian pre/post-test synthesis is mandatory.** Every invocation produces the landscape + educational learning objective.
- **Evidence tiers required on every citation.** Unknown tiers fail validation. Fabricated quantitative likelihood ratios forbidden; qualitative ranking when LRs not well-published.
- **Paradigm catalog is palette, not routing.** `match-signals.js` is never consumed (NOT a sharedScripts consumer).
- **Not a medical device.** Not for individual patient care. Not for point-of-care decisions.

## Reference Files

In `resources/`. Each JSON data file has a colocated schema.

| File | Purpose |
|---|---|
| `refusal-gate-patterns.json` | Deterministic refusal trigger patterns (5 categories: dosing, prescribing, individualized care, patient-identifying, acute symptom) + redirect messages |
| `disclaimer.txt` | Verbatim educational-only disclaimer (single source of truth) |
| `citation-schema.json` | Evidence-tier-weighted citation schema |
| `differential-brief-schema.json` | Path subagent brief schema |
| `differential-brief-template.json` | Slot template for dispatching path subagents |
| `red-flag-advocate-output-schema.json` | Red-flag-advocate output schema (must-not-miss, sharing features, ruling-out test, consequence severity) |
| `bayesian-synthesis-output-schema.json` | Bayesian synthesis output schema |
| `paradigms.json` | Optional palette: clinical-reasoning paradigms |
| `structures.json` | Optional palette: structural patterns |
| `strategies.json` | Optional palette: reasoning strategies |
| `proposal-template.json` | Document structure template for Step 7 |
| `proposal-template-schema.json` | Schema for the proposal template |

## Relationship to sibling skills

Built on `/engage-prism` analytical-refraction base with clinical-education contracts layered on:

| Dimension | `/engage-prism` | `/engage-apothecary` |
|---|---|---|
| Problem domain | Business/market/finance | Clinical-education differential reasoning |
| Output shape | Narrative recommendation with citations | Differential briefs + red-flag advocate + Bayesian synthesis |
| Quality gates | Citation validation + recency gate | Refusal gate (load-bearing) + evidence-tier weighting + red-flag advocate (mandatory) + Bayesian synthesis (mandatory) + non-suppressible disclaimer |
| Web research | Mandatory by default (`--no-web` overrides) | Mandatory by default (`--no-web` caps tier at expert-opinion) |
| Refusal contract | None (no refusal gate) | Load-bearing refusal gate at preflight |
| Disclaimer | None | Non-suppressible educational-only disclaimer |

See `Skills/MAINTENANCE.md` → Educational Clinical Reasoning Skills.

**End of engage-apothecary SKILL.md**
