# Getting Started with engage-prism

`engage-prism` is a parallel analyst skill for **non-code** questions — business
strategy, marketing, and finance. It refracts one question into several
independent analytical spectra ("paths"), grounds each in live web research,
and synthesizes the strongest answer from structured subagent reports.

If your question is about code, algorithms, or IT architecture, use
[`engage-exocortex`](../../engage-exocortex/SKILL.md) instead.

---

## Prerequisites

- **Node.js 18+** — the skill shells out to `scripts/match-signals.js` and
  `scripts/load-entries.js` during every run. If `node` is not on your `PATH`,
  signal matching and selective loading will both fail.
- **WebFetch / WebSearch** — required by default. Every path makes live
  fetches and records schema-conformant citations.
- **Optional: `ajv`** — used to validate JSON inputs against colocated
  `*-input-schema.json` files. Runs fine without it.

If Node is missing, ask Claude to run the `install-node` skill — it provides a
guided, safe install path.

---

## A worked first invocation

Imagine you ask:

> "Should we enter the Germany public EV-charging market as a new operator?"

Here is what the skill does, step by step.

### Step 0 — Research plan

Before anything else, the primary agent builds a research plan:

- **Entity anchors:** Germany, EV charging, CCS / Type 2 connectors, known
  operators (EnBW, Ionity, Allego), BNetzA regulator.
- **Source classes:** official statistics (BNetzA, KBA), trade press, analyst
  reports, company filings, industry bodies (BDEW).
- **Recency window:** last 12 months.
- **Authority preference:** primary > aggregator > opinion.
- **Fetch budget:** 5 per path.

See [research-plan-guide.md](research-plan-guide.md) for how to scope this
well.

### Step 1 — Keywords and (opt-in) confirmation

The agent extracts keywords: `market-sizing`, `EV charging`, `Germany`,
`competitive entry`, `public infrastructure`.

**By default it proceeds directly to path selection**, restating the
interpreted question and keywords inline in its narrative so you can
redirect. Pass `--confirm-keywords` to re-enable the `AskUserQuestion` gate
for team or advisory contexts where a wrong-signal dispatch is expensive.

### Step 1b / 2 — Path selection (default vs. structured routing)

**Default routing (no flag):** the primary agent names the N paths itself —
one sentence each — grounded in Step 0's entity anchors and source classes.
The paradigm / structure / strategy catalogs become an optional palette; the
agent may open a specific entry when it would improve the brief, but will
not load the full catalogs or run the matcher.

**Structured routing (`--structured-routing`):** restores the original
match-signals flow for users who want the catalog-driven enumeration:

```bash
node scripts/match-signals.js "market-sizing" "EV charging" "Germany" "competitive entry" --paths 3
node scripts/load-entries.js paradigm market-sizing competitive-analysis
node scripts/load-entries.js structure driver-tree porter-five-forces
node scripts/load-entries.js strategy top-down-vs-bottom-up triangulation
```

Only the matched entries are loaded when this flag is set. Never read the
full `paradigms.json` / `structures.json` / `strategies.json` directly.

### Step 2 — Naming paths (with source-class diversity)

With 3 paths, the primary agent might define — each declaring a distinct
`primarySourceClass` so the evidential diversity is substantive, not just
labeled:

1. **Bottom-up TAM via charger-level unit economics** — `primarySourceClass:
   quantitative-dataset` (BNetzA panels, KBA registrations, charger census).
2. **Porter's Five Forces with substitution-risk weighting** —
   `primarySourceClass: practitioner-retrospective` (operator case studies,
   entry post-mortems, interviews).
3. **Triangulated TAM with primary-filing anchor** —
   `primarySourceClass: primary-filing` (regulator publications, company
   10-K/20-F/annual reports, official statistics).

Two paths sharing a `primarySourceClass` fail the anti-overlap check —
rename one before Step 3. The validator is in
`scripts/anti-overlap-validator.js`.

**Red-team path for directional questions.** The walkthrough's question
("*Should we* enter...") states a direction, so one of the three paths must
be a designated bear path — strongest counter-case, citations drawn from
sources the other paths did not use, `primarySourceClass:
adversarial-bear-source`. Synthesis explicitly reports whether the bear
survived validation. See SKILL.md Step 2 for the full trigger heuristic.

### Step 3 — Parallel subagents

Three subagents are spawned in parallel. Each receives a brief filled from
[`resources/brief-template.json`](../resources/brief-template.json) — see
[subagent-brief-guide.md](subagent-brief-guide.md). Each performs live web
research, produces a structured report per
[`resources/report-template.json`](../resources/report-template.json), and
returns. See [report-format.md](report-format.md).

### Step 4 — Synthesis (with disagreement audit)

The primary agent validates each report's claims against its citations,
scores the angles, runs the **disagreement audit** (which sets the
`convergent` flag — true when paths agreed across all validated dimensions,
false when material disagreements exist), optionally hybridizes, and
produces a final recommendation. The recommendation must surface both the
convergent flag and the bear-path outcome explicitly. Convergence may mean
consensus OR groupthink — the user judges. See
[synthesis-guide.md](synthesis-guide.md).

### Step 5 — Proposal document (slim) + audit JSON sibling

By default **two** artifacts are written:

- `Proposal/PRISM-enter-germany-ev-charging.md` — decision-focused main
  proposal, target under 8KB for typical runs.
- `Proposal/PRISM-enter-germany-ev-charging.audit.json` — raw subagent
  envelopes, full citation lists, per-dimension scoring matrix,
  `attemptedCalls[]` records, and signal-matching tables.

See [proposal-format-guide.md](proposal-format-guide.md).

---

## See a real example

The [`examples/`](../examples/) directory has five end-to-end proposals covering
each analytical domain. A good starting point for this walkthrough is:

- [`examples/PRISM-tam-ev-charging-germany.md`](../examples/PRISM-tam-ev-charging-germany.md)
  — a market-sizing run that mirrors the walkthrough above. Note that all
  URLs in the examples are illustrative `example.com` placeholders; real runs
  produce real URLs.

See [`examples/README.md`](../examples/README.md) for the full list and a
guided reading order.

---

## Opt-outs

| Flag | Effect |
|------|--------|
| `--paths N` | Use N paths (2–4); default 3 |
| `--no-proposal` | Skip writing the proposal document |
| `--no-web` | Suppress web research; each report must record `webResearch.performed = false` |
| `--model <model>` | Override subagent model (opus / sonnet / haiku) |
| `--confirm-keywords` | Opt-in: re-enable the Step 1 `AskUserQuestion` confirmation gate (default: off) |
| `--structured-routing` | Opt-in: route path selection through `match-signals.js` and the paradigm/structure/strategy catalog (default: off) |

`--no-web` is for sandboxed environments where WebFetch / WebSearch are
unavailable. Degraded runs are surfaced explicitly in the final
recommendation — never silently passed off as research-grounded.

---

## Where to go next

- **Paradigms, structures, strategies** — the reference catalogs:
  [analytical-paradigms.md](analytical-paradigms.md),
  [analytical-structures.md](analytical-structures.md),
  [analytical-strategies.md](analytical-strategies.md).
- **Citation discipline** — [citation-guide.md](citation-guide.md).
- **Subagent contract** — [subagent-brief-guide.md](subagent-brief-guide.md) and
  [report-format.md](report-format.md).
- **Synthesis** — [synthesis-guide.md](synthesis-guide.md).
- **Proposal output** — [proposal-format-guide.md](proposal-format-guide.md).
