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

### Step 1 — Keywords and confirmation

The agent extracts keywords: `market-sizing`, `EV charging`, `Germany`,
`competitive entry`, `public infrastructure`. It uses `AskUserQuestion` to
confirm the restated question, the keywords, and the research plan before
spending any compute on signal matching.

### Step 1b — Signal matching and selective loading

```bash
node scripts/match-signals.js "market-sizing" "EV charging" "Germany" "competitive entry" --paths 3
node scripts/load-entries.js paradigm market-sizing competitive-analysis
node scripts/load-entries.js structure driver-tree porter-five-forces
node scripts/load-entries.js strategy top-down-vs-bottom-up triangulation
```

Only the matched entries are loaded. Never read the full `paradigms.json` /
`structures.json` / `strategies.json` directly.

### Step 2 — Naming paths

With 3 paths, the primary agent might define:

1. **Bottom-up TAM via charger-level unit economics** (market-sizing +
   driver-tree + top-down-vs-bottom-up)
2. **Porter's Five Forces with substitution-risk weighting** (competitive-analysis
   + porter-five-forces + benchmark-comparison)
3. **Triangulated TAM from BNetzA statistics, analyst reports, and peer filings**
   (market-sizing + comparables-table + triangulation)

The naming convention and anti-overlap check are covered in the SKILL.md
workflow.

### Step 3 — Parallel subagents

Three subagents are spawned in parallel. Each receives a brief filled from
[`resources/brief-template.json`](../resources/brief-template.json) — see
[subagent-brief-guide.md](subagent-brief-guide.md). Each performs live web
research, produces a structured report per
[`resources/report-template.json`](../resources/report-template.json), and
returns. See [report-format.md](report-format.md).

### Step 4 — Synthesis

The primary agent validates each report's claims against its citations,
scores the angles, checks for hybridization, and produces a final
recommendation. The validation phase is what distinguishes prism from
engage-exocortex — see [synthesis-guide.md](synthesis-guide.md).

### Step 5 — Proposal document

By default a persistent markdown proposal is written to
`Proposal/PRISM-enter-germany-ev-charging.md`. The structure is described in
[proposal-format-guide.md](proposal-format-guide.md).

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
