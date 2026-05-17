# CRUCIBLE — What Drives the Unexpected Signal Attenuation in a 10km Fiber-Optic Run?

## Metadata

- **Date:** 2026-05-16
- **Skill:** engage-crucible 1.0.0
- **Research question:** What is the dominant cause of a 4.3 dB signal-attenuation anomaly observed on a deployed 10km single-mode fiber-optic run at 1550nm, well above the 2.0 dB specification?
- **Domain:** physical-science (engineering)
- **Paths:** 3 competing hypotheses
- **Prior source:** uniform (the installation log doesn't favor any one cause)
- **Offline mode:** true (no web research; pure reasoning from installation specs)
- **Crucible experiment id:** `attack-for-h2-bend-radius`

---

## Research Question

A deployed 10km single-mode fiber-optic run at 1550nm shows 4.3 dB total attenuation, against a 2.0 dB specification. Three causes are plausible: connector loss at the four splice points, micro-bend radius violations along the run, or higher-than-spec intrinsic fiber attenuation.

---

## Hypotheses

### h1-connectors — Connector / splice loss dominates

**Claim:** Excess loss is concentrated at the four splice points; each splice averages 0.5–0.6 dB rather than the 0.1 dB spec.

**Mechanism:** Field-installed fusion splices have variable cleave-angle quality; mis-cleaved fibers produce reflection + scattering losses at each connector.

**Predictions:**
- An OTDR trace shows discrete loss spikes at the four splice points totaling ≥2 dB.
- Cumulative loss between splice points is at-spec (0.18 dB/km × 10 km = 1.8 dB).

**Falsification condition:** OTDR shows splice losses summing to <0.8 dB while inter-splice loss exceeds 1.8 dB.

**Assumptions:**
- The OTDR has sufficient resolution to localize splice losses (typically ±0.05 dB).
- The four splices are the only physical discontinuities in the run.

**Experimental-design artefact (generic-experimental-setup):**
```json
{
  "artefactType": "generic-experimental-setup",
  "subject": "Deployed 10km single-mode fiber run, 1550nm, four field-installed splices",
  "manipulation": "OTDR trace from each end (forward + backward) to localize loss",
  "measurement": "dB loss per splice + dB loss per inter-splice segment, at 0.05 dB resolution",
  "expectedEffect": "Splice-localized loss ≥2 dB total; inter-splice segments at-spec (1.8 dB)",
  "sampleSize": "Two OTDR traces (one per end) — bidirectional is standard for splice characterization",
  "confoundersToControl": ["OTDR launch conditions", "ambient temperature during measurement", "fiber-end face cleanliness"]
}
```

**Prior probability:** 0.333

---

### h2-bend-radius — Micro-bend radius violations dominate

**Claim:** One or more segments of the run have been installed below the minimum bend radius (30mm for this fiber), producing distributed loss along those segments.

**Mechanism:** Bending below the minimum-bend-radius spec causes coupling between the bound mode and radiation modes; signal energy leaks into the cladding/jacket and is absorbed.

**Predictions:**
- An OTDR trace shows distributed excess loss in specific segments (not localized to splices).
- Loss in affected segments substantially exceeds the 0.18 dB/km spec.

**Falsification condition:** OTDR trace shows all inter-splice segments at-spec (0.18 dB/km), and splice losses sum to ≥2 dB.

**Assumptions:**
- Bend-radius violations are localized to specific physical segments (consistent with conduit constraints at building entries).
- OTDR resolution can distinguish distributed vs localized loss.

**Experimental-design artefact (generic-experimental-setup):**
```json
{
  "artefactType": "generic-experimental-setup",
  "subject": "Same 10km fiber run",
  "manipulation": "OTDR trace + physical-inspection survey of likely bend-radius-violation points (building entries, conduit turns, splice closures)",
  "measurement": "dB loss per 100m segment from OTDR + visual/mechanical bend-radius measurement at suspected points",
  "expectedEffect": "Excess loss localized to 1-3 specific segments at building entries / conduit turns; visual confirms bends below 30mm radius at those points",
  "confoundersToControl": ["splice contribution (separated by OTDR localization)", "temperature-dependent bend loss"]
}
```

**Prior probability:** 0.333

---

### h3-intrinsic — Intrinsic fiber attenuation above spec

**Claim:** The deployed fiber spool has higher intrinsic loss than its 0.18 dB/km specification — possibly a manufacturing variance or contamination during cabling.

**Mechanism:** Intrinsic loss is a uniform per-km property; if the fiber's actual loss is 0.25–0.28 dB/km, the 10km run would show 2.5–2.8 dB intrinsic + 0.4 dB splice = 2.9–3.2 dB. Combined with one substandard splice this could explain 4.3 dB.

**Predictions:**
- OTDR shows uniform-rate loss across all inter-splice segments at ~0.25 dB/km.
- Splice losses are at-spec individually.

**Falsification condition:** OTDR shows inter-splice segments at-spec (0.18 dB/km) — uniform-rate excess loss is absent.

**Assumptions:**
- The fiber spool came from a single manufacturing lot (consistent loss rate across the run).
- Cabling-induced loss is not distinguishable from intrinsic at OTDR resolution.

**Experimental-design artefact (generic-experimental-setup):**
```json
{
  "artefactType": "generic-experimental-setup",
  "subject": "Same 10km fiber + lab-bench test of unspliced reference reel from the same lot",
  "manipulation": "Lab measurement of attenuation on a 1km reference reel from the same manufacturing lot, compared against deployed-run inter-splice OTDR rate",
  "measurement": "dB/km loss rate from both lab reference and OTDR",
  "expectedEffect": "Lab reference shows loss rate ≈ OTDR inter-splice rate, both ≈ 0.25 dB/km (above 0.18 spec)",
  "confoundersToControl": ["lab vs. field measurement conditions (temperature, launch)", "potential lot variance within the spool"]
}
```

**Prior probability:** 0.334

---

## Falsification Attacks

### attack-for-h1-connectors

```json
{
  "assignedHypothesisId": "h1-connectors",
  "discriminatingPrediction": "Bidirectional OTDR shows four discrete splice losses summing to ≥2 dB, with inter-splice segments at the 0.18 dB/km spec.",
  "siblingHypothesesRuledOutByDiscriminatingResult": ["h2-bend-radius", "h3-intrinsic"],
  "experimentalSetup": { "artefactType": "generic-experimental-setup" },
  "expectedInformationGain": "high",
  "costEstimate": "cheap",
  "rationale": "An OTDR trace from each end takes ~30 minutes and uses field-standard equipment. The trace directly distinguishes localized splice loss from distributed segment loss, ruling out both siblings if h1's signature holds."
}
```

### attack-for-h2-bend-radius

```json
{
  "assignedHypothesisId": "h2-bend-radius",
  "discriminatingPrediction": "OTDR shows excess loss localized to 1-3 specific 100m segments (not uniformly distributed and not at splices); visual/mechanical inspection at those segments confirms bend radius below 30mm.",
  "siblingHypothesesRuledOutByDiscriminatingResult": ["h1-connectors", "h3-intrinsic"],
  "experimentalSetup": { "artefactType": "generic-experimental-setup" },
  "expectedInformationGain": "high",
  "costEstimate": "cheap",
  "rationale": "Same OTDR trace used by the h1 attack, with added physical-inspection survey of likely violation points (~2 hours of crew time). Ruling out h1 (no large splice losses) and h3 (segment loss is localized, not uniformly elevated) is a single trace + targeted physical check."
}
```

### attack-for-h3-intrinsic

```json
{
  "assignedHypothesisId": "h3-intrinsic",
  "discriminatingPrediction": "Lab-bench attenuation measurement on a 1km reference reel from the same manufacturing lot shows ~0.25 dB/km (above 0.18 spec); OTDR inter-splice rate on the deployed fiber matches.",
  "siblingHypothesesRuledOutByDiscriminatingResult": ["h1-connectors", "h2-bend-radius"],
  "experimentalSetup": { "artefactType": "generic-experimental-setup" },
  "expectedInformationGain": "medium",
  "costEstimate": "moderate",
  "rationale": "Requires a reference reel from the same lot (procurement lead time + lab access). Cost is higher than the in-situ OTDR attacks, and the discriminating signal can be confounded by lab-vs-field measurement conditions."
}
```

---

## Bayesian Synthesis

```json
{
  "priors": {
    "priorSource": "uniform",
    "rationale": "The installation log doesn't favor any one cause; all three are plausible primary drivers for a 4.3 dB anomaly on a 10km run with four field splices.",
    "values": { "h1-connectors": 0.333, "h2-bend-radius": 0.333, "h3-intrinsic": 0.334 }
  },
  "posteriorLandscape": [
    {
      "experimentId": "attack-for-h1-connectors",
      "ifPredictionHolds": { "h1-connectors": "up", "h2-bend-radius": "down", "h3-intrinsic": "down" },
      "ifPredictionFails": { "h1-connectors": "down", "h2-bend-radius": "unchanged", "h3-intrinsic": "unchanged" },
      "informationGain": "high"
    },
    {
      "experimentId": "attack-for-h2-bend-radius",
      "ifPredictionHolds": { "h1-connectors": "down", "h2-bend-radius": "up", "h3-intrinsic": "down" },
      "ifPredictionFails": { "h1-connectors": "unchanged", "h2-bend-radius": "down", "h3-intrinsic": "unchanged" },
      "informationGain": "high"
    },
    {
      "experimentId": "attack-for-h3-intrinsic",
      "ifPredictionHolds": { "h1-connectors": "down", "h2-bend-radius": "down", "h3-intrinsic": "up" },
      "ifPredictionFails": { "h1-connectors": "unchanged", "h2-bend-radius": "unchanged", "h3-intrinsic": "down" },
      "informationGain": "medium"
    }
  ],
  "crucibleExperiment": {
    "experimentId": "attack-for-h2-bend-radius",
    "rationale": "The h1 and h2 attacks share the same OTDR trace — running it once produces evidence for BOTH attacks. The h2 attack adds a physical-inspection survey (~2 hours of crew time) that produces direct confirmatory evidence (visible sub-30mm bends), distinguishing it from the indirect statistical signature in h1's pure-OTDR result. Net: same OTDR cost, slightly more crew time, but localized + visually confirmed discrimination. h2's attack is the crucible test by a narrow margin over h1's; h3 is dominated by both."
  },
  "researchRoadmap": [
    { "order": 1, "experimentId": "attack-for-h2-bend-radius" },
    { "order": 2, "experimentId": "attack-for-h3-intrinsic", "conditionalOn": "OTDR shows uniform-rate excess loss across all inter-splice segments (h2 signature absent, h1 signature absent — strongly suggests h3)" }
  ],
  "learningObjective": "When multiple hypotheses share a common measurement (OTDR trace here), the crucible-experiment ranking can shift on small differences in collateral evidence: a physical survey that confirms a visual signature is worth more than an OTDR result alone. The cost-info-gain calculus is not just about the primary measurement."
}
```

---

## Crucible Experiment — `attack-for-h2-bend-radius`

**Design:** Bidirectional OTDR trace from both ends of the 10km run + visual/mechanical bend-radius survey at suspected violation points.

**Subject:** Deployed 10km fiber.

**Manipulation:** OTDR measurement (no fiber-state change) + crew physical inspection at building entries, conduit turns, and splice closures.

**Measurement:** dB loss per 100m segment from OTDR; bend-radius measurement at flagged inspection points using a bend-radius gauge.

**Expected discriminating result:** Excess loss localized to 1–3 specific segments at building entries / conduit turns; visual confirms bends below 30mm radius at those points.

**Cost:** Cheap — OTDR is field-standard equipment, ~30 minute trace; crew inspection adds ~2 hours. No new procurement.

---

## Research Roadmap

| Order | Experiment | Conditional on |
|---|---|---|
| 1 | `attack-for-h2-bend-radius` (OTDR + physical-inspection survey) | — (the crucible test) |
| 2 | `attack-for-h3-intrinsic` (lab measurement of reference reel from same lot) | OTDR shows uniform-rate excess loss; bend-radius violations absent; splice losses at-spec |

The h1 attack is folded into step 1's OTDR trace and does not need a separate experiment.

---

## Learning Objective

When multiple hypotheses share a common measurement, the crucible-experiment ranking can shift on small differences in collateral evidence. Here the OTDR trace serves both h1 and h2 attacks; the deciding factor was h2's added physical-inspection survey, which produces direct confirmatory evidence at low marginal cost. The cost-info-gain calculus is not just about the primary measurement — it's about the total evidence the experiment produces per unit of crew time.
