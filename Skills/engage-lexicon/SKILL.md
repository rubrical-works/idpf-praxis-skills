---
name: engage-lexicon
description: Adversarial for/against/judge analyst for contested legal, policy, and compliance claims. Forks the /debate-prism scaffold with legal-domain extensions — mandatory jurisdiction-declared gate, citation schema enriched for legal authorities (court level, pin-cite, statute/regulation), authority hierarchy enforcement on the citation-diversity check, judge output requiring controlling-vs-persuasive distinction, statutory recency gate, and an educational-only disclaimer stamped on every output.
type: invokable
version: "1.0.0"
frameworkCompatibility: ">=0.80.0"
lastUpdated: "2026-05-16"
license: Complete terms in LICENSE.txt
category: analysis
relevantTechStack: [legal-analysis, policy-analysis, regulatory-compliance, web-research, adversarial-analysis, debate-pattern, citation-schema, json-schema]
argument-hint: "[--no-proposal] [--no-web] [--model <opus|sonnet|haiku>] [--fetch-budget N] [--round-two] [--mode <debate|survey>] [--jurisdiction <jurisdiction>]"
copyright: "Rubrical Works (c) 2026"
---

# Engage Lexicon — Adversarial Legal/Policy/Compliance Analyst

For tackling **contested, direction-stated** legal, policy, or compliance claims — "is this conduct preempted by federal law", "does this contract clause survive under {jurisdiction} unconscionability doctrine", "is this filing requirement triggered" — by running adversarial debate over named legal authorities: baseline pass → parallel for-advocate + against-advocate → judge. Forks `/debate-prism` adversarial scaffold (#214) and adds discipline the legal domain requires: jurisdiction must be declared, citations must distinguish controlling from persuasive authority, every output carries educational-only disclaimer.

**Not licensed legal advice** and never replaces a licensed attorney. Produces structured exploration of a legal/policy/compliance claim under declared jurisdiction, with citation-disciplined argument on both sides and a judge naming which authority settled the call. Output is starting point for further professional review.

Reference data in `resources/`. Every subagent report cites legal authorities per `resources/citation-schema.json` (forked from `/debate-prism`, extended with jurisdiction, court level, year, pin-cite, authority type, controlling-vs-persuasive weight). Does not consume shared scripts — does not declare `sharedScripts:` and does not invoke `match-signals.js`. Debate pattern enforces diversity mechanically via citation-URL non-overlap *plus* authority-hierarchy diversity, not via paradigm/structure/strategy routing.

## Relationship to `/debate-prism` and `/engage-prism`

`/engage-lexicon` structured on `/debate-prism` base (#214) — for/against/judge adversarial flow with mechanical citation diversity. **Not** structured on `/engage-prism` refraction pattern. Legal domain's hallmark — *multiple authorities point in different directions and one wins not by being more numerous but by being more controlling* — fits debate pattern better.

| Dimension | `/engage-prism` | `/debate-prism` | `/engage-lexicon` |
|---|---|---|---|
| Problem domain | Business/market/finance | Business/market/finance | Legal/policy/compliance |
| Pattern | Cooperative parallel exploration | Adversarial for/against/judge | Adversarial for/against/judge (forked from debate-prism) |
| Question shape | Open-ended exploration | Directional claim | Directional legal claim under declared jurisdiction |
| Diversity enforcement | `primarySourceClass` + (optional) taxonomy | Zero URL overlap | Zero URL overlap **plus** authority-hierarchy diversity |
| Mandatory disclaimer | Stamped on finance/legal/medical | Stamped on finance/legal/medical | **Stamped on every output** (educational-only) |
| Jurisdiction gate | N/A | N/A | Mandatory — halts before claim extraction if not declared |
| Optional survey mode | N/A (always refraction-shaped) | N/A | `--mode survey` switches to refraction for landscape questions |

**Choose `/engage-lexicon` when** user has stated directional legal/policy/compliance claim and jurisdiction. Choose `/debate-prism` for business/market/finance claims touching legal issues ("should we acquire X given regulatory exposure" — `/debate-prism`; "does the merger trigger HSR review under current thresholds" — `/engage-lexicon`). Choose `/engage-prism` for open-ended legal landscape exploration without directional claim.

## Runtime Requirements

Applies **No-Runtime Fallback Pattern**. Mirrors `/debate-prism` post-#252 preflight contract. Does not consume `match-signals.js` or any shared script (debate pattern enforces diversity mechanically via citation-URL non-overlap and authority-hierarchy diversity, not routing), so only Node use is `ajv`-based JSON Schema validation. Fallback skips schema validation; rest runs unchanged.

| Path | Requires | What it does |
|---|---|---|
| **Primary** | Node.js 18+, `ajv` installed | Schema-validates against-brief, for-brief, judge-output JSON against colocated schemas (with legal-domain extensions: authority weight, court level, controlling-vs-persuasive distinction). |
| **Fallback** | None | Skips schema validation. For/against/judge workflow runs unchanged. Best-effort structural conformance enforced by SKILL.md prose only. Jurisdiction-declared gate, authority-hierarchy diversity, educational disclaimer remain enforced — tool-side, not script-side. |

**WebFetch / WebSearch** required by default on both paths. For-advocate and against-advocate both perform live legal research and cite authorities (statutes, regulations, case law, agency guidance, secondary sources) by URL.

### Preflight (before Step 0)

Before any other step, including jurisdiction-declared gate:

```bash
node --version
```

1. **Node 18+ available and `ajv` importable (`node -e "require('ajv')"`)** → primary path. Schema validation active.
2. **Node 18+ available but `ajv` missing** → Pattern 4 diagnostic: *"This skill schema-validates advocate and judge JSON using `ajv`. Either install `ajv` (`npm install ajv` in the skill directory or globally) for the primary path, or proceed without schema validation — the workflow still runs but enforcement of report shape is prose-only. Or install Node.js 18+ from https://nodejs.org/ if not yet present."* Continue per operator's choice; record in preflight log.
3. **Node unavailable** → Pattern 4 diagnostic: *"engage-lexicon runs a baseline pass + parallel for/against advocates + judge synthesis over a declared jurisdiction. The Node-backed primary path additionally schema-validates advocate and judge JSON output, including the controlling-vs-persuasive distinction. Without Node, schema validation is skipped — the workflow still runs end-to-end, and the jurisdiction-declared gate, citation-URL diversity, and authority-hierarchy diversity gates (which enforce real evidentiary divergence) still apply because they're tool-side, not script-side. Or install Node.js 18+ from https://nodejs.org/ to enable the schema-validation primary path."* Proceed to Step 0 without schema validation.

Preflight returns `{ runtime: "node" | "none", reason: string, ajv: boolean }`.

### Known fallback limitations

- **No schema validation.** Advocate/judge JSON not validated against schemas. Schemas remain in repo as documentation; SKILL.md prose enforces shape best-effort.
- **Jurisdiction-declared gate still enforced.** Gate is tool-side (primary agent reads invocation and halts if no jurisdiction declared); runs on fallback unchanged.
- **Authority-hierarchy diversity still enforced.** Overlap check is tool-side (synthesis reads citation `authorityType`/`authorityWeight` fields, compares `{jurisdiction, courtLevel, authorityWeight}` tuple sets); runs on fallback.
- **Educational-only disclaimer still stamped.** Disclaimer stamping is SKILL.md prose contract; runs on every output regardless of runtime.

Acceptable for fallback's purpose: keep skill usable on no-Node hosts. Operators with hard schema-validation requirement should install Node.js 18+ and `ajv`.

## When to use

For **directional legal/policy/compliance** questions under declared jurisdiction:
- "Does Delaware's MFW framework apply to this controller transaction?"
- "Is California's AB-5 ABC test preempted by FAAAA for motor carriers?"
- "Does the EU AI Act's high-risk classification apply to this hiring screening tool?"
- "Is this securities communication a Rule 10b-5 violation under SEC v. Howey progeny?"

Use `/debate-prism` for business/finance directional claims **touching** legal issues but fundamentally market or strategy. Use `/engage-prism` for **open-ended legal landscape exploration** without directional claim, or `/engage-lexicon --mode survey` for refraction with legal citation discipline.

**Do NOT use for:**
- **Substitute for licensed legal counsel.** Educational-only output. Does not replace licensed attorney; never represents anyone.
- **Litigation strategy or document drafting.** Never drafts contracts, pleadings, or correspondence for execution/filing.
- **Privileged communication.** Inputs not protected by attorney-client privilege; do not share confidential client facts.
- **Code/algorithm/architecture** — `engage-exocortex`.
- **Open-ended business/market analysis** — `engage-prism`.

## Options

| Flag | Description | Default |
|------|-------------|---------|
| `--no-proposal` | Skip writing debate proposal | *(writes)* |
| `--no-web` | Suppress web research (advocates record `webResearch.performed = false` with `attemptedCalls[]` evidence) | *(web required)* |
| `--model <model>` | Override subagent model | `opus` |
| `--fetch-budget N` | Fetch budget per advocate (baseline counts 1 separately) | 4 |
| `--round-two` | Force second round regardless of judge confidence | *(off — judge triggers)* |
| `--mode <debate\|survey>` | `debate` (default): for/against/judge. `survey`: engage-prism-style refraction over N analytical perspectives, retaining citation schema, jurisdiction gate, disclaimer — for landscape questions. | `debate` |
| `--jurisdiction <jurisdiction>` | Declared jurisdiction (e.g., `"US-Federal"`, `"US-CA"`, `"EU"`, `"US-DE-Chancery"`). MANDATORY. | *(none — halts if absent)* |

`--no-web` is **scoped opt-out** for sandboxed environments; degraded runs MUST record `webResearch.performed=false` plus at least one `attemptedCalls[]` entry — bare unavailability claims fail validation.

`--round-two` forces second round even when judge would not have demanded.

`--mode survey` switches workflow shape but retains all legal-domain discipline (jurisdiction gate, authority-typed citation schema, controlling-vs-persuasive distinction, disclaimer stamp).

## Core Workflow (default `--mode debate`)

```
PRIMARY AGENT
     ├── PREFLIGHT (Node + ajv check)
     ├── JURISDICTION-DECLARED GATE
     │       └── halt with diagnostic if --jurisdiction missing
     ├── 0. Mandatory legal-research scoping — jurisdiction-scoped authority anchors, source classes, recency window, fetch budget
     ├── 1. Claim extraction — name directional legal claim; redirect to /engage-prism (or --mode survey) if no direction
     ├── 2. Baseline pass — one-paragraph initial read with one grounding authority fetch
     ├── 3. Dispatch two adversaries IN PARALLEL:
     │      ├── For-advocate   ──► strongest case FOR the claim under {jurisdiction} + citations[]
     │      └── Against-advocate ──► strongest case AGAINST the claim under {jurisdiction} + citations[]
     │                              (zero URL overlap AND authority-hierarchy diversity vs. for-advocate)
     ├── 4. Judge pass — reads baseline + both briefs + both citation sets; names weakening evidence with controlling-vs-persuasive distinction; endorses / rejects / revises
     ├── 5. Round-two gate (optional) — judge confidence low OR against produced strictly new controlling authority uncountered → re-dispatch for-advocate
     ├── 6. STATUTORY RECENCY GATE — every cited statute/regulation checked against most-recent-amendment date; flag stale
     └── 7. [Default] Write debate proposal to Proposal/LEXICON-{jurisdiction}-{claim-slug}.md with educational-only disclaimer stamped at top
```

**Opt-out:** `--no-proposal`, `--no-web`.

## Jurisdiction-Declared Gate (mandatory)

**Fires immediately after Preflight and before any other step, including Step 0 and Step 1.**

Primary agent reads user's invocation. If `--jurisdiction <jurisdiction>` not present (or value empty/null/whitespace), HALT:

> *"engage-lexicon requires a declared jurisdiction before claim extraction. Legal claims are not jurisdiction-neutral — the same facts can be controlling in one forum and meaningless in another. Re-invoke with `--jurisdiction <jurisdiction>` (examples: `US-Federal`, `US-CA`, `US-NY-SDNY`, `US-DE-Chancery`, `EU`, `UK`, `CA-Ontario`). If you genuinely need a multi-jurisdictional comparison, use `--mode survey --jurisdiction <primary-jurisdiction>` and the survey paths will explore secondary jurisdictions while anchored to the primary."*

Mandatory and cannot be bypassed by any other flag. No `--skip-jurisdiction-gate` flag exists and will not. Re-invocation with declared jurisdiction is only path forward.

**Why mandatory.** Legal claims under unstated jurisdiction will appear coherent — model can fluently produce plausible-looking analysis — but analysis is meaningless: for-advocate may cite Ninth Circuit doctrine and against-advocate Fifth Circuit doctrine, both purportedly resolving same question, with user having no way to detect advocates arguing past each other across forum boundaries.

**Jurisdiction value format.** Short identifier interpreted as controlling forum. Suggested: ISO-country-code or country-name, optionally with hyphen-separated subdivision and forum. Examples: `US-Federal`, `US-CA`, `US-CA-9th`, `US-NY-SDNY`, `US-DE-Chancery`, `EU`, `EU-Germany`, `UK`, `UK-Court-of-Appeal`, `CA-Ontario`. Skill does not enforce fixed enum — value passed through to subagents as string they treat as authoritative.

After gate passes, `{jurisdiction}` propagated through every brief, citation, disclaimer stamp, and proposal filename.

## Step 0 — Legal-Research Scoping (Mandatory)

Same structure as `/debate-prism` Step 0, scoped to declared jurisdiction. Produce research plan with:

1. **Authority anchors.** Specific statutes, regulations, leading cases, agency guidance, treaty provisions. Anchored to `{jurisdiction}`. Sample: `{ "statute": "15 U.S.C. § 78j(b)" }`, `{ "case": "Basic Inc. v. Levinson, 485 U.S. 224 (1988)" }`, `{ "regulation": "17 C.F.R. § 240.10b-5" }`, `{ "agencyGuidance": "SEC Staff Accounting Bulletin No. 99" }`.
2. **Source classes.** Which authority types apply — `statute`, `regulation`, `controlling-case`, `persuasive-case`, `agency-guidance`, `treaty`, `restatement`, `treatise`, `law-review`, `bar-publication`, `news`, `other`. Same `authorityType` enum as `citation-schema.json`.
3. **Recency window.** Case law rarely "stale" but *superseded*; statutes/regulations have most-recent-amendment dates enforced by Step 6; agency guidance can be withdrawn.
4. **Freshness class.** Enum `geopolitical | market | general | statutory`; thresholds `geopolitical`/`market` = 24h, `general` = 72h, `statutory` = "check most-recent-amendment-date" (correctness is supersession-based, not age-based).
5. **Authority preferences.** Within `{jurisdiction}`, prefer controlling authority (binding precedent, applicable statutes/regulations) over persuasive (out-of-forum cases, secondary sources, dicta). Bear sources (counter-case filings, dissents, vacated decisions, withdrawn guidance) valuable for against-advocate.
6. **Fetch budget.** Default 4 per advocate; `--fetch-budget N` overrides.

Record plan in proposal's Context section. Both advocates and judge inherit, including `{jurisdiction}`.

### Citation discipline (extended for legal domain)

Every cited authority must conform to `resources/citation-schema.json` — extended schema with `jurisdiction`, `courtLevel`, `year`, `pinCite`, `authorityType`, `authorityWeight` (`controlling` vs `persuasive`) fields. Non-schema-conformant flagged in judge pass and deprioritized.

### Degradation path + attempted-call evidence

Identical to `/debate-prism`. `webResearch.performed=false` requires `attemptedCalls[]` with at least one documented attempt (method, `targetUrl` or `query`, `errorMessage`, optional `httpStatus`, `attemptedAt` ISO-8601). Bare unavailability is a violation. Primary agent rejects zero-attempt report, re-dispatches once, accepts and tags `degradationEvidence="unverified"` on second failure.

### Return-side validation — reject zero-fetch advocate returns

Identical to `/debate-prism`: reject `performed=false` with non-conforming `attemptedCalls[]`, reject `performed=true` with `fetchCount=0`, re-dispatch once with directive naming specific primary-authority URL (e.g., `https://www.law.cornell.edu/uscode/text/15/78j`), tag `evidence-fabrication-risk` on second zero-fetch.

Fabrication-risk check runs **before** citation-overlap gate and **before** authority-hierarchy diversity gate — computing diversity on fabricated citations is meaningless.

## Step 1 — Claim Extraction

Primary agent extracts **claim under debate** in one sentence:
- **Directional** — takes position ("Delaware's MFW framework applies to this controller transaction") rather than asking open-ended.
- **Named** — concrete legal doctrine, statute, regulation, holding.
- **Jurisdiction-anchored** — controlling forum declared via `--jurisdiction`. Claim's force depends on it.
- **Falsifiable** — there is a state of the law in which claim is wrong.

### Redirect when no direction is stated

If user's question is open-ended ("how does {jurisdiction} treat X"), redirect:

> "Your question is open-ended ('how does X treat Y under {jurisdiction}'). That's a good fit for either `/engage-prism` (general analytical exploration) or `/engage-lexicon --mode survey` (refraction with legal citation discipline retained). `/engage-lexicon` in default `--mode debate` wants a directional claim to pressure-test. Would you like to (a) state a claim and I'll debate it, (b) re-invoke with `--mode survey` for a landscape exploration, or (c) hand off to `/engage-prism`?"

Do not fabricate a directional claim — produces degenerate debate where neither advocate is attacking something the user asserted.

## Step 2 — Baseline Pass

Primary agent produces one-paragraph initial read with **exactly one grounding fetch** of controlling authority within `{jurisdiction}`. Baseline:
- States primary agent's prior (lean toward, lean against, neutral).
- Cites one controlling-authority source conforming to extended `citation-schema.json` (jurisdiction, courtLevel, year, authorityType, authorityWeight=controlling).
- Records baseline for judge.

Not a debate — reference point the judge uses to detect whether adversaries moved the needle within `{jurisdiction}`.

## Step 3 — Dispatch Adversaries (Parallel)

Spawn both **at the same time**. Each receives brief from `resources/for-brief-template.json` or `resources/against-brief-template.json`, with `{jurisdiction}` propagated as immutable input.

### For-advocate brief

- **Task:** Build **strongest case for the claim** under `{jurisdiction}` with schema-conformant citations to controlling authority (persuasive allowed where controlling silent or split).
- **Fetch budget:** N (default 4).
- **Citation requirement:** Every non-derived claim cites authority conforming to extended `citation-schema.json`. Prefer controlling within `{jurisdiction}`.
- **Output:** JSON conforming to `resources/for-brief-schema.json` with `claim`, `jurisdiction`, `corePosition`, `citations[]`, `analysis[]`, `webResearch`, `recommendation`.

### Against-advocate brief

- **Task:** Build **strongest case against the claim** under `{jurisdiction}` with citations from **authorities for-advocate did not use**, AND respecting authority-hierarchy diversity.
- **Citation diversity — two-axis enforcement:**
  - **Axis 1 — URL non-overlap.** Against-advocate's `citations[]` MUST share zero URLs with for-advocate's.
  - **Axis 2 — Authority-hierarchy diversity.** Against-advocate's controlling-authority citations should not be re-citations of same controlling authority (same statute section, same case, same regulation paragraph) as for-advocate's — except when citing different *part* of that authority (different subsection, opinion within same decision, paragraph). Authority-hierarchy diversity respects rank: statute + binding-case (for-side) vs. statute + persuasive-case (against-side) does NOT violate, because persuasive-case adds genuine new authority without re-citing binding-case.
- **Fetch budget:** N (same as for-advocate).
- **Citation requirement:** Same extended schema + authority preference; counter-controlling authority, dissents, vacated decisions, withdrawn guidance, and recent contrary law-review treatment preferred.
- **Output:** JSON conforming to `resources/against-brief-schema.json` — same fields as for-brief plus `targetedCitationIndex`, `jurisdiction`, `authorityHierarchyConflict`.

### Citation diversity enforcement (URL + authority-hierarchy)

After both reports return and fabrication-risk check passes, primary agent computes:

1. **URL overlap** — `overlap = intersect(for.citations.urls, against.citations.urls)`.
2. **Authority-hierarchy overlap** — for every citation, compute tuple `(jurisdiction, authorityType, primaryIdentifier)` where `primaryIdentifier` is statute citation (`15 U.S.C. § 78j(b)`), case caption + year (`Basic Inc. v. Levinson (1988)`), or regulation citation (`17 C.F.R. § 240.10b-5`) — citation's normalized canonical form, stripped of pin-cites and forum-suffixes. Against-side's controlling-authority tuples must not be strict subset of for-side's controlling-authority tuples; at least one controlling-authority tuple must be unique to against-side. (Persuasive-authority tuples not constrained — against-side may cite same persuasive authority for different proposition; only controlling-authority sharing triggers gate.)

Failure modes:
- **`overlap.length === 0` AND authority-hierarchy diverse:** proceed to Step 4.
- **`overlap.length > 0` OR authority-hierarchy not diverse, first detection:** re-dispatch against-advocate once with explicit directive: *"(a) Fetch counter-evidence from distinct URLs — the following overlap and must be replaced: {list}. (b) Your controlling-authority citation set is a strict subset of the for-advocate's controlling-authority set — name at least one controlling authority within {jurisdiction} that the for-advocate did not cite, or a persuasive authority within or outside {jurisdiction} that the for-advocate did not cite. Re-submit only after both diversity gates clear."*
- **Failure persists on second detection:** accept report but tag `citationOverlap="unresolved"` (URL) and/or `authorityHierarchyOverlap="unresolved"` in JSON envelope and surface in judge pass and final proposal.

### Recency gate and attempted-call evidence

Both advocates inherit `freshnessClass`. For non-statutory citations, identical to `/debate-prism`. For statutory/regulatory, see Step 6 (runs at synthesis time).

## Step 4 — Judge Pass

Third subagent. Reads:
- Baseline from Step 2.
- For-brief + citations.
- Against-brief + citations.
- Any citation-overlap or authority-hierarchy tags from Step 3.
- `{jurisdiction}` (immutable).

MUST produce output conforming to `resources/judge-output-schema.json`:

1. **`weakeningEvidence`** — either citation index in against-advocate's `citations[]` that most weakened for-advocate's case, OR literal string `"none"` with non-empty `justification`. When non-`none`, MUST include `authorityWeight` of cited authority (`controlling` or `persuasive`) — see (10).
2. **`verdict`** — `"endorse" | "reject" | "revise"`.
3. **`revisedClaim`** (required when `verdict === "revise"`).
4. **`flipConditions`** — when `verdict === "revise"`, names what evidence would need to be true to reject revised claim. When `verdict === "endorse"` or `"reject"`, names what would flip verdict.
5. **`confidence`** — `"high" | "medium" | "low"`.
6. **`confidenceRationale`** — one-line rationale.
7. **`degradationFlags`** — array collecting any `citationOverlap="unresolved"`, `authorityHierarchyOverlap="unresolved"`, `degradationEvidence="unverified"`, `evidence-fabrication-risk`, `statutoryRecencyStale`, or other degradation warnings.
8. **`perAdvocateFabricationRisk`** — same shape as `/debate-prism`.
9. **`jurisdiction`** — declared jurisdiction, propagated. Required.
10. **Controlling-vs-persuasive distinction on cited authorities** — every citation judge references MUST be annotated with `authorityWeight` (`controlling` or `persuasive`) AND `authorityType` (`statute`, `regulation`, `controlling-case`, `persuasive-case`, `agency-guidance`, etc.). Missing distinction fails schema validation and blocks proposal. *Why:* "the against-advocate cited a Ninth Circuit decision" is a different finding from "the against-advocate cited a binding Supreme Court decision"; conflating them is the failure mode this skill exists to prevent.

Judge does NOT re-run web research. Job is to weigh evidence advocates produced under `{jurisdiction}`.

### Weakening-evidence URL live-verification

Identical to `/debate-prism` Step 4. Before writing proposal, primary agent live-verifies citation URL named by `weakeningEvidence.citationIndex` via WebFetch (reachability + publish-date sanity). Dead URL or blatant publish-date mismatch → re-dispatch judge once with directive to pick different citation OR set `weakeningEvidence` to `"none"`. Second failure blocks proposal.

## Step 5 — Round-Two Gate

After judge returns, primary agent decides whether to re-dispatch:

**Automatic trigger — re-dispatch when ANY of:**
- `judgeOutput.confidence === "low"`, OR
- against-advocate produced **strictly new controlling authority** within `{jurisdiction}` that for-advocate did not address (detected: against-citations with `authorityWeight === "controlling"` and `authorityType in {statute, regulation, controlling-case, agency-guidance}` whose excerpts contradict specific for-advocate claims and were not engaged in for-brief's `analysis[]`), OR
- judge flagged `authorityHierarchyOverlap="unresolved"`.

**Flag trigger — `--round-two` forces** second round regardless of judge confidence.

**Round-two dispatch.** Re-dispatch for-advocate **only** (not against) with directive:

> *"Address the against-advocate's strongest controlling authority (`targetedCitationIndex={N}`, authority `{name}`, weight `controlling`, excerpt: `{excerpt}`). Either refute it with new controlling-or-persuasive authority within {jurisdiction} OR revise the claim to accommodate it. Re-submit using the same schema; preserve {jurisdiction}."*

Judge re-runs on round-two for-brief + original against-brief. Max one round-two — skill does not loop.

### Survey-mode routing (when `--mode survey`)

When `--mode survey`, Steps 1–5 replaced with:

1. **Claim restatement.** No directional claim required; user's question restated as landscape exploration scoped to `{jurisdiction}`.
2. **Path planning.** Primary agent identifies 3 analytical perspectives (e.g., "controlling-statute view", "leading-case view", "agency-guidance view") spanning the question. Diversity enforced on perspectives, not for-vs-against.
3. **Parallel dispatch.** Spawn 3 subagents in parallel. Each receives same `{jurisdiction}` and citation schema; each produces JSON report conforming to `for-brief-schema.json` (re-used; no separate survey schema). Against-advocate's authority-hierarchy diversity gate replaced by *perspective-diversity* gate: each subagent's controlling-authority tuple set must include at least one tuple unique to that perspective.
4. **Synthesis.** Judge subagent (same `judge-output-schema.json`) synthesizes 3 reports. `weakeningEvidence` replaced semantically by citation that most distinguished one perspective from others; `verdict` reframed as `"synthesis-recommended | synthesis-deferred | further-research-required"` — but for schema compatibility, mapped onto `endorse | revise | reject` respectively with `surveyMode: true` flag in envelope.

Survey mode keeps jurisdiction-declared gate, citation schema, controlling-vs-persuasive distinction, statutory recency gate, educational disclaimer fully active. Changes workflow shape but not legal-domain discipline.

Survey mode does NOT run round-two.

## Step 6 — Statutory Recency Gate

For every cited authority in for-brief and against-brief with `authorityType in {statute, regulation}`, primary agent checks staleness against most-recent-amendment date:

1. **Extract most-recent-amendment date.** Citation's `year` field is version year advocate relies on. Primary agent WebFetches canonical source (e.g., Cornell LII for U.S. statutes, agency's own publication for regulations) and reads most-recent-amendment date from canonical page.
2. **Compare.** If `mostRecentAmendmentDate > citation.year` by more than freshness threshold (statute: any amendment potentially material; agency guidance: withdrawal triggers), citation flagged `statutoryRecencyStale` and propagates to `judgeOutput.degradationFlags`.
3. **Material vs. immaterial.** Recency gate flags; does not auto-disqualify. Judge weighs whether amendment is material to specific claim under `{jurisdiction}`. If material, judge MUST address in `confidenceRationale` and affected advocate's case materially weakened (judge may downgrade `verdict`).
4. **Failure modes.**
   - Live-verification fetch fails — recency cannot be confirmed; record `statutoryRecencyUnverified` in `degradationFlags`. Do NOT silently accept.
   - Canonical source has no machine-readable amendment date — fall back to page's last-modified date with explicit warning that date is approximate.

Unique to engage-lexicon (not in `/debate-prism`) because legal domain's "right answer for last year" is meaningfully different from "right answer for this year" in a way recency gates in business/finance skills do not capture.

## Step 7 — Generate Proposal (default)

**Skip if `--no-proposal`.**

Write persistent markdown to `Proposal/LEXICON-{jurisdiction}-{claim-slug}.md` where `{jurisdiction}` is declared jurisdiction and `{claim-slug}` is lowercase-hyphenated summary (e.g., `LEXICON-US-DE-Chancery-mfw-framework-applies.md`).

Read `resources/proposal-template.json`. **Educational-only disclaimer is the FIRST section, stamped at top of every output regardless of whether claim touches finance/medical domains** (legal claims always carry the disclaimer; part of skill's contract, not heuristic-triggered).

Sections (per `proposal-template.json`):
1. **Educational-only disclaimer** — *always* at top.
2. **Metadata** — Date, skill, jurisdiction, claim, mode (debate/survey), fetch budget, rounds, web research performed, verdict, confidence, degradation flags.
3. **Claim** — Full claim from Step 1 (or restated landscape question in survey mode).
4. **Jurisdiction** — Declared jurisdiction with one-line description.
5. **Research Plan** — Authority anchors, source classes, recency window, freshness class, authority preferences, fetch budget.
6. **Baseline** — One-paragraph initial read with controlling-authority citation.
7. **For-Brief** (or survey-mode Perspective 1) — Core position + full `citations[]` table with `authorityType` and `authorityWeight` columns + analysis summary.
8. **Against-Brief** (or survey-mode Perspective 2/3) — Core position + full `citations[]` table + analysis summary + `targetedCitationIndex` + `authorityHierarchyConflict`.
9. **Judge Output** — `weakeningEvidence` (with `authorityWeight` + `authorityType`), `verdict`, `revisedClaim` (if any), `flipConditions`, `confidence`, `confidenceRationale`, `degradationFlags`.
10. **Round History** — If `--round-two` fired.
11. **Statutory Recency Findings** — Any `statutoryRecencyStale` flags from Step 6, with whether judge found amendment material.

## Disclaimer template (Educational-Only)

Stamped at top of EVERY proposal output. No detection heuristic — unconditional for this skill.

> **Educational-only output.** The following is informational and educational, produced by an automated debate-prism-pattern analyst over live web research on {date} under declared jurisdiction `{jurisdiction}`. It is **not licensed legal advice**, does not establish an attorney-client relationship, and is not protected by attorney-client privilege. It is not a substitute for consultation with a licensed attorney admitted in `{jurisdiction}`. Named statutes, regulations, cases, and agency guidance are illustrative; their continuing applicability and force depend on facts not before this analyst (including subsequent legislative amendments, agency action, judicial supersession, and forum-specific procedural posture). You should consult a licensed attorney before acting.

Disclaimer does not refuse to engage with stated legal claim under educational-only framing — refusing to engage with directional legal claim when user has acknowledged educational-only framing is itself a contract violation. Skill's job is to produce structured legal analysis under disclaimer, not to decline.

## No-shared-scripts contract

Does NOT declare `sharedScripts:`. Does NOT consume `match-signals.js`, `load-entries.js`, or any shared script. For/against/judge debate pattern enforces diversity mechanically (citation-URL non-overlap + authority-hierarchy diversity), not via paradigm/structure/strategy routing.

If paradigm taxonomy were retained (it isn't — debate pattern obsoletes it), would be inspiration palette only, never routed through `match-signals.js`. Consistent with `/debate-prism` (#214).

`tests/skills/shared-script-inlining.test.js` confirms engage-lexicon NOT in inlining consumer list.

## Error Handling

| Failure Mode | Expected Behavior |
|---|---|
| Preflight: Node missing | Surface Pattern 4; proceed without schema validation. Do **not** halt — workflow runs end-to-end on fallback. |
| Preflight: Node present but `ajv` missing | Pattern 4; operator chooses install vs proceed-without-validation. |
| Preflight: Node version < 18 | Treat as Node-missing or surface "Node.js 18+ required" + install link. |
| Jurisdiction-Declared Gate: `--jurisdiction` missing | **HALT** with gate diagnostic. No bypass. |
| Step 1: No stated direction | Redirect to `/engage-prism` or `--mode survey`. Do not fabricate. |
| Step 3: For/against citation URLs overlap | Re-dispatch against-advocate once; second failure tags `citationOverlap="unresolved"`. |
| Step 3: Authority-hierarchy not diverse | Re-dispatch against-advocate once with dual-axis directive; second failure tags `authorityHierarchyOverlap="unresolved"`. |
| Step 4: Judge output missing `weakeningEvidence` | Schema validation fails; re-dispatch judge once; second failure blocks proposal. |
| Step 4: Judge output missing controlling-vs-persuasive distinction | Schema validation fails; re-dispatch judge once; second failure blocks proposal. |
| Step 4: Subagent returns non-conforming JSON | Flag schema violations; re-dispatch once; accept with degradation tag on second failure. |
| Step 6: Statutory recency fetch fails | Tag `statutoryRecencyUnverified`; do NOT silently accept. |
| WebFetch / WebSearch unavailable | Record `webResearch.performed = false` with `attemptedCalls[]`; surface degradation in judge output and proposal. |
| Round-two fails to produce new evidence | Accept round-two for-brief; judge's second pass records "round-two did not materially shift the balance". |

## Important Constraints

- **Jurisdiction must come from user.** Never fabricate.
- **Claim must come from user.** Never fabricate directional legal claim from open-ended question.
- **Citation URLs mechanically non-overlapping.** Zero URL overlap between for- and against-advocate.
- **Authority-hierarchy diversity.** At least one controlling-authority citation must be unique to against-side.
- **Controlling-vs-persuasive distinction is required.** Every authority judge references must be annotated.
- **Primary agent validates.** Do not trust subagent JSON without checking against colocated schema.
- **Educational-only disclaimer.** Stamped on every output; no detection heuristic, always-on.
- **Not licensed legal advice.** For informational/educational use as input to further professional review.
- **No attorney-client privilege.** Do not share privileged or confidential client facts.
- **No litigation strategy or document drafting.** Does not draft pleadings, contracts, or correspondence for execution.
- **No `sharedScripts:` frontmatter.** Does not consume `match-signals.js` or any shared script.
- **No docs/ references at runtime.** `docs/` is human-readable reference; skill never reads at runtime.

## Reference Files

In `resources/`. Each JSON data file has colocated schema.

| File | Purpose |
|---|---|
| `citation-schema.json` | Required shape of every citation entry (extended for legal: jurisdiction, courtLevel, year, pinCite, authorityType, authorityWeight) |
| `for-brief-template.json` | Template slot-filled into for-advocate brief; carries `{jurisdiction}` |
| `for-brief-schema.json` | Validator for for-advocate reports; requires `jurisdiction` |
| `against-brief-template.json` | Template slot-filled into against-advocate brief; carries `{jurisdiction}` and for-advocate citation set for diversity enforcement |
| `against-brief-schema.json` | Validator for against-advocate reports; enforces `targetedCitationIndex`, `authorityHierarchyConflict`, dual-axis diversity |
| `judge-output-schema.json` | Validator for judge outputs; enforces `weakeningEvidence`, `verdict`, `flipConditions`, `confidence`, `jurisdiction`, controlling-vs-persuasive distinction |
| `proposal-template.json` | Document structure template; educational-only disclaimer is first section |
| `proposal-template-schema.json` | Validator for proposal template |
