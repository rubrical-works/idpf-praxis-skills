# FORGE — Internal Dashboard IA Redesign

## Metadata

- **Date:** 2026-05-16
- **Skill:** engage-forge 1.0.0
- **Paths explored:** 3 (Atomic-design IA tree, Service-design blueprint, Nielsen-heuristic-driven redesign)
- **Audit checklist:** nielsen-10
- **Persona source:** user-supplied-flag (Devi, ops-team analyst on Monday-morning incident response)
- **Graft recommended:** no

---

## Problem

> "Our internal ops dashboard has accumulated 47 widgets across 6 tabs. Analysts can't find the incident-response widgets fast enough during a Sev-2. Redesign the IA."

---

## Paradigms Explored

| Path | Paradigm | Artefact | One-sentence rationale |
|---|---|---|---|
| 1 | Atomic-design IA tree | `ia-tree` | Decompose the dashboard into reusable components; group around task domains rather than data sources. |
| 2 | Service-design blueprint | `journey-map` | Map what an analyst does during a Sev-2 incident response; align the IA to that journey rather than to the data org chart. |
| 3 | Nielsen-heuristic-driven redesign | `heuristic-matrix` | Audit the current dashboard against Nielsen's 10; surface the largest gaps; let the gaps drive the redesign. |

---

## Artefacts

### Path 1 — Atomic-design IA tree (artefactType: `ia-tree`)

```json
{
  "artefactType": "ia-tree",
  "title": "Ops dashboard IA — task-domain-grouped",
  "root": {
    "label": "Dashboard",
    "children": [
      {
        "label": "Incident Response (Primary)",
        "rationale": "Sev-1 / Sev-2 widgets surface here first.",
        "children": [
          { "label": "Active incidents (Organism)" },
          { "label": "Recent alerts (Molecule)" },
          { "label": "On-call roster (Molecule)" },
          { "label": "Runbook quick-links (Molecule)" }
        ]
      },
      {
        "label": "Service Health",
        "children": [
          { "label": "Service status grid (Organism)" },
          { "label": "SLO burn-down (Molecule)" },
          { "label": "Recent deploys (Molecule)" }
        ]
      },
      {
        "label": "Capacity & Cost",
        "children": [
          { "label": "Capacity headroom (Molecule)" },
          { "label": "Cost trend (Molecule)" }
        ]
      },
      {
        "label": "Workflows (Settings)",
        "children": [
          { "label": "Workflow definitions" },
          { "label": "Workflow runs (last 7d)" }
        ]
      }
    ]
  }
}
```

**Rationale.** Re-grouping from 6-tabs-by-data-source to 4-tabs-by-task-domain promotes Incident Response to a first-class top-level surface. The atomic decomposition makes reusable components explicit. The most contestable assumption: 47 widgets contains enough true duplication to drop to 16 widgets across 4 tabs without losing analyst value.

**What would change:** (1) An audit shows 47 widgets are mostly non-duplicative — the cut is too aggressive. (2) Settings doesn't belong in the IA at all; move to a separate Admin surface.

### Path 2 — Service-design journey map (artefactType: `journey-map`)

```json
{
  "artefactType": "journey-map",
  "title": "Sev-2 incident response journey",
  "persona": "Devi, ops-team analyst",
  "scenario": "Sev-2 paged at 09:14 Monday — alert says 'API latency p99 > 800ms in eu-west-1'.",
  "stages": [
    { "stage": "Page received", "userState": "context-switching from morning standup", "touchpoint": "PagerDuty mobile + dashboard URL", "emotion": "alert", "opportunity": "Dashboard URL deep-links to the relevant service, not the home tab." },
    { "stage": "Triage", "userState": "needs scope + severity + first-suspect", "touchpoint": "Incident Response tab — Active incidents + recent deploys", "emotion": "focused", "opportunity": "Co-locate active incidents with recent deploys; auto-correlate by service tag." },
    { "stage": "Drill-in", "userState": "needs metric detail for one service", "touchpoint": "Service Health tab — SLO burn-down", "emotion": "investigating", "opportunity": "One-click traversal from incident → service; pre-filter to last 30 min." },
    { "stage": "Mitigate", "userState": "executing runbook", "touchpoint": "Runbook quick-links + service controls", "emotion": "pressured", "opportunity": "Runbook quick-links surface adjacent to the active incident, not buried in docs." },
    { "stage": "Hand off", "userState": "writing up handoff for next shift", "touchpoint": "Incident detail page", "emotion": "winding down", "opportunity": "Auto-generate handoff summary from incident timeline." }
  ]
}
```

