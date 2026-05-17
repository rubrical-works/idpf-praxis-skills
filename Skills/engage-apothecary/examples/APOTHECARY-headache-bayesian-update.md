# APOTHECARY — Hypothetical sub-acute headache: Bayesian update intuition

> This is educational reasoning only, not medical advice. Not for point-of-care decisions. Consult a licensed clinician for individual patient care.

## Metadata

- **Date:** 2026-05-16
- **Skill:** engage-apothecary
- **Scenario type:** bayesian-intuition
- **Paths Explored:** 3 (mechanistic / mnemonic-driven / Bayesian-pretest)
- **Recency window:** 10 years

---

## Educational Scenario

A hypothetical 35-year-old with a recurring, throbbing, unilateral headache lasting 4-8 hours, occurring 2-3 times per month, accompanied by photophobia and nausea. No prior neurological imaging. Family history of similar headaches in mother. This is an educational hypothetical for teaching Bayesian-update intuition in a high-pre-test-probability scenario.

---

## Differentials Explored

| Path | Paradigm | Differential | One-sentence rationale |
|---|---|---|---|
| 1 | mechanistic | Migraine without aura | Recurring unilateral throbbing + photophobia + nausea fits classic migraine phenotype. |
| 2 | mnemonic-driven (VITAMIN-CDE) | Cluster headache | "Vascular" category — periodic recurrence pattern fits, though duration is longer than typical cluster (15-180 min). |
| 3 | Bayesian-pretest | Secondary headache (e.g., intracranial mass) | Pre-test probability matters: in a 35-year-old without red-flag features, the prior is very low. |

---

## Differential Briefs

### Path 1 — Migraine without aura (mechanistic)

- **Diagnosis:** Migraine without aura (ICD G43.0)
- **Mechanism:** Trigeminovascular activation with release of CGRP and other neuropeptides produces meningeal sensitization and the characteristic throbbing quality. Family history is a known risk factor.
- **Test characteristics:** Diagnosis is clinical (ICHD-3 criteria). No specific blood test or imaging confirms. Imaging is for ruling out secondary causes, not ruling in migraine.

### Path 2 — Cluster headache (mnemonic-driven, Vascular)

- **Diagnosis:** Cluster headache (ICD G44.0)
- **Mechanism:** Episodic activation of the hypothalamic-trigeminovascular axis. Pain is typically retro-orbital, severe, and short (15-180 min).
- **Test characteristics:** Diagnosis is clinical. Duration in this scenario (4-8 hours) is too long for typical cluster — argues against.

### Path 3 — Secondary headache (Bayesian-pretest)

- **Diagnosis:** Secondary headache — intracranial mass, vascular abnormality, or other space-occupying lesion
- **Mechanism:** Multiple — depends on which secondary cause. Mass effect, vascular displacement, or inflammation can produce headache.
- **Test characteristics:** MRI brain — high sensitivity for intracranial mass (LR+ in symptomatic patients is large but the *base rate* is small).

---

## Red-Flag Advocate

**Must-not-miss diagnosis:** Subarachnoid hemorrhage (or other catastrophic intracranial event — meningitis, cerebral venous sinus thrombosis)

**Sharing-features rationale:** Recurrent headache is not subarachnoid hemorrhage's typical presentation (SAH is classically a single "thunderclap" event). But in the *teaching* of red-flag advocacy, asking "what's the worst thing this could be?" forces the cognitive discipline of checking for SAH features even when the leading diagnosis is migraine — sudden onset, "worst headache of life," neck stiffness, neurological deficits, headache different in character from prior headaches.

**Ruling-out test:** Detailed history asking about *changes in pattern* (qualitative impact: strong-rule-out when the headache pattern has been stable for years). The cheapest "test" here is the history itself — if pattern stability is confirmed, the SAH/CVST/meningitis priors drop sharply.

**Consequence of missing severity:** `catastrophic` — untreated SAH carries 50% short-term mortality; the "miss" outcome is a known cause of preventable mortality.

The red-flag-advocate output explicitly notes that the must-not-miss diagnosis is *not* the most-likely diagnosis in this scenario. That is the point: the cognitive discipline is checking for it, not predicting it.

---

## Bayesian Pre/Post-Test Synthesis

### Pre-test probabilities

| Differential | Pre-test probability | Basis |
|---|---|---|
| Migraine without aura | ~0.80 | Literature-cited — recurring throbbing unilateral headache with photophobia/nausea + family history has very high migraine prior in this age group. |
| Cluster headache | ~0.05 | Assumption-based — base rate of cluster is low; duration mismatch lowers further. |
| Secondary headache (any) | ~0.02 | Literature-cited — base rate of secondary headache in young adults without red-flag features is ≤2%. |

### Highest-impact test

**Test:** Brain MRI with contrast.
**Target differentials:** Secondary headache (rule out); migraine and cluster unaffected.
**Qualitative impact:** Negative MRI strongly rules out structural causes (qualitativeImpact: `strong-rule-out`). LRs not well-published for asymptomatic-screening contexts.

### Post-test probability landscape

| Differential | Positive MRI post-test | Negative MRI post-test |
|---|---|---|
| Migraine without aura | ~0.30 (a positive MRI changes the picture substantially — secondary cause becomes leading) | ~0.85 (slight rise — confirmation that no secondary cause exists) |
| Cluster headache | ~0.05 (unchanged) | ~0.06 (essentially unchanged) |
| Secondary headache | rises sharply | ~0.002 (effectively ruled out) |

### Educational Learning Objective

This is the **counterpart** to the chest-pain example's "high-sensitivity rule-out at low pre-test probability." Here we have a *high pre-test probability for migraine* and a question of whether to image. The Bayesian intuition: when pre-test probability of the leading diagnosis is already ~80%, even a negative imaging test only raises it to ~85% — small information gain at high cost. Imaging in this scenario is not for confirming migraine; it is for the rare case where the MRI shows something unexpected and re-frames the diagnosis. *High pre-test probability + sensitive test ≠ large probability update.* This is the asymmetry between rule-in and rule-out testing.

---

## Educational Learning Summary

The case teaches when imaging is — and is *not* — high-value in headache workup. The mechanistic and mnemonic-driven paths arrive at the same leading diagnosis (migraine). The red-flag advocate forces the SAH/CVST/meningitis check even though the prior is very low. The Bayesian synthesis names the actual decision: at 80% pre-test probability, imaging produces a small probability update on the leading diagnosis — its value is in catching the unexpected 2%, not in confirming the 80%. This is a different Bayesian lesson from the chest-pain example: there, a sensitive rule-out test produced a large update; here, the same kind of test at a different pre-test probability produces a small one.

---

This is educational reasoning only, not medical advice. Not for point-of-care decisions. Consult a licensed clinician for individual patient care.
