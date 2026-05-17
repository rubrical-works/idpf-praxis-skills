---
name: spar-exocortex
description: Adversarial propose-attack-measure analyst for algorithmic and code-design problems. Baseline proposal → attacker subagent produces concrete breaking input → challenger proposes a different approach that survives the attack → both candidates execute against a shared test harness → judge subagent decides or demands round two. Execution-backed validation by design.
type: invokable
version: "1.0.0"
frameworkCompatibility: ">=0.80.0"
lastUpdated: "2026-05-16"
license: Complete terms in LICENSE.txt
category: analysis
relevantTechStack: [algorithms, data-structures, execution-validation, adversarial-analysis, json-schema]
argument-hint: "[--parallel-attack] [--max-rounds N] [--no-proposal] [--proposal] [--execution-timeout-ms N]"
copyright: "Rubrical Works (c) 2026"
---

# Spar Exocortex — Adversarial Algorithm / Code-Design Analyst

For algorithmic and code-design questions via **adversarial propose-attack-measure loop**: baseline proposal, attacker producing concrete failing input, challenger proposing different approach designed to survive attack, execution harness running both candidates against attacker's input + shared edges, judge deciding or demanding round two.

Sibling to `/debate-prism`. Picks up where `/engage-exocortex` (cooperative refraction) ends: spar applies pressure to a single cleanest-looking answer; exocortex explores N approaches in parallel.

**Execution-backed validation is intrinsic** — cannot produce output without running candidate implementations. No reasoning-only fallback (non-executing adversarial loop is a different skill — `/engage-exocortex`).

## Runtime Requirements

Applies **No-Runtime Fallback Pattern** at orchestration layer + **Execution-backed special case** at execution layer. Two preflight concerns, independent.

### Layer 1 — Orchestration preflight (Pattern 4)

Orchestration (schema validation of attacker/challenger/judge outputs; results aggregation; round-two state-keeping) is Node-backed by default. When Node absent, Claude orchestrates inline against same JSON schemas.

| Path | Requires | What it does |
|---|---|---|
| **Primary** | Node.js 18+, `ajv` | Invokes `scripts/validate-output.js` against bundled JSON schemas (`baseline-schema.json`, `attacker-output-schema.json`, `challenger-report-schema.json`, `execution-result-schema.json`, `judge-output-schema.json`). Deterministic, sub-second. |
| **Fallback** | None | Claude reads each schema from `Skills/spar-exocortex/resources/`, applies required-field + type rules procedurally. Higher token cost; same schema source of truth. |

Both paths produce same downstream JSON envelopes. Path selection at preflight.

### Layer 2 — Execution-target adapter preflight (intrinsic, scope-statement variant)

Execution harness runs candidates against shared test cases + attacker's failing input + subagent-named edges. Requires target-language adapter. Initial release ships **JavaScript/TypeScript** (Node 18+) **and Python** (`python3` 3.x). **One adapter suffices** — JS/TS served by Node alone; Python served by Python alone.

No adapter for target language is a **scope boundary**, not fallback gap. No reasoning-only fallback for execution-backed adversarial validation. Preflight halts with scope-statement diagnostic.

### Preflight (before any workflow step)

```bash
node --version
python3 --version
```

1. **Node 18+ + `ajv` importable** → orchestration primary path. Use `scripts/validate-output.js`.
2. **Node 18+ but `ajv` missing** → HALT with Pattern 4: install `ajv` (`npm install ajv`) for primary path, or invoke no-Node orchestration fallback (validates schemas inline by prose). Or install Node.js 18+ from https://nodejs.org/.
3. **Node unavailable** → Pattern 4: skill orchestrates adversarial propose-attack-measure loop; `scripts/validate-output.js` is primary. Without Node, Claude validates inline by reading schemas from `resources/` and prose-validating required fields and types. Cost: ~10–30× more tokens. Or install Node.js 18+ from https://nodejs.org/. Then execute Orchestration Fallback Procedure.

**Execution-target adapter enumeration (always runs, regardless of orchestration layer state):**

4. **Enumerate adapters** based on preflight commands:
   - **Node 18+ present** → `js`, `ts` problem languages supported (Node adapter).
   - **Python 3.x present** → `python` problem language supported (Python adapter).
   - **Neither present** → halt with scope-statement diagnostic.
