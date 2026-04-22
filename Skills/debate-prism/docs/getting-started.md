# Getting Started with debate-prism

`/debate-prism` is the **adversarial** sibling of `/engage-prism`. Where
`/engage-prism` fans out into parallel cooperative analytical paths,
`/debate-prism` runs a for-advocate and an against-advocate in parallel
with **mechanical citation diversity** (their cited URLs must not
overlap), then routes to a judge subagent who names the specific piece
of evidence that settled the call.

Use `/debate-prism` when the user has a **stated directional claim**:
"should we X", "is X a good idea", "is this company a buy". For
open-ended exploration ("what are the angles on X"), use
`/engage-prism` instead.

---

## Prerequisites

- **Node.js 18+** — preflight runs `node --version` and
  `node -e "require('ajv')"`.
- **WebFetch / WebSearch** — required by default. Both advocates perform
  live research with schema-conformant citations.

---

## A worked invocation at a glance

The user asks: *"Should we expand into Japan B2B SaaS in 2H 2026?"*

### Step 0 — Research plan
Entity anchors (Japan, B2B SaaS, METI, JETRO, incumbents), source
classes (primary-filing, practitioner-retrospective, analyst-report,
trade-press), recency window (12 months), freshness class (`general`),
fetch budget (4 per advocate).

### Step 1 — Claim extraction
Primary agent extracts the claim: *"Expanding into the Japan B2B SaaS
market in 2H 2026 is the right call given our current budget and
team."* If the user's question were open-ended, the skill would
redirect to `/engage-prism` rather than fabricate a claim.

### Step 2 — Baseline
Primary agent writes one paragraph with one grounding fetch —
establishing its prior on the claim for the judge to measure against.

### Step 3 — Parallel adversaries
- **For-advocate** (`primarySourceClass: primary-filing` preference):
  builds the strongest case FOR, citing METI/JETRO/incumbent annual
  reports.
- **Against-advocate** (`adversarial-bear-source` preference): builds
  the strongest case AGAINST with citations that **share zero URLs**
  with the for-advocate's citations. Primary agent enforces this
  mechanically after both reports return.

### Step 4 — Judge
Reads baseline + both briefs + both citation sets. Names the specific
piece of against-evidence that most weakened the for-case (or records
`"none"` with justification). Verdict: `endorse` / `reject` / `revise`.
Names flip conditions and confidence level.

### Step 5 — Round-two gate (optional)
If judge confidence is low OR the against-advocate produced strictly
new evidence the for-advocate did not address, primary agent
re-dispatches the for-advocate with a directive to address the
against's strongest citation. Max one round.

### Step 6 — Proposal
By default writes `Proposal/DEBATE-{claim-slug}.md` with the full
record. Finance/legal/medical claims stamp the standard disclaimer.

---

## See worked examples

- `examples/DEBATE-acme-stock-buy-current-prices.md` — finance debate
  (disclaimer stamped, round-two triggered).
- `examples/DEBATE-shut-consumer-focus-enterprise.md` — business
  strategy debate (single round, verdict: endorse with qualification).

---

## Opt-outs

| Flag | Effect |
|------|--------|
| `--no-proposal` | Skip writing the proposal |
| `--no-web` | Suppress web research; each advocate must record `webResearch.performed = false` with `attemptedCalls[]` evidence |
| `--model <model>` | Override subagent model |
| `--fetch-budget N` | Override fetch budget per advocate |
| `--round-two` | Force a second round regardless of judge confidence |

---

## Relationship to other engage-* skills

See `Skills/MAINTENANCE.md` → "Adversarial Sibling Skills — When to
Pick Which" for the full selection guide. Quick answer:

- **Open-ended, business/marketing/finance** → `/engage-prism`
- **Directional claim, business/marketing/finance** → `/debate-prism`
- **Open-ended, code/algorithm/architecture** → `/engage-exocortex`
- **Directional with baseline, code/algorithm** → `/spar-exocortex`
