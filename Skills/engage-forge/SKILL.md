---
name: engage-forge
description: Artefact-first parallel design exploration for product and UX problems. Refracts one design problem into N paradigm-paired structured artefacts (user flows, IA trees, heuristic-finding matrices, journey maps, try/fail cycles, Kano grids), then applies a mandatory heuristic audit pass and a mandatory persona-driven critique pass to the recommended artefact.
type: invokable
version: "1.0.0"
frameworkCompatibility: ">=0.80.0"
lastUpdated: "2026-05-16"
license: Complete terms in LICENSE.txt
category: design
relevantTechStack: [product-design, ux-design, ia, journey-mapping, jtbd, nielsen-heuristics, wcag, design-system, refraction]
argument-hint: "[--paths N] [--no-proposal] [--model <opus|sonnet|haiku>] [--audit-checklist <nielsen-10|wcag-aa|custom>] [--persona <name>]"
copyright: "Rubrical Works (c) 2026"
---

# Engage Forge — Artefact-First Parallel Design Exploration

For product and UX design problems by **fanning out into N independent design paradigms in parallel**, producing **structured artefacts** (not narrative summaries) from each path, then applying two mandatory quality gates — **heuristic audit pass** and **persona-driven critique pass** — to the recommended artefact.

Fourth pattern slot: **artefact-producing refraction + audit/critique**. Cooperative refraction preserved (parallel proposals are right shape for design work), but output is artefact-shaped rather than narrative, and two quality gates apply to the recommendation.

## Runtime Requirements

Applies **No-Runtime Fallback Pattern**. Two paths:

| Path | Requires | What it does |
|---|---|---|
| **Primary** | Node.js 18+ | Validates artefact schemas, heuristic-audit-output, critique-output, proposal template via `ajv` (when present). |
| **Fallback** | None | Claude reads schemas under `resources/`, performs inline structural checks. Higher token cost; no `ajv`-grade validation. |

Both paths produce same artefact shapes.

**No web research.** Design is generative. Pattern 4 fallback degraded only on schema-validation fidelity, not on research layer.

**No `sharedScripts:` frontmatter.** Does **not** consume `match-signals.js`. Paradigm catalog is **optional inspiration palette**, not routing substrate.

### Preflight (before Step 0)

```bash
node --version
```

1. **Node 18+ available** → primary path. Uses `ajv` when available; missing `ajv` falls back to inline checks for that invocation and names the gap.
2. **Node unavailable** → surface Pattern 4 diagnostic: *"engage-forge produces structured design artefacts (user flows, IA trees, heuristic-finding matrices, journey maps, try/fail cycles, Kano grids) across parallel paradigm paths, then runs heuristic audit pass and persona-driven critique pass on recommendation. With Node, artefact/audit/critique outputs validated against bundled JSON Schemas using `ajv`. Without Node, Claude performs same structural checks inline. Cost: validation approximate; no other feature degraded. Or install Node.js 18+ from https://nodejs.org/."* Then execute Fallback.

Preflight returns `{ runtime: "node" | "none", reason: string }`.

### Fallback Procedure

When Node unavailable, perform validation inline:

1. **Artefact-schema validation.** Read schema under `resources/artefact-schemas/`; check top-level structure against required fields and types. Reject pure-prose paths (AC3).
2. **Heuristic-audit-output validation.** Read `resources/heuristic-audit-output-schema.json`; confirm findings array has required shape (one finding per applied heuristic, each with `heuristic`, `severity`, `artefactElement`, `finding`, `recommendation`).
3. **Critique-output validation.** Read `resources/critique-output-schema.json`; confirm critique produces exactly three friction points, each referencing specific artefact element.

Drift bounded by contract tests under `tests/skills/engage-forge/`.

## When to use

For product and UX design questions where:
- Output you need is a **concrete structured artefact** — user flow, IA map, heuristic-finding matrix, journey map, try/fail cycle, Kano-classification grid — not narrative analysis.
- Multiple **design paradigms** are genuinely live (JTBD, atomic design, contextual inquiry, design-system-first, service-design blueprinting, Nielsen-heuristic-driven redesign).
- You want **named persona's stress test** before adopting.
- User says "design", "redesign", "explore approaches to", "what would the flow look like for", "audit the IA for", "compare these design approaches".

