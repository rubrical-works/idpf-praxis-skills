# CRUCIBLE — Why Did Engineering-Team Productivity Decline 18% After the Remote-Work Transition?

## Metadata

- **Date:** 2026-05-16
- **Skill:** engage-crucible 1.0.0
- **Research question:** Why did the engineering team's productivity (measured by deployment frequency × story-points-completed) decline 18% in the 9 months after fully-remote transition, controlling for headcount and project complexity?
- **Domain:** social-science
- **Paths:** 3 competing hypotheses
- **Prior source:** user-supplied (engineering manager prior: communication-bottleneck most likely)
- **Offline mode:** false
- **Crucible experiment id:** `attack-for-h2-communication-async`

---

## Research Question

A 60-engineer organization transitioned to fully-remote work in March 2025. Over the 9 months following, engineering productivity (deployment frequency × story-points-completed, normalized for headcount and project complexity) declined 18% relative to the pre-transition 6-month baseline. Three hypotheses explain the decline.

---

## Hypotheses

### h1-onboarding — Reduced informal onboarding for new hires

**Claim:** The productivity decline is driven by the 14 new engineers hired during the remote period — informal onboarding (over-the-shoulder code review, hallway questions, shadowing) didn't transfer to remote, slowing new-hire ramp-up.

**Mechanism:** New hires take 3–6 months to reach baseline productivity in person. Remote new hires take 6–12 months due to missing informal-knowledge-transfer channels.

**Predictions:**
- Productivity decline is concentrated in cohorts containing many new hires.
- Tenured engineers (≥2 years pre-transition) show no decline; only the new-hire cohort lags.

**Falsification condition:** When productivity is stratified by tenure, tenured engineers show the SAME 18% decline as new hires.

**Assumptions:**
- Tenure stratification cleanly separates the proposed mechanism from confounders.
- Informal-onboarding mechanisms transfer poorly to remote (not "transfer slowly" — actually under-effective).

**Experimental-design artefact (PECO):**
```json
{
  "artefactType": "peco",
  "population": { "description": "All 60 engineers + 14 hired during the remote period (74 total observation-engineer-months)" },
  "exposure": "Tenure tier at transition: <6 months / 6-24 months / >24 months",
  "comparison": ">24 months tenure tier",
  "outcome": "Story-points-completed per engineer per month, normalized for project complexity",
  "primaryMeasurement": "Monthly Jira aggregate over 9 months",
  "confoundersToControl": ["project complexity", "team assignment", "team-lead identity"],
  "selectionBiasMitigation": "Use full population (no sampling); attribution rule for cross-team assignments specified in advance"
}
```

**Prior probability:** 0.25

---

### h2-communication-async — Async-communication bottleneck for design-and-review work

**Claim:** The productivity decline is driven by slower turn-around on design discussions and PR reviews — async communication (Slack, GitHub) replaced sync conversations and 30-minute decisions became 3-day threads.

**Mechanism:** Sync conversations resolve design questions in minutes; async threads accumulate context-switches and partial-answer fragments. Net effect: PR reviews + design discussions take 3–5× longer in calendar time, and engineers ship less per month while waiting.

**Predictions:**
- Cycle-time from "ready-for-review" to "merged" lengthens substantially (≥2×) post-transition.
- The lengthening is uncorrelated with the proportion of new hires in the cohort.

**Falsification condition:** Cycle-time-to-merge is unchanged post-transition; productivity decline is not concentrated in review-heavy work.

**Assumptions:**
- The team's pre-transition baseline used sync conversations for the majority of design / review decisions (verifiable by retrospective interviews).
- Cycle-time-to-merge captures the proposed bottleneck.

**Experimental-design artefact (PECO):**
```json
{
  "artefactType": "peco",
  "population": { "description": "All PRs opened during the 6 months pre-transition + 9 months post-transition (~3000 PRs total)" },
  "exposure": "Post-transition vs. pre-transition period",
  "comparison": "Pre-transition baseline",
  "outcome": "Median cycle-time from 'ready-for-review' label to merge",
  "primaryMeasurement": "GitHub timestamps, median per cohort by team and complexity",
  "confoundersToControl": ["PR size in lines-changed", "PR complexity tag", "reviewer pool size"],
  "selectionBiasMitigation": "Exclude PRs from new hires for primary analysis; sensitivity analysis including them"
}
```

