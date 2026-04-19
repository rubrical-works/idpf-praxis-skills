# Analytical Structures

Prose companion to [`resources/structures.json`](../resources/structures.json).
A **structure** makes a paradigm concrete: it fixes what rows, columns,
nodes, or cells must be filled in before the answer can land. Ten structure
families are catalogued; each `engage-prism` path picks one as its skeleton.

All ten families are covered below. The `id` in each heading is what you
pass to `node scripts/load-entries.js structure <id>`.

---

## driver-tree — Driver Tree

A Driver Tree is a hierarchical decomposition of a top-level metric into
multiplicative or additive drivers, each of which can be estimated or
measured separately. Reach for it when the question is *why is X the value
it is* or *what moves X the most* — a single aggregate metric (revenue,
margin, LTV) that must be explained or forecast. Variants include revenue
trees (customers × ARPU, further split), DuPont decomposition (ROE = margin
× turnover × leverage), and unit-economics trees (price − variable cost,
rolled up). The core trap is letting branches overlap so a change
double-counts, or expanding the tree deeper on the convenient side rather
than the uncertain one.

## decision-matrix — Decision Matrix (Weighted Scoring)

A Decision Matrix lays out options as rows, weighted criteria as columns,
and derives a ranking from the weighted sum. Use it for a discrete choice
among three or more comparable options when multiple criteria must be
traded off transparently. Variants range from unweighted Pugh matrices
(+/0/− against a baseline) through weighted scorecards to the Analytic
Hierarchy Process (pairwise comparisons with consistency checks). The most
common pathology is back-fitting weights until the preferred option wins;
documenting weights before scoring is the discipline.

## porter-five-forces — Porter Five Forces Grid

A Porter Five Forces Grid scores five canonical categories — rivalry, new
entrants, substitutes, buyer power, supplier power — with evidence and a
direction of pressure, to assess structural industry attractiveness. Use
it for framing entry / exit / reposition decisions, explaining persistent
margin pressure, or comparing attractiveness across industries. Classic,
scored, and six-forces (with complementors) variants suit different
presentation and audience needs. Do not treat the grid as a checklist —
the forces must add up to a causal explanation of profitability, and
substitutes outside the traditional industry definition must be included.

## swot-matrix — SWOT Matrix