5. **Match problem language.** Parse user's problem to detect target language (from `--language` flag, problem prose, or default to `js` when ambiguous). If detected language has adapter, proceed. If not, halt with scope-statement diagnostic.

**Scope-statement diagnostic (no adapter):** *"spar-exocortex requires an execution-target adapter for the problem's target language. Ships JavaScript/TypeScript (Node 18+) and Python (3.x). Your problem targets {language}, not in supported set. Adversarial validation is execution-backed — no reasoning-only fallback (use `/engage-exocortex`). Options: (1) Reframe in supported language. (2) Install one of the supported runtimes ({needed_install}). (3) Use `/engage-exocortex` for reasoning-only cooperative exploration."*

Preflight returns `{ orchestration: { runtime: "node" | "none", reason: string }, execution: { adapters: string[], supportedLanguages: string[], problemLanguage: string | null, supported: boolean } }`.

### Orchestration Fallback Procedure

When Node unavailable, perform schema validation inline. Covers schema validation only; **execution harness layer still required and uses whichever adapter is available regardless of orchestration layer.**

#### Inline replacement for `scripts/validate-output.js`

1. **Read the relevant schema from disk.** Each subagent dispatch has corresponding schema file under `Skills/spar-exocortex/resources/`:
   - `baseline-schema.json` — baseline proposal envelope.
   - `attacker-output-schema.json` — attacker's failing-input envelope.
   - `challenger-report-schema.json` — challenger's design + implementation envelope.
   - `execution-result-schema.json` — per-case execution result envelope.
   - `judge-output-schema.json` — judge's decision envelope.
