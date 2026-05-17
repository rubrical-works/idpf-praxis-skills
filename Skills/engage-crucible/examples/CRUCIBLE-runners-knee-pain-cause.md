# CRUCIBLE — What Drives Patellofemoral Knee Pain in Recreational Runners?

## Metadata

- **Date:** 2026-05-16
- **Skill:** engage-crucible 1.0.0
- **Research question:** What is the dominant cause of patellofemoral knee pain (PFP) flare-ups in recreational long-distance runners aged 25–45?
- **Domain:** biology-medicine
- **Paths:** 3 competing hypotheses
- **Prior source:** uniform (no prior literature consensus among the three mechanisms in this population)
- **Offline mode:** false
- **Crucible experiment id:** `attack-for-h1-mileage`

---

## Research Question

What is the dominant cause of patellofemoral knee pain (PFP) flare-ups in recreational long-distance runners aged 25–45? Three competing mechanisms have been proposed in the literature: overuse load, biomechanical malalignment, and sleep-deficit-mediated tissue-repair impairment.

---

## Hypotheses

### h1-mileage — Overuse load (mileage volume dominates)

**Claim:** PFP flares are driven primarily by cumulative weekly mileage exceeding the runner's individual cartilage repair capacity.

**Mechanism:** High weekly mileage exceeds the rate of patellofemoral cartilage repair; cumulative microdamage produces an inflammatory flare that presents as PFP.

**Predictions:**
- Pain incidence rises monotonically with weekly mileage tertile.
- Mileage-reduction intervention reduces flare incidence within 4–8 weeks.

**Falsification condition:** In a 6-month cohort, runners in the top mileage tertile WITH normal Q-angles AND adequate sleep do NOT develop pain at a substantially higher rate than the lowest mileage tertile.

**Assumptions:**
- Mileage is the dominant load axis (vs. pace, gradient, surface).
- Cartilage repair capacity is roughly population-uniform within this age band.

**Experimental-design artefact (PECO):**
```json
{
  "artefactType": "peco",
  "population": { "description": "Recreational runners aged 25-45 with no prior PFP diagnosis", "sampleSize": "300 per tertile (900 total) for 6-month prospective follow-up" },
  "exposure": "Weekly mileage tertile (low <25 km/wk, mid 25-50, high >50)",
  "comparison": "Lowest tertile",
  "outcome": "Self-reported PFP incidence over 6 months",
  "primaryMeasurement": "Validated VAS pain score ≥3 sustained ≥2 weeks",
  "confoundersToControl": ["age", "BMI", "running surface", "Q-angle", "sleep duration"],
  "selectionBiasMitigation": "Recruit via running clubs across mileage strata to avoid self-selection"
}
```

**Prior probability:** 0.333 (uniform)

---

### h2-malalignment — Biomechanical malalignment (Q-angle dominates)

**Claim:** PFP flares are driven primarily by biomechanical malalignment — large Q-angle drives patellar tracking error regardless of mileage.

**Mechanism:** Increased Q-angle produces a lateral pull on the patella during knee flexion-extension; over many cycles this produces patellofemoral cartilage wear concentrated on one facet, presenting as PFP.

**Predictions:**
- Pain incidence rises with Q-angle, not with mileage.
- Pain incidence is similar across mileage tertiles for runners with similar Q-angles.

**Falsification condition:** In runners stratified by Q-angle, mileage tertile predicts pain incidence MORE strongly than Q-angle.

**Assumptions:**
- Q-angle is stable in adults (no significant change over 6 months).
- Patellar tracking error is the dominant biomechanical failure mode.

**Experimental-design artefact (PECO):**
```json
{
  "artefactType": "peco",
  "population": { "description": "Recreational runners aged 25-45, stratified by Q-angle quartile", "sampleSize": "150 per quartile (600 total) for 6-month follow-up" },
  "exposure": "Q-angle quartile (lowest to highest)",
  "comparison": "Lowest Q-angle quartile",
  "outcome": "PFP incidence over 6 months",
  "primaryMeasurement": "Same VAS ≥3 sustained ≥2 weeks",
  "confoundersToControl": ["mileage", "sleep", "age", "BMI"],
  "selectionBiasMitigation": "Q-angle measured by goniometer before enrollment; recruited from same running clubs as h1"
}
```

**Prior probability:** 0.333 (uniform)

---

### h3-sleep — Sleep deficit (tissue-repair impairment dominates)