A SWOT Matrix arranges Strengths / Weaknesses (internal) against
Opportunities / Threats (external) to identify strategic moves that
leverage or mitigate each quadrant. Reach for it in positioning reviews,
in workshops where shared framing must be built quickly, and as a bridge
between internal capability audits and external environment scans.
Classic SWOT, TOWS (cross-quadrant action mapping), and weighted SWOT
(impact × probability) are the three main variants. SWOT is framing, not
measurement — if you need quantitative precision, switch to
[decision-matrix](#decision-matrix--decision-matrix-weighted-scoring) or
[cost-benefit-ledger](#cost-benefit-ledger--cost-benefit-ledger).

## cohort-table — Cohort Table

A Cohort Table puts cohorts (defined by an acquisition event) on the rows,
time-since-acquisition on the columns, and a behavior metric — retention,
revenue, or usage — in the cells. It is the standard structure for
diagnosing retention, estimating LTV, evaluating payback, and separating
signal from mix shift in a growing customer base. Retention cohorts,
revenue cohorts, and channel / campaign cohorts each expose a different
dimension. Be careful comparing young cohorts to mature ones before the
young ones have enough history, and do not pool across channels when a mix
shift could masquerade as a retention change.

## comparables-table — Comparables Table

A Comparables Table arranges peer entities on the rows and standardized
financial / operating metrics on the columns, producing a benchmark range
for the subject. Use it for relative valuation, as a sanity check on a DCF,
or for operational benchmarking against peers. Trading comparables (listed
peers, current multiples), transaction comparables (M&A deal multiples),
and operating benchmarks (gross margin, ARR growth, CAC payback) are the
three variants. Peer selection is the battle — pick peers for true
comparability, use medians and trimmed ranges, and adjust for
capital-structure and accounting differences before reading the multiples.

## cost-benefit-ledger — Cost-Benefit Ledger

A Cost-Benefit Ledger is a two-column accounting of quantified costs and
benefits, netted to a return, payback, or NPV. Use it for go / no-go
decisions on a discrete investment, for justifying internal projects to a
finance committee, or for pricing / process-change evaluations. Simple
payback works for small fast screens; NPV / IRR ledgers for multi-year
capital projects; TCO (total cost of ownership) for vendor and platform
decisions that hide lifecycle costs. The ledger misleads when benefits
are strategic and genuinely unquantifiable — in that case reach for a
[decision-matrix](#decision-matrix--decision-matrix-weighted-scoring) that
accepts qualitative criteria.

## scenario-grid — Scenario Grid

A Scenario Grid arranges a small set of internally consistent scenarios —
often three (base / bull / bear) or a 2×2 of orthogonal uncertainties —
against which a strategy, forecast, or portfolio is evaluated. Reach for
it when commitments are irreversible, when robustness matters more than
optimality, and when deep uncertainty prevents a single credible forecast.
Base/bull/bear, 2×2 matrices, and deliberate stress/tail scenarios each
serve a different decision type. The scenarios must differ in narrative,
not just in magnitude — "plan ± 10%" is not a scenario analysis — and
drivers across scenarios must be internally consistent.

## sensitivity-tornado — Sensitivity Tornado

A Sensitivity Tornado shows, as horizontal bars sorted by magnitude, how
much an output metric moves when each input is flexed through a defined
range. Use it to identify which assumptions actually drive a model, to
communicate model risk to non-technical stakeholders, and to prioritize
further research budget. One-way tornadoes cover first-pass diagnostic
work; two-way sensitivity tables when drivers interact (growth × margin);
Monte Carlo for many uncertain inputs with non-linear interactions. The
tornado is a diagnostic of the forecast, not a forecast itself — do not
read a wide bar as a prediction that the output will move that far.

## dcf-model — DCF Model

A DCF Model projects free cash flows over a finite horizon plus a terminal
value, each discounted to present value at a risk-adjusted rate. It is the
standard intrinsic-valuation structure when the decision needs a fair value
independent of current market prices, and it works best for long-duration
cash-flow assets (infrastructure, real estate, subscription businesses).
Unlevered FCF / WACC, levered / equity DCF, and APV variants handle
different capital structures. The universal trap is a terminal value that
dominates the answer — report sensitivity to terminal growth and discount
rate explicitly, and never project growth above GDP into perpetuity.

---

## Picking the right structure

The `crossStructureDecisionGuide` in
[`structures.json`](../resources/structures.json) provides a direct map:

| Bottleneck operation | Reach for |
|---|---|
| Explain or decompose an aggregate metric | **driver-tree** |
| Choose one from discrete options with criteria | **decision-matrix** |
| Assess industry / segment structural profitability | **porter-five-forces** |
| Build shared internal-vs-external framing | **swot-matrix** |
| Retention, LTV, time-based customer behavior | **cohort-table** |
| Benchmark valuation or operating metrics | **comparables-table** |
| Justify a discrete investment with quantified return | **cost-benefit-ledger** |
| Stress-test a plan under deep uncertainty | **scenario-grid** |
| Identify dominant assumptions in a model | **sensitivity-tornado** |
| Intrinsic fair value independent of market | **dcf-model** |

The anti-overlap rule in `resources/cross-references.json` forbids two
paths from sharing the same (paradigm, structure) pair — so if your
selected paradigms cluster around one structure, the signal matcher will
diversify for you.

---

## See also

- [analytical-paradigms.md](analytical-paradigms.md) — the lens each
  structure is making concrete.
- [analytical-strategies.md](analytical-strategies.md) — the reframings
  that discipline how each structure is filled in.