**Rationale.** The journey reveals the IA failure clearly — every stage needs a different tab in the current design, costing context-switches. The redesign anchors all five stages on the Incident Response tab plus targeted drill-ins. The most contestable assumption: Sev-2 is the dominant journey to optimize for. Daily-ops journeys (capacity planning, cost reviews) may share the dashboard.

**What would change:** (1) Daily-ops is the dominant journey; Sev-2 happens twice a week. The redesign should center capacity / cost. (2) Mitigate stage is dominated by external tools (kubectl, AWS console); the dashboard's role there is observational only.

### Path 3 — Nielsen-heuristic-driven redesign matrix (artefactType: `heuristic-matrix`)

```json
{
  "artefactType": "heuristic-matrix",
  "title": "Current dashboard audit (Nielsen-10)",
  "subjectArtefact": "Current ops dashboard (47 widgets / 6 tabs)",
  "findings": [
    { "heuristic": "Visibility of system status", "artefactElement": "Service Health tab — 'last refresh' timestamp", "severity": "minor", "finding": "Timestamp present but small.", "recommendation": "Promote to 14pt; show 'stale > 5min' warning." },
    { "heuristic": "Match between system and real world", "artefactElement": "Tab labels: 'Telemetry', 'Operations', 'Analytics'", "severity": "major", "finding": "Tab labels describe data sources, not analyst tasks. Analyst doesn't ask 'where's telemetry?' — asks 'where are the active incidents?'", "recommendation": "Re-label tabs around tasks (Incident Response, Service Health, Capacity & Cost)." },
    { "heuristic": "User control and freedom", "artefactElement": "47 widgets — no hide / favorite mechanism", "severity": "major", "finding": "Analysts have no way to suppress widgets irrelevant to their role.", "recommendation": "Add per-user widget favoriting; default home page = favorited widgets only." },
    { "heuristic": "Recognition rather than recall", "artefactElement": "Cross-widget filtering — must remember filter syntax per widget", "severity": "critical", "finding": "Each widget has its own filter chip; no shared filter state. Analyst types 'service:auth' six times.", "recommendation": "Add dashboard-level filter chips that scope all widgets on the page." },
    { "heuristic": "Aesthetic and minimalist design", "artefactElement": "Dashboard density — 12 widgets per tab above the fold", "severity": "major", "finding": "Information competes for attention; relevant widgets lose to incidental ones.", "recommendation": "Reduce to ≤6 widgets per tab above the fold; demote others to scrollable region." }
  ]
}
```

**Rationale.** The 47-widgets / 6-tabs surface fails on five heuristics, with `Recognition rather than recall` being the largest gap (cross-widget filtering). Fixing the filter and the tab-label-as-data-source antipattern produces most of the redesign value. The most contestable assumption: a single dashboard can serve incident response *and* capacity planning *and* cost reviews. Separate dashboards may be the right answer.

**What would change:** (1) Cross-widget filtering is technically infeasible due to backend constraints — the recommendation drops to "label widgets with their current filter state in 14pt." (2) Three separate dashboards (Incidents / Health / Capacity) is feasible and the audit recommendation pivots.

---

## Synthesis Comparison Table

```json
{
  "outputType": "comparison-table",
  "rows": [
    { "path": 1, "paradigm": "Atomic-design IA tree", "artefactType": "ia-tree", "strengths": "Concrete IA proposal; component decomposition makes the redesign implementable.", "weaknesses": "Cuts to 4 tabs without explicit justification per cut.", "fitWithStatedGoals": "Strong — produces an actionable IA." },
    { "path": 2, "paradigm": "Service-design blueprint", "artefactType": "journey-map", "strengths": "Maps the Sev-2 journey directly; surfaces co-location opportunities.", "weaknesses": "Doesn't produce an IA artefact; informs but doesn't ship.", "fitWithStatedGoals": "Medium — informs Path 1." },
    { "path": 3, "paradigm": "Nielsen-heuristic-driven redesign", "artefactType": "heuristic-matrix", "strengths": "Names specific failures with severity; recommendations are concrete.", "weaknesses": "Audit matrix is not itself an IA; needs Path 1 to implement.", "fitWithStatedGoals": "Medium — audit informs Path 1." }
  ],
  "recommendedPath": 1,
  "recommendationRationale": "Path 1 produces an actionable IA. Paths 2 and 3 inform the IA's grouping and the widget-level fixes but are not standalone deliverables. The audit pass below will surface graft opportunities from Path 3 onto Path 1."
}
```