**Claim:** PFP flares are driven primarily by chronic sleep deficit impairing growth-hormone-mediated tissue repair.

**Mechanism:** Habitual sleep <7 hours/night reduces nocturnal GH secretion; reduced GH secretion impairs articular cartilage repair; impaired repair lowers the mileage threshold at which microdamage outpaces recovery, presenting as PFP.

**Predictions:**
- Pain incidence rises with sleep deficit, controlling for mileage.
- Sleep-improvement intervention reduces flare incidence even at constant mileage.

**Falsification condition:** In a 6-month cohort, runners with chronic sleep deficit do NOT show elevated PFP incidence after controlling for mileage and Q-angle.

**Assumptions:**
- Self-reported sleep duration correlates with actual sleep (validated against actigraphy in subsample).
- GH-mediated cartilage repair is rate-limiting for the population at this load.

**Experimental-design artefact (generic-experimental-setup):**
```json
{
  "artefactType": "generic-experimental-setup",
  "subject": "Recreational runners aged 25-45 with PFP history (n=200)",
  "manipulation": "12-week sleep-hygiene intervention (target 7.5+ hours/night) vs. waitlist control",
  "measurement": "PFP incidence + serum GH levels at week 0 / 6 / 12",
  "expectedEffect": "Intervention arm shows ≥30% relative reduction in flare incidence at week 12",
  "sampleSize": "100 per arm for 80% power to detect 30% relative reduction at α=0.05",
  "confoundersToControl": ["mileage held constant during study", "age", "BMI", "concurrent NSAID use"]
}
```

**Prior probability:** 0.334 (uniform)

---

## Falsification Attacks

### attack-for-h1-mileage

```json
{
  "assignedHypothesisId": "h1-mileage",
  "discriminatingPrediction": "In a 6-month cohort stratified by mileage tertile AND Q-angle quartile AND sleep-duration tertile, mileage tertile remains the dominant predictor of PFP incidence (effect size at least 2x the Q-angle or sleep effects when each is held constant).",
  "siblingHypothesesRuledOutByDiscriminatingResult": ["h2-malalignment", "h3-sleep"],
  "experimentalSetup": { "artefactType": "peco" },
  "expectedInformationGain": "high",
  "costEstimate": "moderate",
  "rationale": "A 3-way stratification PECO with 6-month follow-up isolates mileage's contribution while controlling for the other two mechanisms. Sample-size estimate ~900; recruitment via existing running-club partnerships keeps cost moderate."
}
```

### attack-for-h2-malalignment

```json
{
  "assignedHypothesisId": "h2-malalignment",
  "discriminatingPrediction": "Among runners with high Q-angle (top quartile), pain incidence is similar across mileage tertiles — meaning malalignment is sufficient even at low mileage.",
  "siblingHypothesesRuledOutByDiscriminatingResult": ["h1-mileage"],
  "experimentalSetup": { "artefactType": "peco" },
  "expectedInformationGain": "medium",
  "costEstimate": "moderate",
  "rationale": "Conditional analysis on the high-Q-angle subset within the same cohort that the h1 attacker proposes. Only rules out one sibling (h1); doesn't discriminate h2 from h3 directly. Lower info gain than h1's attack."
}
```

### attack-for-h3-sleep

```json
{
  "assignedHypothesisId": "h3-sleep",
  "discriminatingPrediction": "A sleep-hygiene intervention (12 weeks, target 7.5+ hours) at CONSTANT mileage reduces PFP flare incidence by ≥30% relative to waitlist control.",
  "siblingHypothesesRuledOutByDiscriminatingResult": ["h1-mileage", "h2-malalignment"],
  "experimentalSetup": { "artefactType": "generic-experimental-setup" },
  "expectedInformationGain": "high",
  "costEstimate": "expensive",
  "rationale": "An intervention RCT with constant-mileage controls is the strongest discriminator — both siblings would predict no effect of sleep at constant mileage. But the intervention requires close-coached adherence over 12 weeks and is structurally more expensive than the observational PECO. Information gain matches the h1 attack; cost is higher."
}
```

---

## Bayesian Synthesis