**Do NOT use for:**
- Business/market/financial analytical — `/engage-prism` or `/debate-prism`.
- Code/algorithm/IT-architecture — `/engage-exocortex` or `/spar-exocortex`.
- Legal/policy/compliance — `/engage-lexicon`.
- Pure visual/pixel-level design — text-artefact only (no image generation, no Figma integration).
- Design-system token generation — `/design-system`.
- Questions resolvable from single document or training recall — direct answer cheaper.

## Options

| Flag | Description | Default |
|------|-------------|---------|
| `--paths N` | Parallel paths (2-4) | 3 |
| `--no-proposal` | Skip writing proposal | *(writes)* |
| `--model <model>` | Override subagent model | `opus` |
| `--audit-checklist <name>` | Heuristic checklist: `nielsen-10`, `wcag-aa`, or `custom` (path to user-supplied checklist JSON). Unknown values fail cleanly. | `nielsen-10` |
| `--persona <name>` | Named persona for critique. When omitted, primary agent prompts or selects plausible persona from problem statement. | *(prompted/selected)* |

`--audit-checklist` is **bounded enum + custom-path**. `nielsen-10` and `wcag-aa` resolve to bundled checklists under `resources/heuristic-checklists/`. `custom` requires path argument conforming to `resources/heuristic-checklist-schema.json`. Any other value HALTs: *"Unknown --audit-checklist value '{value}'. Valid: nielsen-10, wcag-aa, custom <path>."*

`--persona` accepts free-text persona name (e.g., `"Mei, smartphone-first checkout user"`) or path to JSON persona profile. Schema in `resources/persona-schema.json`; ad-hoc text personas accepted and primary agent fills in plausible attributes.

## Core Workflow

```
PRIMARY AGENT
     ├── 0. (no web-research scoping — design is generative)
     ├── 1. Parse design problem + pick N paradigms from optional palette
     │       (or ad-hoc) — name each path as "paradigm + artefact-type"
     ├── 2. Dispatch N subagents in PARALLEL
     │       ├── Path 1: [paradigm + artefact] ──► structured artefact (schema-conformant)
     │       ├── Path 2: [paradigm + artefact] ──► structured artefact (schema-conformant)
     │       └── Path N: [paradigm + artefact] ──► structured artefact (schema-conformant)
     ├── 3. Synthesis = COMPARISON TABLE (not merged artefact)
     │       └── Optional: recommend one when clear winner emerges
     ├── 4. HEURISTIC AUDIT PASS (mandatory)
     │       └── Operational-graft recommendation when non-winning path
     │           scores higher on specific heuristic
     ├── 5. CRITIQUE PASS (mandatory)
     │       └── Named persona walks recommendation; exactly 3 friction points
     └── 6. [Default] Write design proposal to Proposal/FORGE-{problem-slug}.md
```

**Opt-out:** `--no-proposal` skips Step 6. Heuristic audit (Step 4) and critique pass (Step 5) are **mandatory** with no opt-out — run every invocation.

## Step 1 — Parse Problem and Pick Paradigms

1. **Parse design problem** — user/segment, task or moment, explicit constraints (platform, accessibility, brand, budget), what "useful artefact" looks like.
2. **Pick N paradigms** from optional palette `resources/paradigms.json` — or ad-hoc. Palette includes: JTBD onboarding flow, atomic-design component decomposition, IA-first nested-list sitemap, Nielsen-heuristic-driven redesign matrix, contextual inquiry journey map, service-design blueprint, Kano-classification feature grid.
3. **Name each path as "paradigm + artefact-type"**. Valid artefact types (one per path):
   - `flow` — markdown table user flow (step → user action → system response → notes)
   - `ia-tree` — nested-list IA sitemap
   - `heuristic-matrix` — heuristic × artefact-element finding matrix
   - `journey-map` — journey-stage table (stage → user state → touchpoint → emotion → opportunity)
   - `try-fail-cycle` — narrative-structured try/fail/retry cycle
   - `kano-grid` — feature × category (basic/performance/delight/indifferent/reverse) classification

Each path's artefact type must conform to schema under `resources/artefact-schemas/`. Pure prose without structured payload is a violation (AC3).

### Paradigm palette (optional, not routed)

`resources/paradigms.json`, `structures.json`, `strategies.json` retained as **optional inspiration palette** — primary agent MAY open them but MUST NOT route through `match-signals.js` (AC10, AC8). Loading full catalog is a violation; selective opens fine.

Palette expands vocabulary, doesn't drive selection mechanically. Design problems too heterogeneous for keyword routing.

