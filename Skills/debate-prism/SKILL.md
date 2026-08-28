---
name: debate-prism
description: Adversarial for/against/judge analyst for contested business, marketing, and financial claims. Extracts the claim under debate, runs a baseline pass, dispatches a for-advocate and an against-advocate in parallel with mechanical citation diversity, then routes to a judge subagent that names the specific evidence that settled the call. Preserves the citation schema, recency gate, attempted-call evidence, and disclaimer contract from /engage-prism.
effort: high
type: invokable
version: "1.0.2"
frameworkCompatibility: ">=0.80.0"
lastUpdated: "2026-05-18"
license: Complete terms in LICENSE.txt
category: analysis
relevantTechStack: [business-analysis, market-research, financial-analysis, web-research, adversarial-analysis, debate-pattern, json-schema]
argument-hint: "[--no-proposal] [--no-web] [--model <opus|sonnet|haiku>] [--fetch-budget N] [--round-two]"
copyright: "Rubrical Works (c) 2026"
---
# Debate Prism — Adversarial For/Against/Judge Analyst
For **contested, direction-stated** business/marketing/financial claims — adversarial debate: baseline → parallel for+against advocates → judge. Keeps `/engage-prism` citation discipline + recency gate; no paradigm/structure/strategy taxonomy — diversity enforced mechanically (citation URLs must not overlap across advocates). Reference data in `resources/` as schema-validated JSON. Every subagent report cites per `resources/citation-schema.json`. Does NOT declare `sharedScripts:`; does NOT invoke `match-signals.js`.
## Runtime Requirements
Applies **No-Runtime Fallback Pattern** (see `SKILL-DEVELOPMENT-GUIDE.md`). Only Node use is `ajv` schema validation of advocate/judge briefs; fallback skips it, workflow unchanged.
| Path | Requires | What it does |
|---|---|---|
| **Primary** | Node 18+, `ajv` installed | Schema-validates against-brief, for-brief, judge-output JSON. |
| **Fallback** | None | Skips schema validation. Workflow runs unchanged; shape enforced by prose only. |
**WebFetch / WebSearch** required by default on both paths. Both advocates do live web research + cite.
### Preflight (runs before Step 0)
Primary agent MUST run `node --version`. Then:
1. **Node 18+ available AND `ajv` importable (`node -e "require('ajv')"`)** → primary path; schema validation active for all subagent outputs.
2. **Node 18+ available, `ajv` missing** → Pattern 4 diagnostic: *"This skill schema-validates advocate and judge JSON using `ajv`. Either install `ajv` (`npm install ajv` in the skill directory or globally) for the primary path, or proceed without schema validation — the workflow still runs but enforcement of report shape is prose-only. Or install Node.js 18+ from https://nodejs.org/ if not yet present."* Continue per operator choice; record in preflight log.
3. **Node unavailable** → Pattern 4 diagnostic: *"debate-prism runs a baseline pass + parallel for/against advocates + judge synthesis. The Node-backed primary path additionally schema-validates advocate and judge JSON output. Without Node, schema validation is skipped — the workflow still runs end-to-end, and the citation-URL diversity gate (which enforces real evidentiary divergence) still applies because it's tool-side, not script-side. Or install Node.js 18+ from https://nodejs.org/ to enable the schema-validation primary path."* Proceed to Step 0 without schema validation.
Preflight returns `{ runtime: "node" | "none", reason: string, ajv: boolean }`.
### Known fallback limitations
- **No schema validation.** Advocate/judge JSON not validated against `against-brief-schema.json`, `for-brief-schema.json`, `judge-output-schema.json`. Schemas remain as documentation; prose enforces shape best-effort.
- **Citation-URL diversity still enforced.** Tool-side (synthesis reads citation arrays and compares URL sets), not script-side; runs on fallback.
Operators requiring schema validation should install Node 18+ and `ajv`.
## When to use this skill
Use `/debate-prism` for **directional** questions (user stated or asks to validate a claim), e.g. "Should we expand into Japan B2B SaaS in 2H 2026?", "Is ACME stock a buy?", "Does it make sense to shut the consumer product line and focus on enterprise?". Use `/engage-prism` for **open-ended exploratory** questions; if `/debate-prism` invoked on open-ended question, redirect rather than fabricate a claim.
**Do NOT use this skill for:**
- Code, algorithm, or IT-architecture questions — use `engage-exocortex`.
- **Trade execution or order placement** — never executes trades, places orders, or interacts with brokerage APIs.
- **Substitute for licensed clinical, legal, or regulatory judgment.** Finance/legal/medical outputs MUST carry the standard disclaimer.
## Options
| Flag | Description | Default |
|------|-------------|---------|
| `--no-proposal` | Skip writing the debate proposal document | *(writes proposal)* |
| `--no-web` | Suppress web research (advocates must record `webResearch.performed = false` with `attemptedCalls[]` evidence) | *(web required)* |
| `--model <model>` | Override subagent model (`opus`, `sonnet`, `haiku`) | `opus` |
| `--fetch-budget N` | Fetch budget per advocate (baseline always counts 1 separately) | 4 |
| `--round-two` | Force a second round (re-dispatch for-advocate against the against-advocate's strongest citation) regardless of judge confidence | *(off — judge triggers)* |
`--no-web` is a **scoped opt-out** for sandboxed environments; degraded runs MUST record `webResearch.performed=false` plus at least one `attemptedCalls[]` entry — bare unavailability claims fail validation identically to `/engage-prism` contract.
`--round-two` forces a second round the judge would not have demanded — use when the user wants maximum adversarial pressure.
## Core Workflow
```
PRIMARY AGENT
     │
     ├── 0. Mandatory web-research scoping — entity anchors, source classes, recency, fetch budget
     ├── 1. Claim extraction — name the claim; redirect to /engage-prism if no direction
     ├── 2. Baseline pass — one-paragraph initial read with one grounding fetch
     ├── 3. Dispatch two adversaries IN PARALLEL:
     │      ├── For-advocate   ──► strongest case FOR the claim + citations[]
     │      └── Against-advocate ──► strongest case AGAINST + citations[] (zero URL overlap)
     ├── 4. Judge pass — reads baseline + both briefs + both citation sets; names weakening evidence; endorse/reject/revise
     ├── 5. Round-two gate (optional) — judge low confidence OR against produced new evidence uncountered → re-dispatch for-advocate
     └── 6. [Default] Write debate proposal to Proposal/DEBATE-{claim-slug}.md
```
**Opt-out:** `--no-proposal` to skip document generation. `--no-web` to suppress web research (record degradation per report).
## Step 0 — Web-Research Scoping (Mandatory)
Same contract as `/engage-prism`. Research plan: **1. Entity anchors** (names, tickers, geographies, industries, products, events); **2. Source classes** (*news, earnings transcripts, regulatory filings, analyst reports, trade press, industry bodies, official statistics, company pages*); **3. Recency window**; **4. Freshness class** (enum `geopolitical | market | general`; thresholds `geopolitical`/`market` = 24h, `general` = 72h); **5. Authority preferences** (primary > aggregators > opinion); **6. Fetch budget** (default 4 per advocate; `--fetch-budget N`). Record in proposal's Context section. Both advocates and judge inherit plan.
### Citation discipline (parity with /engage-prism)
Every non-derived claim must cite per `resources/citation-schema.json`. Reports without schema-conformant citations flagged in judge pass and deprioritized.
### Degradation path + attempted-call evidence
Identical to `/engage-prism`. Setting `webResearch.performed=false` requires `webResearch.attemptedCalls[]` with ≥1 documented attempt (method, `targetUrl` or `query`, `errorMessage`, optional `httpStatus`, `attemptedAt` ISO-8601). Bare unavailability = contract violation. Primary agent rejects zero-attempt, re-dispatches once; if retry also returns zero, accepts but tags `degradationEvidence="unverified"`.
### Return-side validation — reject zero-fetch advocate returns (#221)
Advocate returns are untrusted input; validation runs **before** the citation-overlap gate (Step 3) and judge pass (Step 4). Failure modes are behavioral (advocate had tools, chose not to use them), not environmental; MUST NOT be silently demoted to `degradationEvidence="unverified"`.
**Reject pattern A — `performed=false` with non-conforming `attemptedCalls[]`.** Non-conforming = missing any of: `method`, `targetUrl` (or `query`), `errorMessage`, `attemptedAt` (ISO-8601). Bare narrative ("the sandbox blocked all fetches") does not satisfy schema. Primary agent rejects, re-dispatches **once** with directive below.
**Reject pattern B — `performed=true` with `fetchCount=0`.** Internally inconsistent: advocate claiming research performed must report at least one fetch. Reject and re-dispatch **once** with the same directive.
**Re-dispatch directive — must include named primary-source URL.** Primary agent picks one URL from research plan's entity anchors (e.g., `https://www.eia.gov/petroleum/weekly/`, `https://www.sec.gov/edgar/searchedgar/companysearch`) and sends re-dispatch brief: *"You have WebFetch and WebSearch. Fetch {named primary-source URL} and cite the actual published date. A second zero-fetch return is a contract breach, not a degradation."* Directive MUST name a specific URL from the plan; generic "try harder" does not satisfy contract.
**Second zero-fetch — tag `evidence-fabrication-risk` (behavioral), NOT `degradationEvidence="unverified"` (environmental).** Re-dispatched advocate returning second zero-fetch (either pattern) → tag `evidence-fabrication-risk`. Behavioral marker distinct from `degradationEvidence="unverified"` (genuine environmental degradation). MUST NOT be conflated: `evidence-fabrication-risk` = advocate had tools and chose not to use them; `degradationEvidence="unverified"` = advocate attempted but could not verify. Judge receives per-advocate `fabricationRisk` flag and must acknowledge in `confidenceRationale` (Step 4).
**Ordering.** Fabrication-risk check runs **before** the citation-overlap gate: URL overlap on fabricated citations is meaningless — two subagents inventing URLs produce non-overlapping but equally unverified sets, falsely passing the diverse-source test. Proceed to Step 3 only once both advocates pass fabrication-risk validation.
### Recency gate
Identical to `/engage-prism`. For every cited anchor source, compute `ageHours = now − max(publishedAt, fetchedAt)`. If `max(ageHours) > threshold`, reject report and re-dispatch once with directive "fetch a source dated within the last {threshold}h before re-submitting". Graceful degradation emits explicit warning; never silent.
## Step 1 — Claim Extraction
Primary agent extracts **claim under debate** in one sentence. Claim must be: **Directional** (takes a position, e.g. "expanding into Japan B2B SaaS in 2H 2026 is a good bet"); **Named** (entities, geographies, time horizons concrete); **Falsifiable** (state of world exists where claim is wrong).
### Redirect when no direction is stated
If user's question contains no stated direction, redirect:
> "Your question is open-ended ('what are the angles on X'). That's a good fit for `/engage-prism`, which fans out into parallel analytical paths. `/debate-prism` wants a claim to pressure-test. Would you like to (a) state a claim and I'll debate it, or (b) run this through `/engage-prism` instead?"
Do not fabricate a claim and proceed silently — that yields a degenerate debate.
## Step 2 — Baseline Pass
Primary agent produces one-paragraph initial read with **exactly one grounding fetch**:
- States primary agent's prior on the claim (lean toward, lean against, neutral).
- Cites one authoritative source (conforming to `citation-schema.json`).
- Records baseline for the judge.
Not a debate — reference point judge uses to detect whether adversaries moved the needle.
## Step 3 — Dispatch Adversaries (Parallel)
Spawn both advocates **in parallel** via the Agent tool. Each receives a brief filled from `resources/for-brief-template.json` or `resources/against-brief-template.json`.
### For-advocate brief
- **Assigned task:** Build **strongest case for the claim** with schema-conformant citations.
- **Fetch budget:** N (default 4; overridable via `--fetch-budget N`).
- **Citation requirement:** Every non-derived claim cites per `citation-schema.json`. Prefer primary/high-authority sources (filings, regulators, official statistics) over aggregators.
- **Output:** JSON conforming to `resources/for-brief-schema.json` with `claim`, `corePosition`, `citations[]`, `analysis[]`, `webResearch`, `recommendation`.
### Against-advocate brief
- **Assigned task:** Build **strongest case against the claim** with schema-conformant citations drawn from **sources the for-advocate did not use**.
- **Citation diversity:** Against-advocate's `citations[]` MUST share zero URLs with for-advocate's `citations[]`. **Mechanical** (enforced by primary agent after both return), not a label.
- **Fetch budget:** N (same as for-advocate).
- **Citation requirement:** Same schema + authority preference; bear sources (short-seller reports, counter-case filings, contrary analyst coverage) preferred — surface evidence for-advocate will not.
- **Output:** JSON conforming to `resources/against-brief-schema.json` — same fields as for-brief plus `targetedCitationIndex` (the for-advocate citation this against-case most directly rebuts, if any).
### Citation-overlap enforcement
After both reports return, primary agent computes `overlap = intersect(for.citations.urls, against.citations.urls)`:
- **`overlap.length === 0`:** proceed to Step 4.
- **`overlap.length > 0`, first detection:** re-dispatch against-advocate once with directive "Fetch counter-evidence from distinct sources (different domains) — the following URLs overlap with the for-case and must be replaced: {list}. Re-submit only after the overlap is resolved."
- **`overlap.length > 0`, second detection:** accept but tag `citationOverlap="unresolved"` in JSON envelope and surface explicitly in judge pass and final proposal.
Contract parity with `/engage-prism`'s recency-gate + attempted-call one-retry pattern.
### Recency gate and attempted-call evidence
Both advocates inherit `freshnessClass`. Recency gate + attempted-call evidence requirements identical to `/engage-prism` (see Step 0).
## Step 4 — Judge Pass
Judge is third subagent. Reads:
- Baseline from Step 2.
- For-brief + citations.
- Against-brief + citations.
- Any citation-overlap tags from Step 3.
Judge MUST produce output conforming to `resources/judge-output-schema.json` with required fields:
1. **`weakeningEvidence`** — citation index in against-advocate's `citations[]` that most weakened for-advocate's case, OR literal string `"none"` with non-empty `justification`. Missing field fails schema validation and blocks proposal generation.
2. **`verdict`** — one of `"endorse"`, `"reject"`, `"revise"`.
3. **`revisedClaim`** (required when `verdict === "revise"`) — revised claim statement.
4. **`flipConditions`** — when `verdict === "revise"`, names what evidence would need to be true to reject revised claim. When `verdict === "endorse"`/`"reject"`, names what would flip verdict the other way.
5. **`confidence`** — enum `"high" | "medium" | "low"`.
6. **`confidenceRationale`** — one-line rationale for the confidence level.
7. **`degradationFlags`** — array collecting any `citationOverlap="unresolved"`, `degradationEvidence="unverified"`, `evidence-fabrication-risk`, or recency-gate degradation warnings from Step 3.
8. **`perAdvocateFabricationRisk`** (#221) — object with `for: boolean` and `against: boolean` keys, propagated from Step 0 Return-side validation. Judge brief includes this field as first-class input; judge MUST reference in `confidenceRationale` whenever either flag is true (fabrication-present case), e.g. "Confidence reduced to medium because the for-advocate's evidence base was tagged evidence-fabrication-risk." When both flags false (fabrication-absent), judge may omit explicit reference — but if either flag true and judge does not reference it, proposal blocked and judge re-dispatched once.
Judge does NOT re-run web research; it weighs the evidence advocates produced.
### Weakening-evidence URL live-verification (#221)
Before writing proposal (Step 6), primary agent live-verifies citation URL named by `weakeningEvidence.citationIndex` (when not literal `"none"`). Use WebFetch (HEAD or GET) against cited URL and confirm:
1. **Reachability** — URL resolves (any 2xx or 3xx response). 4xx/5xx or DNS failure = dead URL.
2. **Publish-date sanity** — page's actual publish date matches `publishedAt` (or, when absent, falls within plausible window of `fetchedAt`).
Dead URL or blatant publish-date mismatch on load-bearing weakening-evidence citation treated as fabrication signal. Primary agent re-dispatches **judge** once with directive: *"The citation at against-advocate index {N} did not live-verify ({reason: dead URL | publish-date mismatch}). Pick a different citation from the against-advocate's `citations[]` that does live-verify, OR set `weakeningEvidence` to `'none'` with a justification noting the citation issue."* On second failure (second judge pass also names non-verifiable URL), proposal blocked with explicit error rather than written with unverified weakening citation.
## Step 5 — Round-Two Gate
After the judge returns, decide whether to re-dispatch:
**Automatic trigger — re-dispatch when EITHER:**
- `judgeOutput.confidence === "low"`, OR
- against-advocate produced **strictly new evidence** that for-advocate did not address (detected heuristically: against-citations with `sourceClass` in `{regulatory-filing, official-statistics, earnings-transcript}` whose excerpts contradict specific for-advocate claims and were not engaged in for-brief's `analysis[]`).
**Flag trigger — `--round-two` forces** a second round regardless of judge confidence.
**Round-two dispatch.** Re-dispatch the for-advocate **only** (not the against-advocate) with directive:
> "Address the against-advocate's strongest citation (`targetedCitationIndex={N}` from the against-brief, excerpt: `{excerpt}`). Either refute it with new primary-source evidence OR revise the claim to accommodate it. Re-submit using the same schema."
Judge re-runs on round-two for-brief + original against-brief. Max one round-two — skill does not loop.
## Step 6 — Generate Debate Proposal (default)
**Skip if `--no-proposal` was specified.**
Write persistent markdown to `Proposal/DEBATE-{claim-slug}.md` where `{claim-slug}` is lowercase-hyphenated summary (e.g., `expand-into-japan-b2b-saas-2h-2026`).
Read `resources/proposal-template.json` for section structure:
1. **Metadata** — Date, skill, claim, fetch budget, round count (1 or 2), webResearchPerformed, verdict, confidence, any degradationFlags.
2. **Claim** — Full claim statement from Step 1.
3. **Research Plan** — Entity anchors, source classes, recency window, freshness class, authority preference, fetch budget.
4. **Baseline** — Primary agent's one-paragraph initial read with citation.
5. **For-Brief** — Core position + full `citations[]` table + analysis summary.
6. **Against-Brief** — Core position + full `citations[]` table + analysis summary + `targetedCitationIndex` pointer.
7. **Judge Output** — `weakeningEvidence`, `verdict`, `revisedClaim` (if any), `flipConditions`, `confidence`, `confidenceRationale`, `degradationFlags`.
8. **Round History** — If `--round-two` fired or was forced, include round-two for-brief and judge's second pass.
9. **Disclaimer** — When claim touches finance/legal/medical, stamp standard disclaimer at top of user-facing narrative.
## Disclaimer template
When final output concerns specific securities, options, positions, legal actions, or medical choices, primary agent MUST stamp this disclaimer (verbatim or with equivalent force) at top of user-facing narrative:
> **Disclaimer.** The following is informational only, sourced from live web research on {date}. It is **not licensed financial, legal, or medical advice**. Named securities, options, or positions are illustrative and sized as percentages of a risk budget, not dollar amounts. Options carry total-loss risk. You should consult a licensed professional (registered investment advisor, attorney, clinician) before acting.
Disclaimer replaces — it does not supplement — any language that would refuse to answer a finance/legal/medical question on licensed-advice grounds. Refusing to engage with a stated directional claim when user has acknowledged the informational-only framing is itself a contract violation.
Detection heuristic: any of `{finance, legal, medical, investment, securities, ticker, options, lawsuit, litigation, clinical, diagnosis, treatment, prescription}` appearing in claim text or entity-anchor list triggers disclaimer stamp.
## Error Handling
| Failure Mode | Expected Behavior |
|---|---|
| Node missing | Surface Pattern 4 diagnostic (preflight returns `{runtime: "none", ...}`); proceed without schema validation. Do **not** halt — workflow runs end-to-end on fallback (only loss is schema-validation gate; see Known fallback limitations). |
| Node present but `ajv` missing | Pattern 4 diagnostic; operator chooses whether to install `ajv` or proceed without schema validation. |
| Node version < 18 | Treat as Node-missing or surface clearer "Node.js 18+ required for schema validation" diagnostic + install link (https://nodejs.org/). |
| User's question has no stated direction | Redirect to `/engage-prism`; do not fabricate a claim |
| For/against citation URLs overlap | Re-dispatch against-advocate once; second failure tags `citationOverlap="unresolved"` |
| Judge output missing `weakeningEvidence` | Schema validation fails; re-dispatch judge once; second failure blocks proposal with explicit error |
| Subagent returns non-conforming JSON | Flag schema violations; re-dispatch once; accept with degradation tag on second failure |
| WebFetch / WebSearch unavailable | Record `webResearch.performed = false` with `attemptedCalls[]`; surface degradation in judge output and proposal |
| Round-two fails to produce new evidence | Accept round-two for-brief as-is; judge's second pass records "round-two did not materially shift the balance" |
## Important Constraints
- **Claim must come from the user.** Never fabricate directional claim from open-ended question.
- **Citation URLs mechanically non-overlapping.** Zero URL overlap between for- and against-advocate citations is the diversity enforcement — not paradigm labels.
- **Primary agent validates.** Do not trust subagent JSON without checking against colocated schema.
- **Informational, not licensed advice.** Finance/legal/medical outputs stamp disclaimer.
- **No trade execution.** Never places orders or interacts with brokerage APIs.
- **No docs/ references at runtime.** `docs/` is human-readable reference; skill never reads from `docs/` at runtime.
- **No `sharedScripts:` frontmatter.** Does not consume `match-signals.js` or any shared script.
## Relationship to `/engage-prism` and `/spar-exocortex`
| Dimension | `/engage-prism` | `/debate-prism` | `/spar-exocortex` |
|---|---|---|---|
| Problem domain | Business / market / finance | Business / market / finance | Code / algorithms / architecture |
| Pattern | Cooperative parallel exploration | Adversarial for/against/judge | Propose-attack-measure loop |
| Question shape | Open-ended exploration | Directional claim | Directional algorithm/design |
| Diversity enforcement | `primarySourceClass` + (optional) taxonomy | Zero URL overlap | `targetComplexity` or `invariantChoice` |
| Execution | N/A (analytical) | N/A (analytical) | Required for algorithmic problems |
Choose `/debate-prism` when user has stated a claim and wants pressure applied. Choose `/engage-prism` for open-ended exploration. Choose `/spar-exocortex` for algorithm/code design with stated baselines.
## Reference Files
All in `resources/`; each JSON data file has a colocated schema.
| File | Purpose |
|---|---|
| `citation-schema.json` | Required shape of every citation entry (contract parity with `/engage-prism`) |
| `for-brief-template.json` | Template slot-filled into for-advocate brief |
| `for-brief-schema.json` | Validator for for-advocate reports |
| `against-brief-template.json` | Template slot-filled into against-advocate brief |
| `against-brief-schema.json` | Validator for against-advocate reports; enforces `targetedCitationIndex` and zero-URL-overlap contract |
| `judge-output-schema.json` | Validator for judge outputs; enforces `weakeningEvidence`, `verdict`, `flipConditions`, `confidence` |
| `proposal-template.json` | Document structure template for Step 6 proposal generation |
| `proposal-template-schema.json` | Validator for proposal template |