```json
{
  "priors": {
    "priorSource": "uniform",
    "rationale": "No strong literature consensus among these three mechanisms; meta-analyses cite each as plausible primary driver in different cohorts. Uniform 1/3 is honest.",
    "values": { "h1-mileage": 0.333, "h2-malalignment": 0.333, "h3-sleep": 0.334 }
  },
  "posteriorLandscape": [
    {
      "experimentId": "attack-for-h1-mileage",
      "ifPredictionHolds": { "h1-mileage": "up", "h2-malalignment": "down", "h3-sleep": "down" },
      "ifPredictionFails": { "h1-mileage": "down", "h2-malalignment": "unchanged", "h3-sleep": "unchanged" },
      "informationGain": "high"
    },
    {
      "experimentId": "attack-for-h2-malalignment",
      "ifPredictionHolds": { "h1-mileage": "down", "h2-malalignment": "up", "h3-sleep": "unchanged" },
      "ifPredictionFails": { "h1-mileage": "unchanged", "h2-malalignment": "down", "h3-sleep": "unchanged" },
      "informationGain": "medium"
    },
    {
      "experimentId": "attack-for-h3-sleep",
      "ifPredictionHolds": { "h1-mileage": "down", "h2-malalignment": "down", "h3-sleep": "up" },
      "ifPredictionFails": { "h1-mileage": "unchanged", "h2-malalignment": "unchanged", "h3-sleep": "down" },
      "informationGain": "high"
    }
  ],
  "crucibleExperiment": {
    "experimentId": "attack-for-h1-mileage",
    "rationale": "Same information gain as the h3 sleep-intervention RCT but at moderate cost (PECO with existing running-club recruitment) rather than expensive cost (12-week coached intervention). The 3-way stratification rules out BOTH siblings if the discriminating prediction holds, and ages-out one sibling (h1) if it fails. Best info gain per cost in this set."
  },
  "researchRoadmap": [
    { "order": 1, "experimentId": "attack-for-h1-mileage" },
    { "order": 2, "experimentId": "attack-for-h3-sleep", "conditionalOn": "attack-for-h1-mileage fails (mileage not dominant)" },
    { "order": 3, "experimentId": "attack-for-h2-malalignment", "conditionalOn": "neither h1 nor h3 supported by their attacks; remaining hypothesis space narrows to h2" }
  ],
  "learningObjective": "Cheap-and-discriminating-via-stratification beats expensive-but-controlled when the cohort can be stratified on all three competing axes simultaneously. The sleep-intervention RCT is methodologically the cleanest but loses on cost ranking — its slot is conditional on h1's failure."
}
```

---

## Crucible Experiment — `attack-for-h1-mileage`

**Design:** Prospective PECO with three-way stratification (mileage tertile × Q-angle quartile × sleep-duration tertile) and 6-month follow-up.

**Population:** 900 recreational runners aged 25–45, recruited via running clubs across mileage strata to avoid self-selection bias. No prior PFP diagnosis.

**Exposure:** Weekly mileage tertile.

**Comparison:** Lowest mileage tertile.

**Outcome:** PFP incidence (VAS ≥3 sustained ≥2 weeks).

**Primary measurement:** Self-reported VAS pain score with monthly check-in.

**Confounders controlled:** Q-angle (measured at baseline), sleep duration (validated against actigraphy in 10% subsample), age, BMI, running surface.

**Selection-bias mitigation:** Multi-club recruitment across mileage strata.

**Expected discriminating result:** Mileage-tertile effect size ≥2× Q-angle effect AND ≥2× sleep effect, with each held constant.

**Cost:** Moderate — existing running-club partnerships + 6-month timeline + observational design + small actigraphy substudy.

---

## Research Roadmap

| Order | Experiment | Conditional on |
|---|---|---|
| 1 | `attack-for-h1-mileage` (PECO 3-way stratification, 6 months, moderate cost) | — (the crucible test; start here) |
| 2 | `attack-for-h3-sleep` (sleep-intervention RCT, 12 weeks, expensive) | mileage NOT dominant in step 1 |
| 3 | `attack-for-h2-malalignment` (analysis of high-Q-angle subset across mileage tertiles) | neither h1 nor h3 supported; remaining hypothesis space narrows to h2 |

---

## Learning Objective

When three competing causal mechanisms can be stratified within a single cohort, a multi-axis stratified PECO discriminates among them at lower cost than running three pairwise intervention RCTs. The sleep-intervention RCT remains the cleanest test of h3 but its slot is conditional — if h1 wins the stratified analysis, the sleep RCT becomes a confirmation-only experiment with lower info gain than the question it was originally proposed for.