---

## Heuristic Audit

```json
{
  "checklistId": "nielsen-10",
  "subjectArtefact": { "pathNumber": 1, "paradigm": "Atomic-design IA tree", "artefactType": "ia-tree" },
  "findings": [
    { "heuristic": "Match between system and the real world", "artefactElement": "Top-level tab labels (Incident Response / Service Health / Capacity & Cost / Workflows)", "severity": "pass", "finding": "Labels are task-domain-aligned.", "recommendation": "Hold." },
    { "heuristic": "Recognition rather than recall", "artefactElement": "IA does not address cross-widget filtering", "severity": "major", "finding": "The IA reorganizes widget grouping but does not introduce a shared filter mechanism — analysts will still re-type filters per widget.", "recommendation": "Add a top-level filter-chip strip above the tab nav that scopes all widgets on the current tab." },
    { "heuristic": "User control and freedom", "artefactElement": "IA does not address per-user widget favoriting", "severity": "minor", "finding": "47 → 16 widgets reduces the density problem but doesn't address the per-analyst-role variance.", "recommendation": "Add a per-user 'pin' affordance on each widget; pinned widgets surface above the fold." },
    { "heuristic": "Aesthetic and minimalist design", "artefactElement": "4 tabs × 4 widgets each = 16 widgets total", "severity": "pass", "finding": "Density is appropriate.", "recommendation": "Hold." },
    { "heuristic": "Visibility of system status", "artefactElement": "IA does not specify per-widget last-refresh display", "severity": "minor", "finding": "The widget refresh-timestamp issue from the current dashboard isn't surfaced by the IA.", "recommendation": "Each Molecule should declare a last-refresh display contract." }
  ],
  "mostSevereFinding": {
    "heuristic": "Recognition rather than recall",
    "severity": "major",
    "recommendation": "Add a top-level filter-chip strip above the tab nav that scopes all widgets on the current tab."
  },
  "graftRecommendation": null
}
```

The most-severe finding is structurally a different artefact (a control surface that scopes the IA), not a transplantable element from Paths 2 or 3. No graft fires.

---

## Critique

```json
{
  "persona": {
    "name": "Devi",
    "shortDescriptor": "ops-team analyst, 4 years on this team, technicalComfort: high, accessibilityNeeds: none, context: Monday-morning Sev-2 paged at 09:14",
    "selectionSource": "user-supplied-flag"
  },
  "subjectArtefact": { "pathNumber": 1, "artefactType": "ia-tree" },
  "frictionPoints": [
    { "artefactElement": "Top-level tab: 'Workflows (Settings)'", "friction": "I never look at workflow definitions during an incident. Burying them in an unlabeled fourth tab still costs me a click-error every other Sev-2 when I try to find the incident timeline.", "remediation": "Move Workflows out of the dashboard IA entirely — to a separate Admin surface accessible from the user menu." },
    { "artefactElement": "Incident Response organism: 'Runbook quick-links (Molecule)'", "friction": "Runbook quick-links are static? My team has 14 runbooks; the dashboard can show 4. Which 4 are the quick-links?", "remediation": "Make runbook quick-links contextual to the active incident's service tag — show the runbooks tagged for the incident's service first." },
    { "artefactElement": "Service Health organism: lacks deploy-incident correlation", "friction": "Path 2's journey map called out auto-correlating active incidents with recent deploys. Path 1's IA puts them in separate organisms. During Sev-2 I'm still doing the correlation in my head.", "remediation": "Co-locate recent deploys with active incidents in the Incident Response organism, keyed by service tag — Path 2's recommendation, not yet adopted by Path 1." }
  ]
}
```

---

## What Would Change This Recommendation

- **Cross-widget filtering is technically infeasible.** Audit's most-severe finding drops in severity; the IA stands as-is with per-widget filter labels instead.
- **Sev-2 is not the dominant journey.** Capacity planning takes the top slot; Incident Response demotes to second-class; tab order flips.
- **Three separate dashboards instead of one.** Re-run with `--paths 4` and an explicit "separate dashboards per task domain" constraint; IA tree pattern still applies per dashboard.

---

## Audit

See the heuristic audit pass output above for the full finding matrix.