**Prior probability:** 0.45 (manager's elicited prior; communication-bottleneck is the leading conjecture)

---

### h3-context-switching — Increased context-switching from home environment

**Claim:** The productivity decline is driven by more frequent context-switches in the home environment — childcare, household tasks, deliveries, etc. — that fragment deep-work time.

**Mechanism:** Sustained deep work (≥2 hour blocks) is a productivity multiplier for engineering tasks; home environment has 2–3× more interruption density than office environment. Engineers complete fewer high-cognitive-load tasks per day.

**Predictions:**
- Productivity decline is correlated with self-reported interruption frequency.
- Engineers with dedicated home offices show smaller decline than those working from shared family spaces.

**Falsification condition:** Interruption frequency is uncorrelated with per-engineer productivity decline (controlling for tenure and team).

**Assumptions:**
- Self-reported interruption frequency is an honest proxy (validated against random-prompt time-sampling in subsample).
- Deep-work-block availability is the rate-limiting factor for engineering productivity (vs. async bottleneck).

**Experimental-design artefact (generic-experimental-setup):**
```json
{
  "artefactType": "generic-experimental-setup",
  "subject": "30-engineer subsample volunteered for time-tracking instrumentation",
  "manipulation": "8-week observational period with daily interruption-count self-report + 4 random-prompt time samples per day for one week (subsample validation)",
  "measurement": "Interruptions per workday + dedicated-home-office binary + monthly productivity score",
  "expectedEffect": "Productivity decline correlates with interruption frequency (Spearman ρ < -0.3) and with absence of dedicated home office",
  "sampleSize": "30 engineers for 80% power to detect ρ = -0.4 at α = 0.05",
  "confoundersToControl": ["tenure", "team", "PR-review-load"]
}
```

**Prior probability:** 0.30

---

## Falsification Attacks

### attack-for-h1-onboarding

```json
{
  "assignedHypothesisId": "h1-onboarding",
  "discriminatingPrediction": "Productivity stratified by tenure: tenured engineers (≥24 months pre-transition) show ≤5% decline; new hires (<6 months at transition) show ≥40% relative ramp-rate decline compared to pre-transition new-hire cohorts.",
  "siblingHypothesesRuledOutByDiscriminatingResult": ["h2-communication-async", "h3-context-switching"],
  "experimentalSetup": { "artefactType": "peco" },
  "expectedInformationGain": "medium",
  "costEstimate": "cheap",
  "rationale": "Tenure stratification uses existing Jira data. Cheap. But the discriminating result is weaker if BOTH new hires AND tenured engineers decline (which would partially support h2 and h3 simultaneously without ruling out h1's contribution). The information gain is medium rather than high because the multi-mechanism reality may produce a partial signal."
}
```

### attack-for-h2-communication-async

```json
{
  "assignedHypothesisId": "h2-communication-async",
  "discriminatingPrediction": "Median PR cycle-time from 'ready-for-review' to merge lengthens ≥2× post-transition, uncorrelated with cohort new-hire proportion (controlling for PR size + complexity).",
  "siblingHypothesesRuledOutByDiscriminatingResult": ["h1-onboarding", "h3-context-switching"],
  "experimentalSetup": { "artefactType": "peco" },
  "expectedInformationGain": "high",
  "costEstimate": "trivial",
  "rationale": "Uses GitHub timestamps that already exist. Trivial cost. The discriminating signature (cycle-time lengthening uncorrelated with new-hire proportion) directly contradicts h1's (which would predict cycle-time changes concentrated in new-hire cohorts) and h3's (which would predict cycle-time stable but per-engineer monthly throughput down). Highest info-gain attack in the set."
}
```

### attack-for-h3-context-switching

```json
{
  "assignedHypothesisId": "h3-context-switching",
  "discriminatingPrediction": "Self-reported interruption frequency correlates negatively with per-engineer productivity decline (Spearman ρ < -0.3); engineers with dedicated home offices show ≤5% decline.",
  "siblingHypothesesRuledOutByDiscriminatingResult": ["h2-communication-async"],
  "experimentalSetup": { "artefactType": "generic-experimental-setup" },
  "expectedInformationGain": "medium",
  "costEstimate": "expensive",
  "rationale": "Requires 8-week observational period + subsample time-sampling validation. The discriminating signature rules out h2 (which would predict no correlation with interruption frequency at the individual level) but doesn't directly rule out h1 (a tenure effect could ride alongside the interruption effect). And the cost is high relative to the GitHub-timestamp analysis in h2's attack."
}
```

---

## Bayesian Synthesis

```json
{
  "priors": {
    "priorSource": "user-supplied",
    "rationale": "Engineering manager's elicited prior places highest weight on communication-bottleneck (h2 = 0.45) based on retrospective standup observations; secondary weight on context-switching (h3 = 0.30) and onboarding (h1 = 0.25).",
    "values": { "h1-onboarding": 0.25, "h2-communication-async": 0.45, "h3-context-switching": 0.30 }
  },
  "posteriorLandscape": [
    {
      "experimentId": "attack-for-h1-onboarding",
      "ifPredictionHolds": { "h1-onboarding": "up", "h2-communication-async": "down", "h3-context-switching": "down" },
      "ifPredictionFails": { "h1-onboarding": "down", "h2-communication-async": "unchanged", "h3-context-switching": "unchanged" },
      "informationGain": "medium"
    },
    {
      "experimentId": "attack-for-h2-communication-async",
      "ifPredictionHolds": { "h1-onboarding": "down", "h2-communication-async": "up", "h3-context-switching": "down" },
      "ifPredictionFails": { "h1-onboarding": "unchanged", "h2-communication-async": "down", "h3-context-switching": "unchanged" },
      "informationGain": "high"
    },
    {
      "experimentId": "attack-for-h3-context-switching",
      "ifPredictionHolds": { "h1-onboarding": "unchanged", "h2-communication-async": "down", "h3-context-switching": "up" },
      "ifPredictionFails": { "h1-onboarding": "unchanged", "h2-communication-async": "unchanged", "h3-context-switching": "down" },
      "informationGain": "medium"
    }
  ],
  "crucibleExperiment": {
    "experimentId": "attack-for-h2-communication-async",
    "rationale": "Trivial cost (existing GitHub data), high information gain (the discriminating signature directly contradicts both siblings), and aligns with the manager's prior (high posterior weight already on h2). Run first."
  },
  "researchRoadmap": [
    { "order": 1, "experimentId": "attack-for-h2-communication-async" },
    { "order": 2, "experimentId": "attack-for-h1-onboarding", "conditionalOn": "h2's discriminating prediction fails (cycle-time stable post-transition)" },
    { "order": 3, "experimentId": "attack-for-h3-context-switching", "conditionalOn": "h1 and h2 both fail their attacks; remaining hypothesis space narrows to h3 (or to an unconsidered fourth mechanism, which would trigger a re-run of Step 1 hypothesis enumeration)" }
  ],
  "learningObjective": "When a user-supplied prior places strong weight on one hypothesis, the highest-info-gain attack often aligns with that hypothesis's discriminator BUT the order of operations still matters — a trivial-cost test of the leading hypothesis gives the best information per dollar regardless of which way it resolves. If h2 fails its attack, the prior shifts substantially toward h1 and h3, and the next experiment is selected by *updated* posteriors."
}
```

---

## Crucible Experiment — `attack-for-h2-communication-async`

**Design:** Retrospective analysis of GitHub timestamps for all PRs opened pre-transition and post-transition.

**Population:** All ~3000 PRs spanning 15 months total (6 months pre + 9 months post).

**Exposure:** Post-transition vs. pre-transition.

**Comparison:** Pre-transition baseline.

**Outcome:** Median cycle-time from 'ready-for-review' label to merge.

**Primary measurement:** GitHub API timestamps; median per cohort by team and complexity.

**Confounders controlled:** PR size in lines-changed, PR complexity tag, reviewer pool size, new-hire authorship (excluded from primary, included in sensitivity).

**Expected discriminating result:** Median cycle-time lengthens ≥2× post-transition, uncorrelated with cohort new-hire proportion.

**Cost:** Trivial — existing data, ~1 week of analyst time.

---

## Research Roadmap

| Order | Experiment | Conditional on |
|---|---|---|
| 1 | `attack-for-h2-communication-async` (GitHub cycle-time analysis) | — (the crucible test) |
| 2 | `attack-for-h1-onboarding` (tenure-stratified Jira analysis) | h2's discriminating prediction fails |
| 3 | `attack-for-h3-context-switching` (8-week observational period + time-sampling subsample) | h1 and h2 both fail; or surface evidence of unconsidered mechanism |

---

## Learning Objective

When a user-supplied prior places strong weight on one hypothesis, the highest-info-gain attack often aligns with that hypothesis's discriminator. The discipline is to still run the trivial-cost test FIRST — it confirms or shifts the prior at minimal cost. If h2's attack fails despite the manager's prior, the prior shifts substantially toward h1 and h3, and the next experiment is selected by *updated* posteriors rather than original priors. This is the operational meaning of Bayesian discipline in research-design: the next experiment depends on what the prior actually was AFTER the last result, not what it was at the start.