## Step 2 — Dispatch N Subagents in Parallel

Spawn all N **at same time**. Each receives slot-filled brief and produces **full structured artefact** conforming to declared schema. Additional narrative ≤200-word rationale.

### Brief generation (slot-filling)

Read `resources/path-brief-template.json`. Fill:
- `problemStatement` — user's design problem.
- `assignedParadigm` — paradigm name (palette or ad-hoc) plus one-sentence rationale.
- `assignedArtefactType` — one of the artefact types. Resolves to schema.
- `constraints` — extracted in Step 1.
- `inspirationPalette` — optional palette entries (1–3 ids, never full catalog).
- `maxRationaleWords` — 200.

### Subagent task

Each subagent:
- Names paradigm and why it fits (≤2 sentences).
- Produces **full artefact** conforming to declared schema (not summary).
- Adds rationale narrative ≤200 words covering strongest design move and most contestable assumption.
- Identifies what would change the artefact (1–3 bullets).

### Artefact-contract enforcement (AC3)

Primary agent validates each returned artefact. Failure modes:

| Failure | Action |
|---|---|
| Artefact missing — only prose returned | **Reject.** Re-dispatch once with directive "produce the structured artefact conforming to the schema before re-submitting"; second failure tags `artefactMissing` and excludes from synthesis. |
| Artefact present but does not conform to declared schema | **Reject.** Re-dispatch once with validation error; second failure tags `artefactSchemaViolation` and excludes. |
| Artefact present but type does not match brief's `assignedArtefactType` | **Reject.** Re-dispatch once; second failure tags `artefactTypeMismatch` and excludes. |

Mechanical contract: **every path emits ≥1 structured artefact conforming to declared schema.** Pure-prose paths fail.

## Step 3 — Synthesis (Comparison Table, NOT Merged Artefact)

Design synthesis does **not produce a single "best" merged artefact** by hybridization. Design artefacts too structurally distinct — JTBD onboarding flow and IA-first sitemap tree are different *shapes*, not different *opinions on same shape*. Hybridizing produces incoherent artefact.

Instead, synthesis produces **comparison table**: paradigm → artefact strengths → fit with problem's stated goals → known weaknesses → recommended use. Read `resources/synthesis-output-schema.json`:

```
| Path | Paradigm | Artefact | Strengths | Weaknesses | Fit with stated goals |
|---|---|---|---|---|---|
| 1 | JTBD     | Flow      | ...       | ...        | ...                   |
| 2 | IA-first | Tree      | ...       | ...        | ...                   |
| 3 | Nielsen  | Matrix    | ...       | ...        | ...                   |
```

Primary agent MAY name one path as recommended when clear winner emerges. Recommendation is artefact audit and critique subsequently work against. When no winner, user picks before audit/critique runs.

### Synthesis-as-comparison contract (AC4)

Schema **rejects merger attempts** — any output combining artefacts into single "merged" artefact fails with diagnostic *"engage-forge synthesis is comparison, not merger. Different artefact types are structurally distinct and cannot be coherently combined. Either pick one path as recommended, or invoke the operational-graft mechanism in Step 4 to selectively transplant a structural element."*

Operational-graft in Step 4 is *only* sanctioned cross-path combination — and only along specific heuristic axis identified by audit.

## Step 4 — Heuristic Audit Pass (Mandatory)

Applies heuristic checklist to recommended (or top-scoring) artefact, surfaces findings as **heuristic-finding matrix**. Design-domain analog of `/engage-exocortex`'s operational-graft mechanism: non-winning path may score higher on specific heuristic; winner should adopt that path's element on that axis.

### Checklist selection

| Flag value | Checklist | Source |
|---|---|---|
| `nielsen-10` *(default)* | Nielsen's 10 usability heuristics | `resources/heuristic-checklists/nielsen-10.json` |
| `wcag-aa` | WCAG 2.1 Level AA checkpoints (artefact-applicable subset) | `resources/heuristic-checklists/wcag-aa.json` |
| `custom <path>` | User-supplied checklist | path arg, conforms to `resources/heuristic-checklist-schema.json` |

Unknown values HALT: *"Unknown --audit-checklist value '{value}'. Valid: nielsen-10, wcag-aa, custom <path>."* (AC6).

### Audit procedure

