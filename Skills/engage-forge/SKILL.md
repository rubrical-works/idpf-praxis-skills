---
name: engage-forge
description: Artefact-first parallel design exploration for product and UX problems. Refracts one design problem into N paradigm-paired structured artefacts (user flows, IA trees, heuristic-finding matrices, journey maps, try/fail cycles, Kano grids), then applies a mandatory heuristic audit pass and a mandatory persona-driven critique pass to the recommended artefact.
effort: high
type: invokable
version: "1.0.1"
frameworkCompatibility: ">=0.80.0"
lastUpdated: "2026-05-18"
license: Complete terms in LICENSE.txt
category: design
relevantTechStack: [product-design, ux-design, ia, journey-mapping, jtbd, nielsen-heuristics, wcag, design-system, refraction]
argument-hint: "[--paths N] [--no-proposal] [--model <opus|sonnet|haiku>] [--audit-checklist <nielsen-10|wcag-aa|custom>] [--persona <name>]"
copyright: "Rubrical Works (c) 2026"
---
# Engage Forge — Artefact-First Parallel Design Exploration
For product and UX design problems: **fan out into N independent design paradigms in parallel**, produce **structured artefacts** (not narrative summaries) from each path, then apply two mandatory quality gates — **heuristic audit pass** and **persona-driven critique pass** — to the recommended artefact.
Fourth pattern slot: **artefact-producing refraction + audit/critique**. Cooperative refraction preserved; output is artefact-shaped rather than narrative.
## Runtime Requirements
Applies the **No-Runtime Fallback Pattern** (see `SKILL-DEVELOPMENT-GUIDE.md` → No-Runtime Fallback Pattern; rationale in `Construction/Design-Decisions/2026-04-26-no-runtime-fallback-pattern.md`). Two paths, chosen by preflight:
| Path | Requires | What it does |
|---|---|---|
| **Primary (default)** | Node.js 18+ on `PATH` | Validates artefact schemas, heuristic-audit-output, critique-output, proposal template against bundled JSON Schemas via `ajv` (when present). |
| **Fallback** | None (inline) | Claude reads the same schemas under `resources/`, performs inline structural checks. Higher token cost; no `ajv`-grade validation. |
Both paths produce the same artefact shapes; path selected at preflight.
**No web research.** Design is generative. Pattern 4 fallback degraded only on schema-validation fidelity.
**No `sharedScripts:` frontmatter.** Does **not** consume `match-signals.js` or the engage-* routing matcher. Paradigm catalog is an **optional inspiration palette**, not a routing substrate.
### Preflight (before Step 0)
Before any step, the primary agent MUST run:
```bash
node --version
```
Then:
1. **Node 18+ available** → primary path. Uses `ajv` when available; missing `ajv` falls back to inline structural checks for *this invocation only* and the diagnostic names the gap (no silent degradation).
2. **Node unavailable** → surface the Pattern 4 diagnostic in diagnostic-order: *"engage-forge produces structured design artefacts (user flows, IA trees, heuristic-finding matrices, journey maps, try/fail cycles, Kano grids) across parallel paradigm paths, then runs a heuristic audit pass and a persona-driven critique pass on the recommendation. With Node available, artefact, audit, and critique outputs are validated against bundled JSON Schemas using `ajv`. Without Node, Claude performs the same structural checks inline against the same schema files — the artefact contract is enforced by the procedure documented below. Cost: artefact and gate-output validation is approximate rather than ajv-grade; no other feature is degraded. Or install Node.js 18+ from https://nodejs.org/ for the deterministic primary path."* Then execute the Fallback Procedure.
Preflight returns `{ runtime: "node" | "none", reason: string }` for subsequent steps.
### Fallback Procedure
When Node is unavailable, validate inline. Three operations replace the three `ajv` classes:
1. **Artefact-schema validation.** Read the schema under `resources/artefact-schemas/`; check top-level structure against required fields and types. Reject pure prose without a structured payload (AC3).
2. **Heuristic-audit-output validation.** Read `resources/heuristic-audit-output-schema.json`; confirm the findings array has the required shape (one finding per applied heuristic, each with `heuristic`, `severity`, `artefactElement`, `finding`, `recommendation`).
3. **Critique-output validation.** Read `resources/critique-output-schema.json`; confirm exactly three friction points, each referencing a specific artefact element.
Drift bounded by contract tests under `tests/skills/engage-forge/`.
## When to use
For product and UX design questions where:
- Output needed is a **concrete structured artefact** — user flow, IA map, heuristic-finding matrix, journey map, try/fail cycle, Kano-classification grid — not narrative analysis.
- Multiple **design paradigms** are genuinely live (JTBD, atomic design, contextual inquiry, design-system-first, service-design blueprinting, Nielsen-heuristic-driven redesign).
- You want a **named persona's stress test** before adopting the recommendation.
- User says "design", "redesign", "explore approaches to", "what would the flow look like for", "audit the IA for", "compare these design approaches".
**Do NOT use for:**
- Business/market/financial analytical — `/engage-prism` (narrative) or `/debate-prism` (directional).
- Code/algorithm/IT-architecture — `/engage-exocortex` or `/spar-exocortex`.
- Legal/policy/compliance — `/engage-lexicon`.
- Pure visual/pixel-level design — text-artefact only (no image generation, no Figma integration).
- Design-system token generation — `/design-system`.
- Questions resolvable from a single document or training recall — direct answer cheaper.
## Options
| Flag | Description | Default |
|------|-------------|---------|
| `--paths N` | Parallel paths (2-4) | 3 |
| `--no-proposal` | Skip writing proposal | *(writes)* |
| `--model <model>` | Override subagent model (`opus`, `sonnet`, `haiku`) | `opus` |
| `--audit-checklist <name>` | Audit checklist: `nielsen-10`, `wcag-aa`, or `custom` (path to user-supplied checklist JSON). Unknown values fail cleanly. | `nielsen-10` |
| `--persona <name>` | Named persona for critique. When omitted, primary agent prompts or selects a plausible persona from the problem statement (naming the selection in the proposal). | *(prompted/selected)* |
`--audit-checklist` is a **bounded enum + custom-path** flag. `nielsen-10` and `wcag-aa` resolve to bundled checklists under `resources/heuristic-checklists/`. `custom` requires a path argument conforming to `resources/heuristic-checklist-schema.json`. Any other value HALTs: *"Unknown --audit-checklist value '{value}'. Valid: nielsen-10, wcag-aa, custom <path>."*
`--persona` accepts a free-text name (e.g., `"Mei, smartphone-first checkout user"`) or a path to a JSON persona profile. Schema: `resources/persona-schema.json`; ad-hoc text personas accepted, primary agent fills in plausible attributes.
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
**Opt-out:** `--no-proposal` skips Step 6. Heuristic audit (Step 4) and critique pass (Step 5) are **mandatory**, no opt-out — they run on every invocation.
## Step 1 — Parse Problem and Pick Paradigms
1. **Parse the design problem** — user/segment, task or moment, explicit constraints (platform, accessibility, brand, budget), what "a useful artefact" looks like.
2. **Pick N paradigms** from the optional palette `resources/paradigms.json` — or ad-hoc when the palette doesn't fit. Palette includes: JTBD onboarding flow, atomic-design component decomposition, IA-first nested-list sitemap, Nielsen-heuristic-driven redesign matrix, contextual inquiry journey map, service-design blueprint, Kano-classification feature grid.
3. **Name each path as "paradigm + artefact-type"** (artefact type = structural output shape). Valid artefact types (one per path):
   - `flow` — markdown table user flow (step → user action → system response → notes)
   - `ia-tree` — nested-list information architecture sitemap
   - `heuristic-matrix` — heuristic × artefact-element finding matrix
   - `journey-map` — journey-stage table (stage → user state → touchpoint → emotion → opportunity)
   - `try-fail-cycle` — narrative-structured try/fail/retry cycle for task completion
   - `kano-grid` — feature × category (basic / performance / delight / indifferent / reverse) classification