2. **Validate each required field is present.** Top-level `required` array names them; check each appears with non-empty value.
3. **Validate each field's `type` matches** (string / number / boolean / array / object). For arrays, check items conform to items schema.
4. **Validate enum constraints** if schema declares them (e.g., `inputType` must be one of `correctness | complexity-blow-up | operational-failure`).
5. **Emit validation feedback** in same shape script would produce: `{ ok: boolean, errors: [{ path: string, message: string }] }`.
6. **Re-dispatch on failure** (one retry per subagent, matching script's behavior). Second failure marks output `validationFailed` and judge sees partial data.

### Known fallback limitations (Layer 1 only)

- **No $ref resolution.** Fallback validates top-level shape; cross-schema `$ref` references not walked. Schemas in `resources/` are written flat (no $ref) for this reason.
- **No additional-properties enforcement.** Extra fields tolerated on fallback; script's `additionalProperties: false` is structural-only on inline path.
- **Token cost.** Reading schema into context per dispatch adds ~500–1500 tokens per invocation vs. script's sub-second deterministic check.

Execution-harness layer has **no fallback** — see scope-statement diagnostic. Acceptable for orchestration fallback's purpose.

## When to use

For **algorithmic or code-design questions where there is a single cleanest-looking answer and you want pressure applied to it**. Value-add is execution-backed adversarial validation — finding failing input plausible-looking baseline missed.

| Signal | Use spar-exocortex | Use a sibling |
|---|---|---|
| Single concrete approach in mind, want it stress-tested | ✓ | — |
| "Is this LRU cache implementation correct under concurrent reads?" | ✓ | — |
| "Will this hash function collide on adversarial inputs?" | ✓ | — |
| Open-ended exploration of multiple approaches | — | `/engage-exocortex` (cooperative refraction, N paths) |
| Business/market/strategy question | — | `/engage-prism` (cooperative) or `/debate-prism` (adversarial) |
| Product/UX design exploration | — | `/engage-forge` |

**Do NOT use for:**
- Reasoning-only validation — execution harness is load-bearing; if not viable (no Node, no Python), use `/engage-exocortex` and document limitation.
- Non-algorithmic/non-code-design questions — adversarial validation needs executable artifact to stress.
- Cross-language interop problems where execution requires multi-language coordination — out of scope (single-adapter-per-invocation).

## Options

| Flag | Description | Default |
|---|---|---|
| `--parallel-attack` | Dispatch attacker + challenger together (challenger doesn't see attack). Faster, weaker pressure. | *(sequential: challenger sees attack)* |
| `--max-rounds N` | Cap rounds judge can demand. | `2` |
| `--no-proposal` | Skip writing proposal. | *(default depends on domain: algorithmic off, architecture on)* |
| `--proposal` | Force proposal on (override algorithmic-default-off). | — |
| `--execution-timeout-ms N` | Per-case execution timeout. | `5000` |
| `--language <js|ts|python>` | Override detected problem target language. | *(detected from problem prose)* |

## Core Workflow

```
PRIMARY AGENT
     ├── 0. Preflight (two layers: orchestration + execution-target)
     ├── 1. Parse problem + draft baseline (algo sketch + minimal implementation)
     ├── 2. Dispatch attacker → concrete failing input or named failure mode
     ├── 3. Dispatch challenger → different approach surviving the attack
     ├── 4. Execution harness → run both candidates against shared tests + attack + edges
     ├── 5. Judge → endorse baseline / endorse challenger / demand round two
     ├── 6. If round-two: re-dispatch attacker against winner; fresh challenger
     └── 7. Proposal (default on for architecture, off for algorithmic)
```

### Step 0 — Preflight

Run both layers documented under Runtime Requirements. If execution-target adapter preflight halts with scope-statement diagnostic, do not proceed. If orchestration preflight returns `runtime: "none"`, surface diagnostic, follow Orchestration Fallback Procedure inline through rest of workflow.

### Step 1 — Parse problem + draft baseline

Primary agent parses user's problem and drafts **single** baseline solution:
1. **Algorithm sketch** — concise prose (data structures, key operations, complexity claim, invariants).
2. **Minimal runnable implementation** in user's target language. Self-contained and executable by harness against standard test set.
3. **Recorded fields:** `targetComplexity` (e.g., `O(n log n)`), `invariantChoice` (what's precomputed vs. computed online), `targetLanguage`, `implementation` (text).

Output conforms to `baseline-schema.json`.

### Step 2 — Dispatch attacker (first subagent)

Attacker's job: produce **concrete failing input or scenario** breaking baseline. Output schema (`attacker-output-schema.json`):

| Field | Description |
|---|---|
| `inputType` | One of: `correctness` \| `complexity-blow-up` \| `operational-failure` |
| `failingInput` | Executable input data, OR concrete scenario when failure mode is operational (e.g., "concurrent read during eviction"). Verbal-only criticism rejected and triggers one re-dispatch. |
| `expectedVsActual` | What baseline produces vs. what's correct. |
| `argumentWhyBreaks` | Brief argument tying input to failure mode. |

**Enforcement:** if `failingInput` empty or matches script's verbal-only heuristic (no data, no concrete scenario), validator rejects and attacker re-dispatched **once**. Second failure marks path `attackerValidationFailed` and judge sees partial state.

### Step 3 — Dispatch challenger (second subagent)

Challenger's job: propose **different approach** surviving attacker's input. Output schema (`challenger-report-schema.json`):

| Field | Description |
|---|---|
| `targetComplexity` OR `invariantChoice` | Must differ from baseline's value (schema-level anti-overlap; duplicate fails validation). |
| `implementation` | Self-contained executable text in target language. |
| `argumentWhyResists` | Brief argument tying new design to attacker's input. |
| `addressesAttack` | Boolean — true iff challenger explicitly addressed attacker's named failure mode. In **sequential** mode, MUST be true; in **parallel** mode, MAY be false. |

**Modes:**
- **Sequential (default):** challenger receives attacker's output and must explicitly address it. `addressesAttack` enforced true.
- **Parallel (`--parallel-attack`):** attacker and challenger dispatched simultaneously; challenger must produce meaningfully-different approach but not asked to address attack directly.

### Step 4 — Execution harness

Primary agent (or dedicated executor subagent) runs **both** baseline and challenger implementations against three test sets:
1. **Shared standard tests** for problem domain (canonical edges per problem type).
2. **The attacker's `failingInput`.**
3. **Subagent-named edges** (any edges either subagent named).

Harness uses adapter matching problem's target language (selected at preflight). Per-case output schema (`execution-result-schema.json`):

```json
{
  "candidate": "baseline" | "challenger",
  "case": "string identifier",
  "outcome": "pass" | "fail" | "timeout" | "error",
  "wallClockMs": "number — optional (only for complexity-stress cases)",
  "errorMessage": "string — optional"
}
```

**Limits:**
- Per-case timeout: `--execution-timeout-ms` (default 5000ms).
- Per-invocation memory cap: best-effort, adapter-dependent.
- Subprocess isolation: each candidate runs in fresh subprocess; no shared state across cases.

### Step 5 — Judge pass (third subagent)

Judge reads: baseline (with implementation), attacker output, challenger report (with implementation), execution results table. Output schema (`judge-output-schema.json`):

| Field | Description |
|---|---|
| `decision` | One of: `endorse-baseline` \| `endorse-challenger` \| `demand-round-two` |
| `decisiveResult` | Specific execution result settling decision (e.g., "challenger passed attacker-input where baseline timed out"). If reasoning-decisive, set to literal `"no execution decisive — decided on reasoning"` and fill `reasoningJustification`. |
| `reasoningJustification` | Required iff `decisiveResult == "no execution decisive — decided on reasoning"`. |
| `operationalGraft` | Required iff problem is ops-critical (see Step 5a). Records answer to "winner-on-architecture-vs-loser-on-{extensibility,simplicity,transparency,cost}" question with concrete evidence. |
| `roundTwoRationale` | Required iff `decision == "demand-round-two"`. Explains what needs stronger pressure. |

#### Step 5a — Operational-graft hybridization (ops-critical problems only)

When domain detection flags problem as **ops-critical** (production system, user-facing reliability, distributed coordination, data integrity), judge MUST apply operational-graft question (reused with attribution from `/engage-exocortex`'s synthesis pattern):

> *"The winner wins on architecture. Does the loser win on extensibility, simplicity, transparency, or cost? If yes, name one concrete graft from loser → winner."*

Catches failure mode where cleanest-looking solution is architecturally optimal but operationally fragile. Graft answer goes into `operationalGraft.{wins, grafts}`; explicit `none` answer (with rationale) acceptable.

### Step 6 — Round-two gate

Trigger: judge sets `decision: "demand-round-two"` AND current round number < `--max-rounds`.

Round-two:
1. Current winner (baseline or challenger from round one) becomes new baseline.
2. Primary agent re-dispatches **fresh attacker** against new baseline. Attacker briefs include round-one execution-result history to avoid duplicating prior attack.
3. Primary agent re-dispatches **fresh challenger** with stronger divergence requirements (new baseline's `targetComplexity` + `invariantChoice` become forbidden values for challenger).
4. Execution harness re-runs against new attacker's input + accumulated subagent-named edges from both rounds.
5. Judge pass produces final decision; no further rounds permitted.

If `--max-rounds` hit, current round's judge MUST output `decision: "endorse-baseline"` or `"endorse-challenger"` — no more round-two requests.

### Step 7 — Proposal

**Default routing by problem domain:**
- **Algorithmic problems:** proposal off (`--no-proposal` default). User opts in via `--proposal`.
- **Architecture problems:** proposal on. User opts out via `--no-proposal`.

When proposal on, write `Proposal/SPAR-{problem-slug}.md` with:
- Baseline + implementation.
- Attacker output (all rounds).
- Challenger output + implementation (all rounds).
- Execution results table.
- Judge output (final round).
- Round history if round-two fired.
- Operational-graft answer if ops-critical.

Proposal template in `resources/proposal-template.json`; schema in `resources/proposal-template-schema.json`.

## Error Handling

| Failure Mode | Expected Behavior |
|---|---|
| Node missing (orchestration layer) | Surface Pattern 4; switch to Orchestration Fallback (schema validation inline). Do **not** halt. |
| Node present but `ajv` missing | HALT with Pattern 4: install `ajv` for orchestration primary, or invoke fallback. |
| Execution-target adapter not available for problem language | HALT with scope-statement diagnostic. No reasoning-only fallback. |
| Attacker output fails schema validation | One re-dispatch; second failure marks `attackerValidationFailed` and judge sees partial state. |
| Challenger output fails schema validation (e.g., same `targetComplexity` as baseline) | One re-dispatch; second failure marks `challengerValidationFailed` and judge sees partial state. |
| Execution times out (per-case) | Record outcome `timeout` and continue. Judge sees timeout in results table. |
| Execution errors (runtime exception in candidate code) | Record outcome `error` with `errorMessage`; continue. |
| Round-two demanded after `--max-rounds` hit | Judge prompt explicitly forbids `demand-round-two` in last round; schema validation rejects. |
| Proposal write fails | Log warning; conversation output still valid (proposal is artifact, not gate). |