1. **Load selected checklist.** Each is array of `{id, name, description, severityLevels}` entries.
2. **Apply each heuristic to recommended artefact.** For each, identify most relevant artefact element and produce finding: pass / minor / major / critical, with recommendation.
3. **Emit heuristic-finding matrix** conforming to `resources/heuristic-audit-output-schema.json`:
   ```
   | Heuristic | Artefact Element | Severity | Finding | Recommendation |
   |---|---|---|---|---|
   ```
4. **Score every non-winning path on each heuristic.** For each heuristic where recommendation is not `pass`, check whether non-winning path's artefact would score higher. Operational graft fires when *yes*.

### Operational-graft recommendation

When non-winning path scores higher on specific heuristic, audit emits **graft recommendation**:

```
**Graft recommendation.** Path {N}'s {artefact element} scores higher on
{heuristic} than the recommended Path {M}'s {artefact element}. Transplant
the structural pattern: {specific transplantable element from path N}.
```

Graft is structural, not merged-artefact — names specific element (flow step, IA branch, journey-map row) that can be lifted from non-winning path and adopted by winner. Never produces merged artefact (Step 3 contract); produces instruction user can apply to recommended artefact.

If no non-winning path outscores winner on any heuristic, audit emits `"graftRecommendation": null` and output is matrix alone.

### Audit-output contract (AC5)

**MUST** include:
- Heuristic-finding matrix (one row per applied heuristic).
- Graft recommendation (or `null`).
- Summary of most-severe finding (highest severity, with specific recommendation).

Missing any fails schema validation against `resources/heuristic-audit-output-schema.json`.

## Step 5 — Critique Pass (Mandatory)

**Separate subagent** with named persona (from `--persona` or selected from problem statement) walking recommended artefact as first-time user. Produces **exactly three friction points**, each referencing specific artefact element.

### Persona selection

| Source | Behavior |
|---|---|
| `--persona <name>` provided as free-text string | Primary agent fills in plausible persona attributes (technical comfort, goal, prior knowledge, accessibility needs) and proceeds. |
| `--persona <path>` provided as path to JSON persona file | Validate against `resources/persona-schema.json`; halt on validation failure. |
| `--persona` omitted | Primary agent selects plausible persona from problem statement, names selection in proposal, proceeds. User can re-run with explicit persona if selection wrong. |

### Critique procedure

1. **Brief critique subagent** with persona attributes and recommended artefact.
2. **Subagent walks artefact** as if attempting to complete artefact's implied task for first time, in persona's voice. At each artefact element (flow step, IA branch, journey row, matrix row), persona's reaction reported.
3. **Name exactly three friction points.** Not two, not four. Each must:
   - Reference specific artefact element (e.g., "Step 4 of the flow — 'Enter payment details'").
   - Name friction (what's wrong, in persona's voice).
   - Suggest remediation (≤2 sentences).
4. **Emit critique output** conforming to `resources/critique-output-schema.json`.

### Critique-output contract (AC7)

**MUST** contain exactly three friction-point entries, each with non-empty `artefactElement` reference. Schema rejects:
- Fewer than three friction points → diagnostic: *"Critique pass requires exactly 3 friction points. Got {n}. Re-dispatch the critique subagent with explicit count directive."*
- More than three friction points → *"Critique pass requires exactly 3 friction points. Got {n}. Asked persona to prioritize the top 3."*
- Friction point missing `artefactElement` → *"Friction point #{i} does not reference a specific artefact element. Re-dispatch with directive to name the element."*

"Exactly 3" is deliberate: fewer than 3 understates stress test; more than 3 dilutes prioritization. Three points force persona to triage.

## Step 6 — Generate Design Proposal Document

**Skip if `--no-proposal`.**

Write at `Proposal/FORGE-{problem-slug}.md`. `{problem-slug}` is lowercase-hyphenated summary (e.g., `mobile-checkout-onboarding-redesign`).

Read `resources/proposal-template.json`. Required sections:
1. **Metadata** — Date, skill, paths explored, audit checklist, persona used (named or selected-from-statement), graft recommendation status.
2. **Problem** — Original problem statement.
3. **Paradigms Explored** — One row per path: paradigm, artefact type, one-sentence rationale.
4. **Artefacts** — One section per path with **full structured artefact**, plus rationale (≤200 words per path).
5. **Synthesis Comparison Table** — From Step 3. Recommended path called out if emerged.
6. **Heuristic Audit** — Matrix from Step 4 with most-severe finding called out and graft recommendation (or "no graft").
7. **Critique** — Persona name + attributes, plus three friction points with artefact-element references and remediations.
8. **What Would Change This Recommendation** — 2–3 bullets naming persona/constraint/heuristic that, if updated, would flip recommended path.

