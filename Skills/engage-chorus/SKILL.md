---
name: engage-chorus
description: N-party-steel-man negotiation and mediation skill. Refracts one negotiation situation into N stakeholder-advocate paths (one per party), each producing a structured brief with interests, BATNA, reservation point, tradeable concessions, and coalition signals. A named mediator subagent then produces a negotiated-outcome landscape (ZOPA, trade frontier, settlement zones, unresolved conflicts, concession sequencing, coalition map) — not a winner.
effort: high
type: invokable
version: "1.0.1"
frameworkCompatibility: ">=0.80.0"
lastUpdated: "2026-05-18"
license: Complete terms in LICENSE.txt
category: analysis
relevantTechStack: [negotiation, mediation, multi-stakeholder, conflict-resolution, batna, zopa, steel-man, policy-debate]
argument-hint: "[--no-proposal] [--model <opus|sonnet|haiku>] [--stakeholders <comma-separated-names>]"
copyright: "Rubrical Works (c) 2026"
---
# Engage Chorus — N-Party Steel-Man + Named Mediator
A skill for multi-stakeholder negotiations, mediation, policy debates, and organizational decisions:
1. **Enumerate N stakeholders** (default: primary agent infers; `--stakeholders` supplies).
2. **Dispatch N stakeholder-advocate subagents in parallel** — each steel-mans assigned stakeholder's strongest reasonable position with interests / BATNA / reservation point / tradeable concessions / coalition signals.
3. **Named mediator subagent pass** (mandatory) producing a negotiated-outcome landscape: ZOPA, trade frontier, settlement zones, unresolved conflicts, concession sequencing, coalition map.
4. **Write proposal** with all briefs, mediator's landscape, concession-sequencing recommendation.
Structurally distinct slot: **not** cooperative refraction (paths are stakeholder roles), **not** bilateral debate (multilateral with mediator), **not** propose-attack-measure (no measurement). Closest sibling is `/debate-prism` (#214) — both share steel-man discipline, but chorus is N-ary not bilateral, and mediator output schema differs from judge schema.
## Runtime Requirements
Applies **No-Runtime Fallback Pattern** (see `SKILL-DEVELOPMENT-GUIDE.md`; rationale in `Construction/Design-Decisions/2026-04-26-no-runtime-fallback-pattern.md`). Two paths, chosen by preflight:
| Path | Requires | What it does |
|---|---|---|
| **Primary (default)** | Node.js 18+ on `PATH` | Validates stakeholder briefs, mediator output, proposal template against bundled JSON Schemas via `ajv` (when present). Deterministic contract enforcement. |
| **Fallback** | None (inline in Claude) | Claude reads the same schemas under `resources/`, performs inline structural checks. Higher token cost; no `ajv`-grade validation; contracts enforced by prose rules. |
**No web research.** Negotiation prep rarely needs cited sources; if user provides documents (contract drafts, position papers, prior emails), advocates may reference inline. External citation discipline NOT enforced.
**No `sharedScripts:` frontmatter.** Does **not** consume `match-signals.js`. Stakeholder-role anti-overlap is **automatic** — can't have two paths that are both "the regulator" — so paradigm-as-routing is unnecessary.
### Preflight (before Step 0)
Before any step, the primary agent MUST run:
```bash
node --version
```
1. **Node 18+ available** → primary path. Uses `ajv` when available; missing `ajv` falls back to inline checks for *this invocation only* and the diagnostic names the gap.
2. **Node unavailable** → surface Pattern 4 diagnostic in diagnostic-order: *"engage-chorus refracts one multi-party negotiation into N stakeholder-advocate paths (one per party), enforces steel-man contract on each advocate, runs a named mediator subagent producing a negotiated-outcome landscape (ZOPA, trade frontier, settlement zones, unresolved conflicts, concession sequencing, coalition map), and writes a proposal with the concession-sequencing recommendation. With Node available, stakeholder briefs and mediator output are validated against bundled JSON Schemas using `ajv`. Without Node, Claude performs the same structural checks inline against the same schema files. Cost: validation is approximate rather than ajv-grade; no other feature is degraded. Or install Node.js 18+ from https://nodejs.org/ for the deterministic primary path."* Then execute the Fallback Procedure.
Preflight returns `{ runtime: "node" | "none", reason: string }` for subsequent steps.
### Fallback Procedure
When Node unavailable, validate inline — three operations replace the three `ajv` classes:
1. **Stakeholder-brief validation.** Read `resources/stakeholder-brief-schema.json`; confirm each brief has all six required fields (interests, statedPositions, batna, reservationPoint, tradeableConcessions, coalitionSignals) plus non-empty role and steelManTier.
2. **Mediator-output validation.** Read `resources/mediator-output-schema.json`; confirm output carries ZOPA (or explicit `"none"` with reason), trade frontier, settlement zones, unresolved conflicts, concession sequencing, coalition map.
3. **Proposal-template validation.** Read `resources/proposal-template-schema.json`; confirm proposal carries all required sections.
Drift between inline and `ajv` checks is bounded by contract tests under `tests/skills/engage-chorus/`.
## When to use
For multi-party negotiation / mediation / decision questions where:
- Situation involves **3 or more stakeholders** (bilateral is `/debate-prism`'s territory).
- Output you need is a **negotiated-outcome landscape** (ZOPA + trade frontier + concession sequencing), not a verdict.
- Steel-manning each party's strongest reasonable position is load-bearing.
- User says "how do we structure the negotiation", "what trades clear this deal", "prep for the mediation", "what would each side accept", "where's the ZOPA".
**Do NOT use for:**
- Business/market/financial analytical questions — `/engage-prism`.
- Code/algorithm/IT-architecture — `/engage-exocortex` or `/spar-exocortex`.
- Product/UX design — `/engage-forge`.
- Scientific research — `/engage-crucible`.
- Bilateral directional debate ("should we X?") — `/debate-prism` or `/engage-lexicon` for legal claim adjudication.
- Pure 1:1 negotiation prep — chorus's machinery overkill; bilateral framing fits `/debate-prism` better.
- Real-time chat-based negotiation — chorus is prep-time analysis, not live mediation.
- Individualized conflict counseling / therapy — out of scope.
## Options
| Flag | Description | Default |
|------|-------------|---------|
| `--no-proposal` | Skip writing proposal | *(writes)* |
| `--model <model>` | Override subagent model (`opus`, `sonnet`, `haiku`) | `opus` |
| `--stakeholders <names>` | Comma-separated stakeholder names to override agent-inferred enumeration | *(agent infers)* |
Path count (`N`) determined by situation, NOT by a `--paths` flag — there's no `--paths` here. Typical: 2–6 stakeholders. Two paths with the same role is a contract violation.
## Core Workflow
```
PRIMARY AGENT
     ├── 0. Situation framing — the negotiation, parties, decision at stake
     ├── 1. Stakeholder enumeration — primary agent identifies N stakeholders
     │      (or accepts --stakeholders list). Each gets one path.
     ├── 2. Dispatch N stakeholder advocates in PARALLEL
     │       ├── Advocate 1: [stakeholder] ──► structured brief (steel-manned)
     │       ├── Advocate 2: [stakeholder] ──► structured brief (steel-manned)
     │       └── Advocate N: [stakeholder] ──► structured brief (steel-manned)
     ├── 3. STEEL-MAN GATE (mandatory)
     │       └── Weak-argument briefs re-dispatched once with explicit
     │           steel-man directive; persistent failure tags steelMan="weak"
     │           and mediator deprioritizes that path.
     ├── 4. NAMED MEDIATOR PASS (mandatory)
     │       └── Dedicated subagent reads all N briefs, produces
     │           negotiated-outcome landscape: ZOPA + trade frontier +
     │           settlement zones + unresolved conflicts + concession
     │           sequencing + coalition map.
     └── 5. [Default] Write proposal to Proposal/CHORUS-{situation-slug}.md
```
**Opt-out:** `--no-proposal` skips Step 5. Steel-man gate (Step 3) and named mediator pass (Step 4) are **mandatory** — no opt-out.
## Step 0 — Situation Framing
Primary agent records:
1. **The negotiation.** What's being negotiated — restated in 1–2 sentences (vendor contract, roadmap conflict, policy debate, equity split).
2. **The decision at stake.** Concrete outcome the negotiation must resolve.
3. **The session type.** `commercial | organizational | policy | other` — informs stakeholder-enumeration heuristic. Commercial favors regulator/vendor/buyer/end-user; organizational favors team-lead/executive/cross-team/blocking-team; policy favors regulator/advocate/industry/public.
Record in proposal's Metadata section.
## Step 1 — Stakeholder Enumeration
- **Default (`--stakeholders` not supplied):** Agent infers from situation framing. Typical N: 2–6. Names each with a kebab-case role identifier (`"the-regulator"`, `"the-vendor"`) and one-sentence characterization.
- **Supplied (`--stakeholders <names>`):** User provides comma-separated role names; agent characterizes each and validates no duplicates.
### Stakeholder-role anti-overlap is automatic (AC6)
**Two paths cannot share the same stakeholder role.** Structural property of the pattern:
- Each path has non-empty `role` field (kebab-case identifier).
- Across all N paths, role identifiers are unique.
- A duplicate-role enumeration is a contract violation; primary agent re-enumerates before dispatch.
Makes engage-prism/engage-exocortex paradigm-anti-overlap matrix unnecessary — `match-signals.js` not consulted. Stakeholder enumeration IS the diversity mechanism.
## Step 2 — Dispatch N Stakeholder Advocates in Parallel
Spawn all N **at the same time** using the Agent tool. Each receives a slot-filled brief and produces a stakeholder brief whose **shape is validated** against `resources/stakeholder-brief-schema.json` (AC3) and whose **rendering** is a six-row Markdown table per stakeholder. Six mandatory fields:
| Field | What it captures |
|---|---|
| `interests` | Underlying needs/motivations — NOT stated positions |
| `statedPositions` | Current public stance — may diverge from interests |
| `batna` | Best alternative to negotiated agreement (what happens if no deal) |
| `reservationPoint` | Walk-away threshold — worst deal this stakeholder accepts |
| `tradeableConcessions` | What this stakeholder can give up cheaply that's valuable to others |
| `coalitionSignals` | Which other stakeholders' interests align with this one's |
Missing any fails validation (AC3).
### Brief rendering in the proposal artefact (#272)
In the rendered proposal and bundled `examples/CHORUS-*.md`, each brief renders as a **six-row Markdown table** — one row per required field — under a `### the-<role>` heading. `rationale` and `steelManTier` render as a short prose paragraph immediately below the table (rationale as one paragraph; steelManTier inline as **Steel-man tier:** *strong/weak/inadequate*).
Multi-value fields (`interests`, `tradeableConcessions`, `coalitionSignals`) render as bullet lists *inside the table cell* (`<br>`-separated bullets, or HTML `<ul>`). For `coalitionSignals`, each entry renders as `*alignedWith* — *alignmentBasis*`.
JSON Schema files remain the validation source of truth — the table is a presentation contract layered on top, not a replacement.
### Brief generation (slot-filling)
Read `resources/path-brief-template.json`. For each advocate, fill:
- `situation` — restated from Step 0.
- `assignedStakeholder` — role + one-sentence characterization.
- `otherStakeholders` — names of other N-1 stakeholders (no characterization — keeps advocate focused).
- `sessionType` — from Step 0.
### Steel-man gate (Step 3 contract — AC4)
Advocate's brief carries directive: **steel-man this stakeholder's strongest reasonable form**. Strawmanning/dismissing/caricaturing is a violation.
Classify each returned brief as `strong | weak | inadequate`:
- **Strong:** Interests as real motivations (not "wants the deal to fail"); non-trivial BATNA; concrete tradeable concessions; coalition signals name specific stakeholders.
- **Weak:** Interests reduce to "wants to get concession from X"; BATNA is "they have no alternative"; tradeable concessions absent/generic; coalition signals vague.
- **Inadequate:** Schema fields populated but dismissive/implausible content ("the regulator just wants to make trouble").
**Re-dispatch on weak/inadequate:** Once with explicit directive: *"This brief weakly characterizes {stakeholder}. Re-argue the strongest reasonable form. Specifically: name underlying interests beyond stated positions; specify a non-trivial BATNA; list at least 2 concrete tradeable concessions; name specific coalition signals."*
**Persistent failure tags `steelMan="weak"`** and mediator deprioritizes. Mediator's output notes which paths were deprioritized.
Steel-man mechanic is **soft pattern reuse** from `/debate-prism` (#214) — no shared code; discipline reproduced.
## Step 3 — Steel-Man Gate
Mandatory. Classify each brief, re-dispatch once on weak/inadequate, tag persistent failures `steelMan="weak"`, pass brief set forward to mediator with deprioritization flags.
## Step 4 — Named Mediator Pass (Mandatory)
**Dedicated subagent** reads all N briefs, produces structured mediator output conforming to `resources/mediator-output-schema.json` (AC5). Six required sections (each populated OR explicit `"none"` with structural reason):
### Mediator output fields (AC5)
| Field | What it captures | "none" rationale (when populated as none) |
|---|---|---|
| `zopa` | Zone of possible agreement — overlap region of stakeholder reservation points. Structured per-issue. | "ZOPA = none with structural reason" — name irreconcilable issue. |
| `tradeFrontier` | Concrete trade patterns that could clear deal (X gives up A in exchange for Y giving up B). | "no viable trade frontier" — name missing concession-pair. |
| `settlementZones` | Ranked candidate outcomes with which stakeholders endorse each. | "no settlement zone with majority endorsement" — name cleavage. |
| `unresolvedConflicts` | What cannot be reconciled at the table — structural mismatches, not bargaining failures. | "no unresolved conflict" — rare; usually situation over-simplified. |
| `concessionSequencing` | Recommended order of moves to test deal space (smallest concessions first to surface coalition shape). | "no concession sequencing viable" — name prerequisite information gap. |
| `coalitionMap` | Which stakeholder pairs/triples have aligned interests. | "no coalition pairs" — rare in N≥3 situations. |
**Why "none" with rationale is required.** A mediator silently omitting ZOPA when no ZOPA exists is dishonest — consumer can't tell if mediator failed to find one or one structurally doesn't exist. `"none"` with structural reason makes absence explicit and auditable.
### Mediator's "no winner-picking" contract (AC7)
Output is a **landscape**, not a winner. Schema rejects any output naming a single stakeholder as "the winner" or producing single recommended-outcome without endorsement structure. Synthesis-as-comparison from `/engage-forge` is closest sibling discipline.
If clearly-dominant outcome exists (one settlement zone endorsed by all N), schema still requires full landscape — `settlementZones[0]` with full endorsement is the right shape, not a "winner" field.
### Steel-man weak-tag deprioritization
When one or more paths tagged `steelMan="weak"`, mediator's output includes:
- `deprioritized: [<role>, ...]` field naming paths.
- Note in rationale: landscape computed primarily on strong-tier briefs; weak-tier briefs inform but do not anchor output.
Makes gate's effect visible to consumer.
## Step 5 — Generate Proposal Document
**Skip if `--no-proposal`.**
Write at `Proposal/CHORUS-{situation-slug}.md`. `{situation-slug}` is lowercase-hyphenated summary (e.g., `vendor-contract-renewal-q3`).
Read `resources/proposal-template.json` for structure. Required sections:
1. **Metadata** — Date, skill, situation, session type, stakeholders, deprioritized paths (if any).
2. **Situation** — Restated negotiation + decision at stake.
3. **Stakeholders** — One section per advocate: `### the-<role>` heading + six-row Markdown table for the six required brief fields (see Step 2 — "Brief rendering in the proposal artefact") + short prose paragraph for `rationale` and `steelManTier`. Do **not** embed the brief as a fenced ` ```json ` block.
4. **Mediator Landscape** — Rendered as **six per-section Markdown tables**, one per required section of `resources/mediator-output-schema.json`:
   - **ZOPA** — `| Issue | Overlap |` (one row per overlap entry; `status: none` renders as a single row with the structural reason).
   - **Trade frontier** — `| Gives up | Stakeholder | In exchange for | Counterparty |` (one row per trade).
   - **Settlement zones** — `| Rank | Outcome | Endorsed by |`.
   - **Unresolved conflicts** — `| Conflict | Stakeholders |`.
   - **Concession sequencing** — `| # | Stakeholder | Move | Tests |`.
   - **Coalition map** — `| Members | Aligned interest |`.
   The mediator-output JSON Schema remains the validation source of truth; the table layout is the rendering contract.
5. **Recommended Concession Sequence** — Ordered moves to test deal space (numbered list, prose).
6. **What Would Change This Landscape** — 2–3 bullets naming assumption/stakeholder/constraint that, if updated, would shift recommended sequence.
## Error Handling
| Failure Mode | Expected Behavior |
|---|---|
| Node missing | Surface Pattern 4; switch to Fallback. No halt. |
| `ajv` missing on Node path | Note schema-validation degradation; proceed with inline checks. |
| Stakeholder brief missing one of six required fields | Reject + re-dispatch once (AC3). Second failure tags `briefIncomplete` and excludes from mediator pass. |
| Two paths share same role | Reject before dispatch; re-enumerate (AC6). |
| Mediator output missing one of six required sections | Reject + re-run mediator. Second failure HALTs with field-level diagnostic. |
| Mediator names single stakeholder as "winner" | Reject (AC7); re-run with explicit landscape-not-winner directive. |
| User-supplied `--stakeholders` contains duplicate roles | HALT: "Duplicate role '{role}' — chorus requires unique stakeholder roles." |
| Fewer than 2 stakeholders identified | HALT — bilateral/solo situations not chorus's territory; redirect to `/debate-prism` or direct answer. |
## Important Constraints
- **Stakeholder-role anti-overlap is automatic.** No two paths share a role.
- **Steel-man is mandatory.** Caricaturing any stakeholder fails validation; persistent failure tags `steelMan="weak"` and deprioritizes.
- **Mediator pass is mandatory.** Named subagent role; no opt-out.
- **Synthesis is a landscape, not a winner.** Schema rejects winner-picking.
- **No `sharedScripts:`.** Does not consume `match-signals.js`.
- **No paradigm catalog routing.** Stakeholder enumeration IS diversity mechanism.
- **No web research.** Negotiation prep is generative; user-supplied documents may be referenced inline but external citation not enforced.
- **No round-two adversarial re-engagement.** Mediator output is terminal. To revisit with revised assumptions, re-invoke.
## Reference Files
In `resources/`. Each JSON data file has colocated schema.
| File | Purpose |
|---|---|
| `path-brief-template.json` | Stakeholder-advocate brief slot template |
| `stakeholder-brief-schema.json` | Stakeholder-brief shape (interests, statedPositions, BATNA, reservation point, tradeable concessions, coalition signals, role, steelManTier) |
| `mediator-output-schema.json` | Mediator output shape (ZOPA, trade frontier, settlement zones, unresolved conflicts, concession sequencing, coalition map) |
| `proposal-template.json` | Document structure template for Step 5 |
## Relationship to sibling skills
Structurally distinct slot:
| Dimension | `/engage-chorus` | `/debate-prism` (#214) | `/engage-prism` |
|---|---|---|---|
| Path count | N (multi-lateral; 2–6) | 2 (for-advocate + against-advocate) | N (cooperative analytical lenses) |
| Path identity | Stakeholder roles (regulator, vendor, end-user) | For-advocate / against-advocate of stated direction | Analytical paradigms/structures/strategies |
| Diversity mechanism | Stakeholder enumeration (automatic role anti-overlap) | Citation-URL non-overlap | Paradigm-anti-overlap matrix (optional, `--structured-routing`) |
| Synthesis role | **Mediator** (named subagent) producing landscape | **Judge** (named subagent) producing holding | **Synthesis** producing recommendation (may hybridize) |
| Synthesis output | ZOPA + trade frontier + settlement zones + unresolved conflicts + concession sequencing + coalition map | Holding + decisive-evidence-citation + dissent | Recommendation + hybrid-graft option |
| Steel-man contract | Mandatory; weak briefs re-dispatched + tagged | Mandatory; both advocates steel-man their assigned side | N/A — paths cooperative |
| Web research | None — generative | Mandatory (citation-discipline) | Mandatory (citation-discipline) |
See `Skills/MAINTENANCE.md`.
