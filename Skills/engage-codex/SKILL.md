---
name: engage-codex
description: Artefact-first parallel narrative exploration for screenplay, short-story, novel-chapter, episodic-TV, and game-narrative work. Refracts one story brief into N paradigm-paired structural artefacts (beat-sheets, scene outlines, character-arc grids, thematic-resonance maps, try/fail cycles), then applies a mandatory narrative critique pass covering four categories — pacing valleys, unset-up payoffs, character-motivation gaps, unsupported tonal shifts — across every path.
effort: high
type: invokable
version: "1.0.1"
frameworkCompatibility: ">=0.80.0"
lastUpdated: "2026-05-18"
license: Complete terms in LICENSE.txt
category: narrative
relevantTechStack: [narrative-design, screenwriting, story-structure, beat-sheet, scene-outline, character-arc, three-act, kishotenketsu, hero-journey, save-the-cat, harmon-circle, refraction]
argument-hint: "[--paths N] [--no-proposal] [--model <opus|sonnet|haiku>] [--format <feature-screenplay|tv-pilot|novel-chapter|short-story|game-narrative>]"
copyright: "Rubrical Works (c) 2026"
---

# Engage Codex — Artefact-First Parallel Narrative Exploration

For narrative, screenplay, and long-form writing structure problems by **fanning out into N independent structural paradigms in parallel**, producing **structured story artefacts** (beat sheets, scene outlines, character-arc grids, thematic-resonance maps, try/fail cycles), then applying a mandatory **narrative critique pass** across every emitted artefact.

