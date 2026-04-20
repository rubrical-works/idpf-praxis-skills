# Parallel Analysis: Output-Contract Reference Example

- **Date:** 2026-04-19
- **Skill:** engage-prism
- **Signals Matched:** equity-fair-value
- **Paths Explored:** 2
- **Web Research Performed:** true

> This example exists **primarily to illustrate the user-facing output contract (#188)**: markdown-rendered path narrative with numbered citations, a synthesis section, and raw JSON preserved inside a `<details>` block. It is intentionally short — see the longer domain examples (`PRISM-equity-ticker-abcd-earnings.md`, etc.) for full analytical depth.

## Question

"Should we update our fair-value target on ABCD ahead of the Q2 print?"

## Research Plan

- **Entity anchors:** ABCD Corp, peer set (EFGH, IJKL).
- **Source classes:** earnings-transcript, analyst-report, company-filings.
- **Recency window:** last 45 days.
- **Fetch budget:** 3 fetches per path.

## Signal Analysis

| Signal | Weight | Paradigms | Structures | Strategies |
|---|---|---|---|---|
| equity-fair-value | 0.95 | valuation, forecasting | dcf-model, comparables-table | triangulation, sensitivity-analysis |

**Tier:** Strong — single dominant signal but with mature paradigm coverage.

## Path 1: DCF with sensitivity on terminal growth

### Narrative

DCF built from latest guidance. Terminal growth is the dominant lever — a 50 bps move shifts target ±7%. Peer multiples corroborate the point estimate but add no incremental information beyond directional check.

### Key Findings

- Base-case fair value **$142**, with sensitivity range **$128–$158** across ±1 pp on terminal growth and ±2 pp on WACC.
- Management Q1 guidance implies ~9% FY revenue growth — consistent with peer average, not a pull-forward [^1].
- Margin expansion thesis hinges on SaaS mix — 68% currently, tracking toward 75% per last 10-Q [^2].

### Citations

[^1]: ABCD Q1 2026 Earnings Transcript — "management reiterated FY revenue guide of $4.9–5.1B, implying ~9% YoY." Fetched 2026-04-19.
[^2]: ABCD 10-Q filing (2026-Q1), SaaS mix disclosure on p. 22. Fetched 2026-04-19.

<details><summary>Raw subagent output (JSON)</summary>

```json
{
  "pathName": "DCF with sensitivity on terminal growth",
  "angle": "Intrinsic valuation via DCF with explicit sensitivity on terminal growth and WACC; peer multiples as directional cross-check.",
  "recommendations": [
    {"metric": "baseFairValue", "value": "$142", "sensitivityRange": "$128-$158"}
  ],
  "biggestRisk": "SaaS mix transition stalls at current 68%, compressing the margin expansion assumption.",
  "flipCondition": "Q2 SaaS mix prints <=68% — thesis revisits 10-15% downside.",
  "citations": [
    {"title": "ABCD Q1 2026 Earnings Transcript", "url": "https://example.com/abcd/q1-2026-transcript", "fetchedAt": "2026-04-19T10:00:00Z", "excerpt": "management reiterated FY revenue guide of $4.9-5.1B, implying ~9% YoY."},
    {"title": "ABCD 10-Q filing (2026-Q1)", "url": "https://example.com/abcd/10q-q1-2026", "fetchedAt": "2026-04-19T10:05:00Z", "excerpt": "Software-as-a-service revenue mix was 68% for the quarter."}
  ],
  "webResearch": {"performed": true, "fetchCount": 3}
}
```

</details>

## Path 2: Comparables-table cross-check

### Narrative

Peer EV/EBITDA suggests ABCD trades at a 15% discount to the peer median. Mostly explained by lower growth; the unexplained residual is small.

### Key Findings

- Peer median EV/EBITDA: **17.2x**; ABCD at **14.6x** [^3].
- Growth gap (9% vs peer median 11%) accounts for ~12% of the discount; ~3% residual.

### Citations

[^3]: Peer comps pulled from company filings and Yahoo Finance. Fetched 2026-04-19.

<details><summary>Raw subagent output (JSON)</summary>

```json
{
  "pathName": "Comparables-table cross-check",
  "recommendations": [
    {"metric": "peerMedianEVEBITDA", "value": "17.2x"},
    {"metric": "abcdEVEBITDA", "value": "14.6x"},
    {"metric": "unexplainedDiscount", "value": "~3%"}
  ],
  "citations": [
    {"title": "Yahoo Finance — ABCD Key Statistics", "url": "https://example.com/yahoo/abcd", "fetchedAt": "2026-04-19T10:20:00Z", "excerpt": "EV/EBITDA (TTM): 14.6."}
  ],
  "webResearch": {"performed": true, "fetchCount": 3}
}
```

</details>

## Synthesis

Both paths agree on direction (modest upside) and magnitude (single-digit percent). DCF is the decision-driving path; comps is directional cross-check.

- **Scoring:** DCF path scores higher on decision usefulness (explicit sensitivity) and counter-evidence handling (named flip condition).
- **Hybridization:** Use DCF's base value ($142) as the target; use comps' residual-discount decomposition as the confidence anchor.

## Recommendation

**Best angle: DCF with sensitivity on terminal growth.**
Update target to **$142** with a range of **$128–$158**. Flip condition: Q2 SaaS mix ≤68%.

## What Would Change This Answer

- SaaS mix regression (Q2 prints ≤68%) — target drops 10–15%.
- Peer median multiple rerates up by >1 turn — residual discount closes, partial rerating for ABCD.

## Rejected Angles

- Multiples-only valuation: insufficient on its own; comps path kept as cross-check rather than lead angle.