Each artefact type must conform to a schema under `resources/artefact-schemas/`. Pure prose without a structured payload is a contract violation (AC3).
### Paradigm palette (optional, not routed)
`resources/paradigms.json`, `structures.json`, `strategies.json` are an **optional inspiration palette** — the primary agent MAY open them selectively to pull an entry into a path brief, but MUST NOT route through `match-signals.js` (AC10, AC8). Loading the full catalog at runtime is a contract violation.
Palette expands paradigm vocabulary; it does not drive selection mechanically — design problems are too heterogeneous for keyword routing.
## Step 2 — Dispatch N Subagents in Parallel
Spawn all N subagents **at the same time** via the Agent tool. Each receives a slot-filled brief and must produce a **full structured artefact** conforming to the schema declared in its brief. Additional narrative limited to a ≤200-word rationale.
### Brief generation (slot-filling)
Read `resources/path-brief-template.json`. For each path, fill:
- `problemStatement` — the user's design problem.
- `assignedParadigm` — paradigm name (palette or ad-hoc) plus one-sentence rationale for the fit.
- `assignedArtefactType` — one of the artefact types above; resolves to a schema under `resources/artefact-schemas/`.
- `constraints` — explicit constraints extracted in Step 1.
- `inspirationPalette` — optional palette entries (1–3 ids, never the full catalog).
- `maxRationaleWords` — 200.
### Subagent task
Each subagent:
- Names the paradigm and why it fits (≤2 sentences).
- Produces a **full artefact** conforming to its declared schema (not a summary).
- Adds rationale ≤200 words covering the strongest design move and the most contestable assumption.
- Identifies what would change the artefact (1–3 bullets).
### Artefact-contract enforcement (AC3)
Primary agent validates each returned artefact against its declared schema before synthesis. Failure modes:
| Failure | Action |
|---|---|
| Artefact missing — only prose returned | **Reject.** Re-dispatch once with directive "produce the structured artefact conforming to the schema before re-submitting"; second failure tags the path `artefactMissing` and excludes from synthesis. |
| Artefact present but does not conform to declared schema | **Reject.** Re-dispatch once with the validation error attached; second failure tags `artefactSchemaViolation` and excludes. |
| Artefact present but type does not match brief's `assignedArtefactType` | **Reject.** Re-dispatch once; second failure tags `artefactTypeMismatch` and excludes. |
Mechanical contract: **every path emits ≥1 structured artefact conforming to its declared schema.** Pure-prose paths fail.
## Step 3 — Synthesis (Comparison Table, NOT a Merged Artefact)
Design synthesis does **not produce a single "best" merged artefact** by hybridization. Artefacts are too structurally distinct — a JTBD onboarding flow and an IA-first sitemap tree are different *shapes*, not different *opinions on the same shape*.
Instead synthesis produces a **comparison table**: paradigm → artefact strengths → fit with stated goals → known weaknesses → recommended use. Read `resources/synthesis-output-schema.json` for the required shape:
```
| Path | Paradigm | Artefact | Strengths | Weaknesses | Fit with stated goals |
|---|---|---|---|---|---|
| 1 | JTBD     | Flow      | ...       | ...        | ...                   |
| 2 | IA-first | Tree      | ...       | ...        | ...                   |
| 3 | Nielsen  | Matrix    | ...       | ...        | ...                   |
```
The primary agent MAY name one path as recommended when a clear winner emerges; that is what audit and critique work against. No winner → the user picks before audit/critique runs.
### Synthesis-as-comparison contract (AC4)
The synthesis output schema **rejects merger attempts** — any output combining artefacts from different paths into a single "merged" artefact fails validation with the diagnostic *"engage-forge synthesis is comparison, not merger. Different artefact types are structurally distinct and cannot be coherently combined. Either pick one path as recommended, or invoke the operational-graft mechanism in Step 4 to selectively transplant a structural element."*
Operational graft (Step 4) is the *only* sanctioned cross-path combination — and only along a specific heuristic axis identified by the audit pass.
## Step 4 — Heuristic Audit Pass (Mandatory)
Applies a heuristic checklist to the recommended (or top-scoring) artefact, surfacing findings as a **heuristic-finding matrix**. Design-domain analog of `/engage-exocortex`'s operational graft: a non-winning path may score higher on a specific heuristic; the winner adopts that element on that axis.
### Checklist selection
| Flag value | Checklist | Source |
|---|---|---|
| `nielsen-10` *(default)* | Nielsen's 10 usability heuristics | `resources/heuristic-checklists/nielsen-10.json` |
| `wcag-aa` | WCAG 2.1 Level AA checkpoints (artefact-applicable subset) | `resources/heuristic-checklists/wcag-aa.json` |
| `custom <path>` | User-supplied checklist | path argument, must conform to `resources/heuristic-checklist-schema.json` |
Unknown values fail cleanly: *"Unknown --audit-checklist value '{value}'. Valid: nielsen-10, wcag-aa, custom <path>."* (AC6).
### Audit procedure
1. **Load the selected checklist.** Each is an array of `{id, name, description, severityLevels}` entries.
2. **Apply each heuristic to the recommended artefact.** For each, identify the most relevant artefact element and produce a finding: pass / minor / major / critical, with a recommendation.
3. **Emit the heuristic-finding matrix** conforming to `resources/heuristic-audit-output-schema.json`:
   ```
   | Heuristic | Artefact Element | Severity | Finding | Recommendation |
   |---|---|---|---|---|
   ```