**Narrative sibling of `/engage-forge`** (#204). Inherits artefact-first refraction wholesale — parallel paradigm paths, structured outputs, synthesis-as-comparison rather than merger, critique pass after synthesis — adapted to narrative:
- Artefacts are **story-structure artefacts**, not UX artefacts.
- Critique uses **four narrative categories** (pacing valleys, unset-up payoffs, character-motivation gaps, unsupported tonal shifts) instead of UX heuristic checklists (Nielsen-10, WCAG-AA).
- **No heuristic audit step** — narrative critique IS the audit; no Nielsen-equivalent applies.
- **No operational-graft mechanism** — cross-paradigm structural hybridization (e.g., three-act turning point onto Kishōtenketsu) forbidden by synthesis-as-comparison contract, because narrative paradigms are not commensurable.
- **Offline-only**: no web-fetching, no web-search, no citation discipline.

NOT an `/engage-prism` clone. Original spec was; amended specification (2026-04-22) restructured around `/engage-forge` base — narrative work produces artefacts not analytical reports; merging three-act with Kishōtenketsu produces incoherent artefact; narrative critique is sibling to forge's persona critique. See [`Construction/Design-Decisions/`](../../Construction/Design-Decisions/).

## Runtime Requirements

Applies **No-Runtime Fallback Pattern** (see `SKILL-DEVELOPMENT-GUIDE.md` → No-Runtime Fallback Pattern; rationale in `Construction/Design-Decisions/2026-04-26-no-runtime-fallback-pattern.md`). Two paths, chosen by preflight:

| Path | Requires | What it does |
|---|---|---|
| **Primary (default)** | Node.js 18+ on `PATH` | Validates narrative artefact schemas, synthesis-output, critique-output via `ajv` (when present). Deterministic, schema-validated artefact contract enforcement. |
| **Fallback** | None | Claude reads schemas under `resources/`, performs inline structural checks. Higher token cost; no `ajv`-grade validation; contract enforced by the same prose rules. |

Both paths produce same artefact shapes. Path selection happens once at preflight.

**No web research.** Narrative is generative. Pattern 4 fallback degraded only on schema-validation fidelity, not on research layer.

**No `sharedScripts:` frontmatter.** Does **not** consume `match-signals.js`. Paradigm catalog is **optional inspiration palette**, not routing substrate — see "Paradigm palette (optional, not routed)".

### Preflight (before Step 0)

```bash
node --version
```

1. **Node 18+ available** → primary path. Uses `ajv` when available; missing `ajv` falls back to inline checks for that invocation and names the gap (per the No-Runtime Fallback Pattern's silent-degradation rule).
2. **Node unavailable** → surface Pattern 4 diagnostic: *"engage-codex produces structured narrative artefacts (beat sheets, scene outlines, character-arc grids, thematic-resonance maps, try/fail cycles) across parallel paradigm paths, then runs narrative critique pass on every artefact. With Node, artefact/synthesis/critique outputs validated against bundled JSON Schemas using `ajv`. Without Node, Claude performs same structural checks inline. Cost: artefact and critique validation approximate; no other feature degraded. Or install Node.js 18+ from https://nodejs.org/."* Then execute Fallback.

Preflight returns `{ runtime: "node" | "none", reason: string }` for subsequent steps to read.

### Fallback Procedure

When Node unavailable, perform validation inline:

1. **Artefact-schema validation.** Read corresponding schema under `resources/artefact-schemas/`; check top-level structure against required fields and types. Reject pure-prose paths (see AC4).
2. **Synthesis-output validation.** Read `resources/synthesis-output-schema.json`; confirm comparison table (not merged outline). Schema rejects merger at `outputType` const level; inline check mirrors by failing any output naming `merged-outline`, `hybrid`, or `fused-artefact`.
3. **Critique-output validation.** Read `resources/narrative-critique-output-schema.json`; confirm entry for every path with explicit findings (or `"clean": true`) for each of four required categories.

Drift bounded by contract tests under `tests/skills/engage-codex/` — those tests run against both paths via fixture inputs.

## When to use

For narrative, screenplay, novel, short-story, episodic-TV, or game-narrative questions where:
- Output is a **concrete structural artefact** — beat sheet, scene-by-scene outline, character-arc grid, thematic-resonance map, try/fail cycle — not narrative analysis or prose draft.
- Multiple **structural paradigms** are genuinely live (three-act, Kishōtenketsu, hero's journey, Save-the-Cat, Harmon's story circle, Freytag's pyramid, Aristotelian unities).
- You want a **structural critique** before adopting — pacing valleys, unset-up payoffs, character-motivation gaps, unsupported tonal shifts.
- User says "story structure", "beat out this idea", "outline this", "what would this look like as a three-act vs Kishōtenketsu", "audit this outline for pacing".

**Do NOT use for:**
- Product/UX design — `/engage-forge`.
- Business/market/financial analytical — `/engage-prism` (narrative) or `/debate-prism` (directional).
- Code/algorithm/IT-architecture — `/engage-exocortex` or `/spar-exocortex`.
- Legal/policy/compliance — `/engage-lexicon`.
- Multi-stakeholder negotiation — `/engage-chorus`.
- **Prose generation of actual story content** — this skill is structural/outline only; does not write scenes, dialogue, prose. Use writing tool after structure settled.
- Questions resolvable from single document or training recall — direct answer cheaper.

## Options

| Flag | Description | Default |
|------|-------------|---------|
| `--paths N` | Parallel paradigm paths (2-4) | 3 |
| `--no-proposal` | Skip writing proposal | *(writes)* |
| `--model <model>` | Override subagent model (`opus`, `sonnet`, `haiku`) | `opus` |
| `--format <format>` | Narrative format. One of: `feature-screenplay`, `tv-pilot`, `novel-chapter`, `short-story`, `game-narrative`. Influences artefact types primary agent picks. | *(inferred)* |

`--format` is bounded enum. Unknown values HALT: *"Unknown --format value '{value}'. Valid: feature-screenplay, tv-pilot, novel-chapter, short-story, game-narrative."*

When omitted, primary agent infers from story brief (e.g., "90-minute thriller" → `feature-screenplay`; "8-episode arc" → `tv-pilot`).

## Core Workflow

```
PRIMARY AGENT
     ├── 0. (no web-research scoping — narrative is generative)
     ├── 1. Parse story brief + pick N paradigms from optional palette
     │       (or ad-hoc) — name each path as "paradigm + artefact-type"
     ├── 2. Dispatch N subagents in PARALLEL
     │       ├── Path 1: [paradigm + artefact] ──► structured artefact (schema-conformant)
     │       ├── Path 2: [paradigm + artefact] ──► structured artefact (schema-conformant)
     │       └── Path N: [paradigm + artefact] ──► structured artefact (schema-conformant)
     ├── 3. Synthesis = COMPARISON TABLE (not merged outline)
     │       └── Optional: recommend one when clear winner emerges
     ├── 4. NARRATIVE CRITIQUE PASS (mandatory)
     │       └── For every path's artefact, finding or "clean" per category:
     │           pacing valleys, unset-up payoffs, character-motivation gaps,
     │           unsupported tonal shifts
     └── 5. [Default] Write narrative proposal to Proposal/CODEX-{slug}.md
```

**Opt-out:** `--no-proposal` skips Step 5. Narrative critique pass (Step 4) is **mandatory**, no opt-out — runs every invocation, against every path's artefact (not just the recommendation, contrast forge).

**Why no heuristic audit step?** Forge runs heuristic-audit (Nielsen-10/WCAG-AA) before critique. Codex omits: narrative critique IS the audit for narrative. No Nielsen-equivalent checklist for story structure — the four categories cover same ground as forge's audit-plus-critique combined. Adding an "audit" would be redundant or fabricated Nielsen-analog.

**Why no operational-graft mechanism?** Forge allows grafting structural element from non-winning path. Codex omits: narrative paradigms not commensurable along single structural axis. Grafting three-act second-act turning point onto Kishōtenketsu destroys `ki-shō-ten-ketsu` rhythm; grafting Save-the-Cat "All Is Lost" onto Harmon-circle duplicates a structural slot. Synthesis-as-comparison is correct stopping point — pick a paradigm, commit.

## Step 1 — Parse Story Brief and Pick Paradigms

1. **Parse story brief** — premise, genre, length target (feature, pilot, short story, novel chapter, game arc), tone, protagonist's want and need, central conflict, explicit constraints (rating, network/platform, IP, budget).
2. **Pick N paradigms** from optional palette `resources/paradigms.json` — or ad-hoc. Palette includes: three-act, Kishōtenketsu, hero's journey, Save-the-Cat, Freytag's pyramid, Harmon's story circle, Aristotelian unities.
3. **Name each path as "paradigm + artefact-type"**. Valid artefact types (one per path):
   - `beat-sheet` — paradigm-specific structural slots (Save-the-Cat's 15 beats; three-act setup/confrontation/resolution; Kishōtenketsu's ki-shō-ten-ketsu)
   - `scene-outline` — sequence of `scene` objects (slugline, summary, beat-purpose, characters, conflict, outcome)
   - `character-arc-grid` — per-character grid of want/need/wound/arc-direction/scene-by-scene emotional trajectory
   - `thematic-resonance-map` — recurring motifs/symbols/thematic statements per beat or scene
   - `try-fail-cycle` — conflict-attempt-result chain (try → fail → try → fail → try → succeed/fail-final)

Each path's artefact type must conform to schema under `resources/artefact-schemas/`. Pure prose without structured payload is a violation (AC4).

### Paradigm palette (optional, not routed)

`resources/paradigms.json`, `resources/structures.json`, `resources/strategies.json` retained as **optional inspiration palette** — primary agent MAY open them to pull a specific entry into a brief, but MUST NOT route through `match-signals.js` (AC8, AC10). Loading full catalog is a violation; selective opens fine.

Palette's purpose is to expand vocabulary, not drive selection mechanically. Narrative problems too heterogeneous for keyword routing to add value.

## Step 2 — Dispatch N Subagents in Parallel

Spawn all N **at same time** using the Agent tool. Each receives slot-filled brief and produces **full structured artefact** conforming to declared schema. Additional narrative ≤200-word rationale.

### Brief generation (slot-filling)

Read `resources/path-brief-template.json`. For each path, fill:
- `storyBrief` — premise, genre, format, tone, protagonist want/need, central conflict.
- `assignedParadigm` — paradigm name (palette or ad-hoc) plus one-sentence rationale.
- `assignedArtefactType` — one of the artefact types. Resolves to schema under `resources/artefact-schemas/`.
- `constraints` — extracted in Step 1.
- `inspirationPalette` — optional palette entries (1–3 ids, never full catalog).
- `maxRationaleWords` — 200.

### Subagent task

Each subagent:
- Names paradigm and why it fits (≤2 sentences).
- Produces **full artefact** conforming to declared schema (not summary).
- Adds rationale narrative ≤200 words covering strongest structural move and most contestable assumption.
- Identifies what would change the artefact (1–3 bullets).

### Artefact-contract enforcement (AC4)

Primary agent validates each returned artefact against its declared schema before synthesis. Failure modes:

| Failure | Action |
|---|---|
| Artefact missing — only prose returned | **Reject.** Re-dispatch once with directive "produce the structured artefact conforming to the schema before re-submitting"; second failure tags `artefactMissing` and excludes from synthesis. |
| Artefact present but does not conform to declared schema | **Reject.** Re-dispatch once with validation error attached; second failure tags `artefactSchemaViolation` and excludes. |
| Artefact present but type does not match brief's `assignedArtefactType` | **Reject.** Re-dispatch once; second failure tags `artefactTypeMismatch` and excludes. |

Mechanical contract: **every path emits ≥1 structured artefact conforming to declared schema.** Pure-prose paths fail. See AC4.

## Step 3 — Synthesis (Comparison Table, NOT Merged Outline)

Narrative synthesis does **not produce a single "best" merged outline** by hybridization. Narrative paradigms are structurally distinct — three-act outline and Kishōtenketsu outline are different *shapes*, not different *opinions on same shape*. Hybridizing produces incoherent outline whose internal structural rhythm doesn't hold.

Concretely: three-act's "midpoint reversal" and Kishōtenketsu's "ten" (twist) are not the same beat renamed. Midpoint reversal redirects protagonist's pursuit of same goal; `ten` introduces development *re-framing* meaning of preceding `ki-shō` setup without changing pursuit. Merged outline placing both at same position produces a story confused about whether second half is escalation or re-framing.

Instead, synthesis produces **comparison table**: paradigm → structural strengths → which kind of story this outline serves best → identified weaknesses → recommended use. Read `resources/synthesis-output-schema.json`:

```
| Path | Paradigm        | Artefact      | Strengths | Weaknesses | Best-served story shape |
|---|---|---|---|---|---|
| 1 | Three-act       | Beat sheet    | ...       | ...        | ...                     |
| 2 | Kishōtenketsu   | Beat sheet    | ...       | ...        | ...                     |
| 3 | Harmon circle   | Scene outline | ...       | ...        | ...                     |
```

Primary agent MAY name one path as recommended when clear winner emerges. Critique pass in Step 4 runs against **every path's artefact**, not just recommendation. When no winner, user picks before reading critique findings.

### Synthesis-as-comparison contract (AC5)

Schema **rejects merger attempts** — any output combining artefacts into single "merged" outline fails with diagnostic *"engage-codex synthesis is comparison, not merger. Different narrative paradigms are structurally distinct and cannot be coherently combined. Pick one paradigm as recommended, or present the comparison and let the user choose."*

No operational-graft escape hatch. Forge has one (heuristic-axis-specific element transplant); codex does not, because narrative paradigms are not commensurable along a single structural axis.

## Step 4 — Narrative Critique Pass (Mandatory)

**Separate subagent** walks **every path's artefact** (not just recommendation, contrast forge), flagging structural problems in four categories. Each category requires explicit array of findings OR explicit `"clean": true` — silent omission is a violation.

### Why every path, not just recommendation?

Forge runs critique against recommendation only because persona walks one artefact end-to-end. Codex runs critique against every path because user makes structural commitment (pick a paradigm) and needs to see structural weaknesses of each option *before* committing. "Clean" finding on a category is evidence the paradigm handles that category well.

### The four narrative critique categories

| Category | What the critique looks for |
|---|---|
| **Pacing valleys** | Beats or scenes where structural momentum stalls — too much setup before inciting incident, too long between turning points, flat second act with no escalation, resolution lingering past climax. |
| **Unset-up payoffs** | Beats or scenes where development pays off without being set up earlier — deus-ex-machina arrival, hidden skill not established, relationship resolving without prior tension. |
| **Character-motivation gaps** | Beats or scenes where character action is unmotivated by what we know — passive protagonist suddenly acts without trigger, villain reveals motive that doesn't match earlier behavior, side character pivots allegiance without cause. |
| **Unsupported tonal shifts** | Beats or scenes where tone shifts (drama→comedy, tense→bucolic, intimate→spectacle) without earlier preparation — sudden levity in thriller's third act, graphic violence in romance, tonally mismatched musical number. |

### Critique procedure

1. **Brief the critique subagent** with all N path artefacts and four-category contract.
2. **Subagent walks every path's artefact** beat-by-beat (or scene-by-scene, for scene outlines), flagging findings per category.
3. **For each path, emit one critique entry** with four sub-fields — one per category — containing either array of finding objects OR explicit `"clean": true`. A finding references specific artefact element (e.g., "Beat 7: All Is Lost", "Scene 4: Coffee shop confrontation") plus friction and suggested remediation (≤2 sentences).
4. **Emit critique output** conforming to `resources/narrative-critique-output-schema.json`.

### Critique-output contract (AC6)

**MUST** contain one entry per path; each entry **MUST** contain all four category fields. Schema rejects:
- Critique entry missing one of four category fields → diagnostic: *"Critique entry for path {N} is missing category '{category}'. Each path's critique must populate all four narrative critique categories — explicitly clean is fine, silent omission is not."*
- Critique entry with `"findings": []` AND no `"clean": true` → *"Critique entry for path {N}, category '{category}' has no findings and no explicit clean declaration. Mark `\"clean\": true` to declare structural absence."*
- Finding without `artefactElement` reference → *"Finding in path {N}, category '{category}' does not reference a specific artefact element. Re-dispatch with directive to name the element."*

"Explicit clean OR findings" mirrors engage-chorus mediator-output discipline: silent omission is dishonest because user can't distinguish "critique found nothing" from "critique skipped this category". The structured declaration makes absence auditable.

## Step 5 — Generate Narrative Proposal Document

**Skip if `--no-proposal`.**

Write at `Proposal/CODEX-{slug}.md`. `{slug}` is lowercase-hyphenated summary (e.g., `feature-thriller-amnesiac-spy`).

Read `resources/proposal-template.json`. Required sections:
1. **Metadata** — Date, skill, paths explored, format, recommended path (or "user choice").
2. **Story Brief** — Original user brief.
3. **Paradigms Explored** — One row per path: paradigm, artefact type, one-sentence rationale.
4. **Artefacts** — One section per path with **full structured artefact**, plus rationale (≤200 words per path).
5. **Synthesis Comparison Table** — From Step 3. Recommended path called out if emerged.
6. **Narrative Critique** — One section per path with findings per category. "Clean" categories listed explicitly.
7. **What Would Change This Recommendation** — 2–3 bullets naming constraint/paradigm assumption/story-brief detail that, if updated, would flip recommended path.

Decision-focused — surfaces recommended outline, comparison table, per-path critique findings.

## Error Handling

| Failure Mode | Expected Behavior |
|---|---|
| Node missing | Surface Pattern 4; switch to Fallback. No halt. |
| `ajv` missing on Node path | Note schema-validation degradation; proceed with inline checks for this invocation only. |
| Artefact missing from path return | Reject + re-dispatch once; second failure tags `artefactMissing` and excludes. |
| Artefact present but pure prose | Reject as AC4 violation; same re-dispatch. |
| Synthesis attempts to merge outlines | Reject with AC5 diagnostic; re-run synthesis as comparison. |
| `--format <invalid-value>` | HALT with valid-values diagnostic. |
| Critique entry missing one of four category fields | Reject and re-dispatch with explicit category directive (AC6). |
| Critique finding missing `artefactElement` | Reject and re-dispatch with element-reference directive. |
| Critique entry with empty findings and no `"clean": true` | Reject and re-dispatch with explicit clean-or-findings directive. |

## Important Constraints

- **Artefact-first.** Every path MUST emit structured artefact. Pure-prose paths fail.
- **Synthesis is comparison, not merger.** Different narrative paradigms are structurally distinct. No operational-graft escape hatch.
- **Critique pass is mandatory and runs on every path.** Not just recommendation. No opt-out.
- **Four critique categories required per path.** Each populated with findings or `"clean": true`. Silent omission forbidden.
- **No heuristic audit step.** Narrative critique IS the audit; no Nielsen-equivalent applies.
- **No operational-graft mechanism.** Narrative paradigms not commensurable along single axis.
- **Paradigm catalog is palette, not routing.** Selective opens fine; full-catalog routing through `match-signals.js` is a violation (AC8).
- **No `sharedScripts:`.** Does not consume `match-signals.js` or any shared script (AC10).
- **No web research.** Skill is generative; competitive examples and prior-art user-supplied.

## Reference Files

In `resources/`. Each JSON data file has colocated schema where applicable.

| File | Purpose |
|---|---|
| `paradigms.json` | Optional palette: narrative paradigms (three-act, Kishōtenketsu, hero's journey, Save-the-Cat, Freytag, Harmon, Aristotelian) |
| `structures.json` | Optional palette: structural patterns (act breaks, beat templates, scene-sequence shapes) |
| `strategies.json` | Optional palette: narrative strategies (in medias res, frame story, parallel timelines, unreliable narrator) |
| `path-brief-template.json` | Subagent brief slot template (one per dispatched path) |
| `path-output-schema.json` | Path subagent output envelope (paradigm + artefact-type + artefact + rationale) |
| `artefact-schemas/beat-sheet.schema.json` | Paradigm-specific beat sheet schema (slots vary by paradigm) |
| `artefact-schemas/scene-outline.schema.json` | Scene-by-scene outline schema (sequence of scene objects) |
| `artefact-schemas/character-arc-grid.schema.json` | Per-character arc grid schema |
| `artefact-schemas/thematic-resonance-map.schema.json` | Motif recurrence per beat/scene schema |
| `artefact-schemas/try-fail-cycle.schema.json` | Conflict-attempt-result chain schema |
| `synthesis-output-schema.json` | Synthesis-as-comparison-table shape (rejects merger) |
| `narrative-critique-output-schema.json` | Critique pass output (one entry per path, four required categories) |
| `proposal-template.json` | Document structure template for Step 5 |
| `proposal-template-schema.json` | Schema for proposal template |

## Relationship to sibling skills

**Narrative sibling of `/engage-forge`** — same artefact-first base, different domain and critique shape:

| Dimension | `/engage-forge` | `/engage-codex` |
|---|---|---|
| Problem domain | Product/UX design | Narrative/screenplay/long-form structure |
| Output shape | Structured UX artefacts (flows, IA trees, journey maps) | Structured story artefacts (beat sheets, scene outlines, arc grids) |
| Quality gates | Heuristic audit pass + persona-driven critique pass | Narrative critique pass (4 categories) only |
| Synthesis | Comparison; operational graft allowed on specific heuristic axis | Comparison only; no graft (paradigms not commensurable) |
| Web research | None (generative) | None (generative) |
| Routing | Paradigm palette is inspiration-only; no routing | Same |

Distinct from sibling refraction-pattern skills:

| Dimension | `/engage-prism` | `/engage-codex` |
|---|---|---|
| Output shape | Narrative recommendation with citations | Structured story artefacts |
| Web research | Mandatory (citations + recency gate) | None |
| Quality gates | Citation validation + recency | Narrative critique pass (4 categories) |
| Pattern base | Analytical refraction | Artefact-first refraction (forge sibling) |

See `Skills/MAINTENANCE.md` → Artefact-First Refraction Patterns — When to Pick Which.