Decision-focused — surfaces recommended artefact, audit findings, critique friction points.

## Error Handling

| Failure Mode | Expected Behavior |
|---|---|
| Node missing | Surface Pattern 4; switch to Fallback. No halt. |
| `ajv` missing on Node path | Note schema-validation degradation; proceed with inline checks. |
| Artefact missing from path return | Reject + re-dispatch once; second failure tags `artefactMissing` and excludes. |
| Artefact present but pure prose | Reject as AC3 violation; same re-dispatch. |
| Synthesis attempts to merge artefacts | Reject with AC4 diagnostic; re-run synthesis as comparison. |
| `--audit-checklist <invalid-value>` | HALT with valid-values diagnostic (AC6). |
| Critique pass returns ≠ 3 friction points | Reject and re-dispatch with explicit count directive (AC7). |
| Critique pass friction point missing `artefactElement` | Reject and re-dispatch with element-reference directive. |
| User-supplied custom checklist fails schema | HALT with field error from `resources/heuristic-checklist-schema.json`. |
| User-supplied persona JSON fails schema | HALT with field error from `resources/persona-schema.json`. |

## Important Constraints

- **Artefact-first.** Every path MUST emit structured artefact. Pure-prose paths fail.
- **Synthesis is comparison, not merger.** Operational-graft in Step 4 is only sanctioned cross-path combination.
- **Audit and critique are mandatory.** No opt-out — run every invocation.
- **Exactly three friction points.** Not a range; not a soft target.
- **Paradigm catalog is palette, not routing.** Full-catalog routing through `match-signals.js` is a violation (AC8).
- **No `sharedScripts:`.** Does not consume `match-signals.js` (AC10).
- **No web research.** Generative; competitive examples and prior-art user-supplied.

## Reference Files

In `resources/`. Each JSON data file has colocated schema.

| File | Purpose |
|---|---|
| `paradigms.json` | Optional palette: design paradigms (JTBD, atomic design, contextual inquiry) |
| `structures.json` | Optional palette: structural patterns (component hierarchies, journey-stage frameworks) |
| `strategies.json` | Optional palette: design strategies (mobile-first, accessibility-first, progressive-disclosure) |
| `path-brief-template.json` | Subagent brief slot template |
| `artefact-schemas/flow.schema.json` | Markdown-table user-flow artefact schema |
| `artefact-schemas/ia-tree.schema.json` | Nested-list IA sitemap artefact schema |
| `artefact-schemas/heuristic-matrix.schema.json` | Heuristic × artefact-element finding matrix schema |
| `artefact-schemas/journey-map.schema.json` | Journey-stage table schema |
| `artefact-schemas/try-fail-cycle.schema.json` | Try/fail/retry cycle schema |
| `artefact-schemas/kano-grid.schema.json` | Kano-classification feature grid schema |
| `heuristic-checklists/nielsen-10.json` | Nielsen's 10 usability heuristics (default) |
| `heuristic-checklists/wcag-aa.json` | WCAG 2.1 Level AA checkpoints (artefact-applicable subset) |
| `heuristic-checklist-schema.json` | Schema for custom checklists |
| `heuristic-audit-output-schema.json` | Audit pass output shape |
| `critique-output-schema.json` | Critique pass output (exactly 3 friction points) |
| `persona-schema.json` | Optional persona JSON shape |
| `synthesis-output-schema.json` | Synthesis-as-comparison-table shape (rejects merger) |
| `proposal-template.json` | Document structure template |

## Relationship to sibling skills

Shares structural DNA with `/engage-prism` (cooperative parallel refraction) but differs on output shape and quality gates:

| Dimension | `/engage-prism` | `/engage-forge` |
|---|---|---|
| Problem domain | Business/market/finance | Product/UX design |
| Output shape | Narrative recommendation with citations | Structured artefacts + comparison table |
| Quality gates | Citation validation + recency gate | Heuristic audit pass + persona-driven critique pass |
| Synthesis | May hybridize (graft framing + evidence base) | Comparison only; no artefact merger |
| Web research | Mandatory | None (generative) |
| Routing | Optional `--structured-routing` via `match-signals.js` | Paradigm palette is inspiration-only; no routing |

See `Skills/MAINTENANCE.md` → Adversarial Sibling Skills.

**End of engage-forge SKILL.md**