4. **Score every non-winning path on each heuristic.** Where the recommendation is not `pass`, check whether a non-winning path's artefact would score higher on that heuristic. Operational graft fires when *yes*.
### Operational-graft recommendation
When a non-winning path outscores the recommendation on a specific heuristic, the audit emits a **graft recommendation**:
```
**Graft recommendation.** Path {N}'s {artefact element} scores higher on
{heuristic} than the recommended Path {M}'s {artefact element}. Transplant
the structural pattern: {specific transplantable element from path N}.
```
The graft is structural, not merged-artefact — it names a specific element (flow step, IA branch, journey-map row) liftable from the non-winning path and adoptable by the winner. Never a merged artefact (Step 3 contract) — an instruction the user applies to the recommended artefact.
If no non-winning path outscores the winner on any heuristic, the audit emits `"graftRecommendation": null` and the output is the matrix alone.
### Audit-output contract (AC5)
The audit output **MUST** include:
- The heuristic-finding matrix (one row per applied heuristic).
- The graft recommendation (or `null`).
- A summary of the most-severe finding (highest severity, with its recommendation).
Missing any fails schema validation against `resources/heuristic-audit-output-schema.json`.
## Step 5 — Critique Pass (Mandatory)
A **separate subagent** with a named persona (from `--persona` or selected from the problem statement) walks the recommended artefact as a first-time user, producing **exactly three friction points**, each referencing a specific artefact element.
### Persona selection
| Source | Behavior |
|---|---|
| `--persona <name>` free-text string | Primary agent fills in plausible persona attributes (technical comfort, goal, prior knowledge, accessibility needs) and proceeds. |
| `--persona <path>` JSON persona file | Validate against `resources/persona-schema.json`; halt on failure with the field error. |
| `--persona` omitted | Primary agent selects a plausible persona from the problem statement, names the selection in the proposal, proceeds. User can re-run with an explicit persona. |
### Critique procedure
1. **Brief the critique subagent** with persona attributes and the recommended artefact.
2. **The subagent walks the artefact** as if completing its implied task for the first time, in the persona's voice: at each element (flow step, IA branch, journey row, matrix row), the persona's reaction is reported.
3. **Name exactly three friction points.** Not two, not four. Each must:
   - Reference a specific artefact element (e.g., "Step 4 of the flow — 'Enter payment details'").
   - Name the friction (what's wrong, in the persona's voice).
   - Suggest a remediation (≤2 sentences).
4. **Emit the critique output** conforming to `resources/critique-output-schema.json`.
### Critique-output contract (AC7)
**MUST** contain exactly three friction-point entries, each with a non-empty `artefactElement` reference. Schema validation rejects:
- Fewer than three friction points → *"Critique pass requires exactly 3 friction points. Got {n}. Re-dispatch the critique subagent with explicit count directive."*
- More than three friction points → *"Critique pass requires exactly 3 friction points. Got {n}. Asked persona to prioritize the top 3."*
- Friction point missing `artefactElement` → *"Friction point #{i} does not reference a specific artefact element. Re-dispatch with directive to name the element."*
"Exactly 3" is deliberate: fewer understates the stress test; more dilutes prioritization.
## Step 6 — Generate Design Proposal Document
**Skip if `--no-proposal` was specified.**
Write at `Proposal/FORGE-{problem-slug}.md`. `{problem-slug}` is a lowercase-hyphenated problem summary (e.g., `mobile-checkout-onboarding-redesign`).
Read `resources/proposal-template.json` for section structure. Required sections:
1. **Metadata** — Date, skill name, paths explored, audit checklist, persona used (named or selected-from-statement), graft recommendation status.
2. **Problem** — Original user problem statement.
3. **Paradigms Explored** — One row per path: paradigm, artefact type, one-sentence rationale.
4. **Artefacts** — One section per path with the **full structured artefact**, plus rationale (≤200 words per path).
5. **Synthesis Comparison Table** — From Step 3. Recommended path called out if one emerged.
6. **Heuristic Audit** — Matrix from Step 4, with the most-severe finding called out and the graft recommendation (or "no graft").
7. **Critique** — Persona name + attributes, plus the three friction points with artefact-element references and remediations.
8. **What Would Change This Recommendation** — 2–3 bullets naming the persona / constraint / heuristic that, if updated, would flip the recommended path.
Decision-focused: surfaces the recommended artefact, audit findings, and critique friction points.
## Error Handling
| Failure Mode | Expected Behavior |
|---|---|
| Node missing | Surface Pattern 4 diagnostic; switch to Fallback Procedure. No halt. |
| `ajv` missing on Node path | Note schema-validation degradation in this invocation's diagnostic; proceed with inline checks for this invocation only. |
| Artefact missing from a path return | Reject + re-dispatch once; second failure tags `artefactMissing` and excludes. |
| Artefact present but pure prose (no structured payload) | Reject as AC3 violation; same re-dispatch pattern. |
| Synthesis attempts to merge artefacts | Reject with AC4 diagnostic; re-run synthesis as comparison. |
| `--audit-checklist <invalid-value>` | HALT with the valid-values diagnostic (AC6). |
| Critique pass returns ≠ 3 friction points | Reject and re-dispatch with explicit count directive (AC7). |
| Critique pass friction point missing `artefactElement` | Reject and re-dispatch with element-reference directive. |
| User-supplied custom checklist fails schema | HALT with field error from `resources/heuristic-checklist-schema.json`. |
| User-supplied persona JSON fails schema | HALT with field error from `resources/persona-schema.json`. |
## Important Constraints
- **Artefact-first.** Every path MUST emit a structured artefact. Pure-prose paths fail validation.
- **Synthesis is comparison, not merger.** Operational graft (Step 4) is the only sanctioned cross-path combination.
- **Audit and critique are mandatory.** No opt-out — they run on every invocation.
- **Exactly three friction points.** Not a range; not a soft target.
- **Paradigm catalog is palette, not routing.** Selective opens fine; full-catalog routing through `match-signals.js` is a violation (AC8).
- **No `sharedScripts:`.** Does not consume `match-signals.js` or any shared script (AC10).
- **No web research.** Generative; competitive examples and prior art are user-supplied.
## Reference Files
All in `resources/`. Each JSON data file has a colocated schema.
| File | Purpose |
|---|---|
| `paradigms.json` | Optional palette: design paradigms (JTBD, atomic design, contextual inquiry) |
| `structures.json` | Optional palette: structural patterns (component hierarchies, journey-stage frameworks) |
| `strategies.json` | Optional palette: design strategies (mobile-first, accessibility-first, progressive-disclosure) |
| `path-brief-template.json` | Subagent brief slot template (one per path) |
| `artefact-schemas/flow.schema.json` | Markdown-table user-flow artefact schema |
| `artefact-schemas/ia-tree.schema.json` | Nested-list IA sitemap artefact schema |
| `artefact-schemas/heuristic-matrix.schema.json` | Heuristic × artefact-element finding matrix schema |
| `artefact-schemas/journey-map.schema.json` | Journey-stage table schema |
| `artefact-schemas/try-fail-cycle.schema.json` | Try/fail/retry cycle schema |
| `artefact-schemas/kano-grid.schema.json` | Kano-classification feature grid schema |
| `heuristic-checklists/nielsen-10.json` | Nielsen's 10 usability heuristics (default audit checklist) |
| `heuristic-checklists/wcag-aa.json` | WCAG 2.1 Level AA checkpoints (artefact-applicable subset) |
| `heuristic-checklist-schema.json` | Schema for custom checklists |
| `heuristic-audit-output-schema.json` | Audit pass output shape |
| `critique-output-schema.json` | Critique pass output shape (exactly 3 friction points) |
| `persona-schema.json` | Optional persona JSON shape (free-text strings accepted) |
| `synthesis-output-schema.json` | Synthesis-as-comparison-table shape (rejects merger attempts) |
| `proposal-template.json` | Document structure template for Step 6 |
## Relationship to sibling skills
Differs from `/engage-prism` (cooperative parallel refraction) on output shape and quality gates:
| Dimension | `/engage-prism` | `/engage-forge` |
|---|---|---|
| Problem domain | Business/market/finance | Product/UX design |
| Output shape | Narrative recommendation with citations | Structured artefacts + comparison table |
| Quality gates | Citation validation + recency gate | Heuristic audit pass + persona-driven critique pass |
| Synthesis | May hybridize (graft framing + evidence base) | Comparison only; no artefact merger |
| Web research | Mandatory | None (generative) |
| Routing | Optional `--structured-routing` via `match-signals.js` | Paradigm palette is inspiration-only; no routing |
For a quick-pick guide across the engage-* / debate-* / spar-* / forge family, see `Skills/MAINTENANCE.md` → Adversarial Sibling Skills — When to Pick Which → "Refraction patterns at a glance".
