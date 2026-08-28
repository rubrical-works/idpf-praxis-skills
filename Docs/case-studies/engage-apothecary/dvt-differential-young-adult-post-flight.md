# Case Study: Post-flight unilateral leg swelling — differential reasoning

> **Disclaimer.** This is educational reasoning only, not medical advice. Not for point-of-care decisions. Consult a licensed clinician for individual patient care.

**Skill:** [engage-apothecary](../../../Skills/engage-apothecary/)
**Run date:** 2026-05-17
**Differential paths:** 4 (+ 1 red-flag advocate, mandatory)
**Recency window:** 10 years (out-of-window sources flagged but not excluded — historical anchors like Barritt & Jordan and PIOPED II retained)
**Web research:** on
**Educational scenario:** de-identified hypothetical

---

## Framing preamble

This case study captures a real run of `engage-apothecary` against the classic post-flight DVT-vs-mimics teaching scenario. The question fits the skill because it is:

- **Educational, hypothetical, de-identified** — passes the load-bearing refusal gate (no patient names/DOBs/MRNs; no dosing/prescribing/individualized-treatment requests; no real-time acute-symptom report).
- **A canonical differential-diagnosis teaching case** — DVT and its mimics (SVT, ruptured Baker's cyst, cellulitis) all produce unilateral lower-leg swelling + tenderness, and the must-not-miss diagnosis (PE) is silent in roughly a third of DVT cases per published cohorts.
- **Anchored in well-published Bayesian arithmetic** — Wells score + age-adjusted D-dimer for both DVT and PE has IPD meta-analytic safety data, allowing a numerate pre/post-test synthesis rather than hand-waving.

**What to look for:**

- The **load-bearing refusal gate** ran first and passed (input is explicitly hypothetical + de-identified).
- Each differential brief carries **real, fetched citations** with declared evidence tier (`systematic-review` > `rct` > `cohort` > `case-control` > `case-series` > `expert-opinion`).
- The **red-flag advocate** is mandatory — silent omission would be a contract violation. Here PE is named with sharing-features rationale, cheapest ruling-out test, and severity classification.
- The **Bayesian synthesis** is mandatory and produces a named **educational learning objective** — the skill is a *reasoning trainer*, not a differential list.
- Fabricated quantitative LRs are forbidden. Where literature does not publish a clean sensitivity/specificity, briefs say so qualitatively.
- The **educational-only disclaimer** appears verbatim at top and bottom and cannot be suppressed.

**Citation decay caveat:** URLs were fetched on 2026-05-17. PubMed/PMC permalinks are stable; specialty-society guidelines (IDSA, ESC) may update; clinical-prediction-rule pages (MDCalc) are revised periodically. `fetchedAt` timestamps mark when the evidence was current.

---

## Educational scenario (restated, de-identified)

> A 28-year-old hypothetical patient presents for outpatient evaluation with sudden-onset unilateral lower-leg swelling and calf tenderness developing five days after a 12-hour international flight. The patient reports no chest pain, no dyspnoea, no fever, and no preceding knee symptoms. As a teaching exercise in differential-diagnosis reasoning and Bayesian pre/post-test intuition, the skill walks through the candidate diagnoses, the must-not-miss diagnosis, and the cheapest ruling-out test.

---

## Differentials explored

| # | Diagnosis | ICD-10 | One-sentence rationale |
|---|-----------|--------|------------------------|
| 1 | Deep Vein Thrombosis (DVT) | I82.4 | Canonical post-flight presentation; Virchow's-triad mechanism with paradoxically elevated travel-VTE incidence in <30y adults. |
| 2 | Superficial Vein Thrombosis (SVT) | I80.0 | Shares post-flight risk factor and thrombotic biology with DVT; ~18% of SVT has concomitant DVT (Di Minno meta-analysis). |
| 3 | Ruptured Baker's cyst | M71.2 | Classic DVT mimic ("pseudothrombophlebitis"); base-rate low in 28y without joint disease. |
| 4 | Cellulitis (lower extremity) | L03.115 | ~41% misdiagnosis rate vs mimics; absent erythema/warmth/fever in vignette makes pre-test probability modest. |
| ⚠ | **Pulmonary Embolism (PE) — must-not-miss** | I26.99 | Silent PE present in ~32% of DVT diagnoses (Stein systematic review); cheap ruling-out test exists. |

---

## Differential briefs

### 1. Deep Vein Thrombosis (DVT) — I82.4

**Mechanism.** DVT formation reflects Virchow's triad: venous stasis, endothelial injury, and hypercoagulability. A 12-hour flight produces prolonged lower-limb immobility with cramped seating, compressing popliteal veins and stagnating flow in calf venous sinuses. Cabin hypobaric hypoxia activates coagulation (elevated thrombin-antithrombin complexes, factor VIIa), and low cabin humidity plus reduced fluid intake promote hemoconcentration. Thrombi most commonly initiate in soleal/gastrocnemius sinuses and posterior tibial valve pockets (distal/calf DVT) and may propagate proximally to popliteal/femoral veins, where embolic risk is highest. Sudden-onset unilateral calf swelling and tenderness 3–14 days post-flight fits the typical latency window. Although baseline VTE risk in a 28-year-old is low, cohort data show post-flight incidence is paradoxically elevated in travelers under 30; co-factors (oral contraceptives, tall/short stature, obesity, thrombophilia) further raise risk.

**Test characteristics.**

| Test | Sens | Spec | LR+ | LR− | Notes |
|------|------|------|-----|-----|-------|
| Wells (DVT) + high-sensitivity D-dimer | Wells ≥2 ~86%; combined Wells-low + D-dimer-neg qualitative very high NPV (>98%) | Wells ~70%; D-dimer alone ~46–52% | qualitative modest | qualitative strong when Wells-low AND D-dimer-neg (~0.05–0.10 in mgmt studies) | Standard outpatient algorithm; defers imaging when low + negative. |
| Compression ultrasound (proximal duplex) | ~94–96% (proximal) | ~97–98% | qualitative ~30–40 | qualitative ~0.04–0.06 | Confirmatory test of choice when Wells/D-dimer cannot rule out. |

**Contraindication reasoning.** Bilateral symmetric edema (systemic cause); absence of tenderness along deep venous tract with localized superficial cord (favors SVT); palpable popliteal mass with sudden "pop" (Baker's cyst rupture); sharply demarcated warmth + fever + portal of entry (cellulitis); recent unaccustomed exertion with focal muscle belly tenderness (muscle tear). A Wells-unlikely + negative high-sensitivity D-dimer reliably defers imaging.

**Evidence citations.**

| # | Tier | Claim | Source |
|---|------|-------|--------|
| c1 | case-control | Wells ≥2 sens ~86% / spec ~70%; combined with D-dimer rules out low-probability outpatients. | [Diagnostic value of the Wells score for lower-extremity DVT in hospitalized patients (SAGE, 2026)](https://journals.sagepub.com/doi/10.1177/02683555251409995) |
| c2 | systematic-review | Quantitative D-dimer pooled sens 0.96 / spec 0.52; negative result excludes DVT in low-Wells. | [Diagnostic accuracy of D-dimer for VTE — systematic review (PubMed, 2007)](https://pubmed.ncbi.nlm.nih.gov/17155963/) |
| c3 | systematic-review | Compression US for proximal DVT: sens 96% / spec 98% / NPV 99%. | [Three US strategies for DVT — meta-analysis (PMC, 2020)](https://pmc.ncbi.nlm.nih.gov/articles/PMC7012434/) |
| c4 | cohort | Long-haul flight ≥4h triples 8-wk symptomatic VTE incidence; ~1 event / 4,656 long-haul flights; +26% risk per 2h beyond 4h. | [Absolute risk of VTE after air travel — cohort (PLOS Medicine, 2007)](https://journals.plos.org/plosmedicine/article?id=10.1371/journal.pmed.0040290) |
| c5 | cohort | Travel-related VTE risk paradoxically elevated in <30 (IR 4.9/1000 PY post-flight; IRR 7.7 vs older). | (same PLOS Medicine cohort, subgroup) |
| c6 | expert-opinion | Travel-associated VTE: long duration + additional risk factor warrants heightened suspicion. | [Travel-associated VTE review (PMC, 2022)](https://pmc.ncbi.nlm.nih.gov/articles/PMC9149067/) |

### 2. Superficial Vein Thrombosis (SVT) — I80.0

**Mechanism.** SVT is thrombosis within the superficial venous system of the leg, most commonly the great saphenous vein and its tributaries. Pathogenesis follows Virchow's triad: venous stasis (prolonged immobility in a cramped seat during a 12-hour flight), endothelial activation (often potentiated by underlying varicosities), and a hypercoagulable shift (mild dehydration, hypobaric cabin). Unlike DVT, the thrombus sits above the muscular fascia, producing a palpable, tender, erythematous cord along the vein course rather than diffuse calf swelling. SVT shares post-flight risk factors and the same coagulation biology as DVT, which explains the well-documented ~18% concomitant DVT and ~7% concomitant PE found at SVT diagnosis. Extension toward the saphenofemoral junction is the principal mechanism by which isolated SVT progresses into symptomatic VTE.

**Test characteristics.**

| Test | Sens | Spec | LR+ | LR− | Notes |
|------|------|------|-----|-----|-------|
| Compression ultrasound (whole-leg / focused duplex) | qualitative high (symptomatic SVT) | qualitative high (~94–98% extrapolated from DVT-duplex; SVT-specific pooled estimates not well-published) | qualitative large | qualitative small/moderate | Same scan screens for concomitant DVT in ~18% of cases. |
| Clinical exam (palpable tender cord, erythema along vein course) | qualitative moderate | qualitative moderate | qualitative moderate | qualitative small | Insufficient alone — ~18% concomitant DVT mandates imaging. |

**Contraindication reasoning.** Diffuse calf swelling with >3 cm circumference difference (deep pattern); deep aching pain without overlying superficial vein involvement; absence of palpable superficial cord; pitting oedema extending above knee; systemic features suggesting cellulitis; pleuritic chest pain / dyspnoea / hypoxia raising PE concern. Note: SVT and DVT are *not* mutually exclusive.

**Evidence citations.**

| # | Tier | Claim | Source |
|---|------|-------|--------|
| c1 | systematic-review | Concomitant DVT in 18.1% (95% CI 13.9–23.3%) and PE in 6.9% (95% CI 3.9–11.8%) at SVT diagnosis. | [Di Minno meta-analysis (PubMed, 2016)](https://pubmed.ncbi.nlm.nih.gov/26845754/) |
| c2 | rct | CALISTO: fondaparinux 2.5mg SC × 45d reduced composite VTE/SVT-extension from 5.9% → 0.9% (n=3002). | [CALISTO trial (PubMed, 2010)](https://pubmed.ncbi.nlm.nih.gov/20860504/) |
| c3 | expert-opinion | Duplex US is diagnostic method of choice for SVT (Brazilian Soc. of Angiology, evidence 2B). | [SVT guidelines (PMC, 2019)](https://pmc.ncbi.nlm.nih.gov/articles/PMC6880617/) |
| c4 | systematic-review | Varicose veins in ~90% of lower-limb SVT; immobilization is recognized provoker. | [SVT comprehensive review (PMC, 2024)](https://pmc.ncbi.nlm.nih.gov/articles/PMC10888259/) |
| c5 | cohort | Long-haul flight ≥8h doubles risk of leg vein thrombosis including SVT and calf-muscle events. | [VT after long-haul flights (JAMA Intern Med, 2003)](https://jamanetwork.com/journals/jamainternalmedicine/fullarticle/757492) |

### 3. Ruptured Baker's cyst (popliteal cyst) — M71.2

**Mechanism.** A Baker's cyst forms when synovial fluid herniates posteriorly through a valve-like communication between the knee joint and the gastrocnemio-semimembranosus bursa, lying between the medial gastrocnemius head and semimembranosus tendon. Chronic intra-articular pathology (meniscal tear, OA, RA) generates effusion that one-way valves trap into the bursa. Rupture decompresses the cyst into the medial gastrocnemius fascial planes; inflammatory and proteolytic synovial fluid triggers sudden calf pain, swelling, warmth, and sometimes dependent ecchymosis tracking to the medial malleolus ("crescent sign"), mimicking DVT (pseudothrombophlebitis). A 28-year-old without prior knee OA, RA, meniscal injury, or chronic effusion carries a low base-rate because the predisposing intra-articular pathology is typically absent; the long-haul flight history is a DVT risk factor, not a Baker's cyst trigger, so it is incidental to this differential.

**Test characteristics.**

| Test | Sens | Spec | LR+ | LR− | Notes |
|------|------|------|-----|-----|-------|
| Compression US (popliteal fossa + calf) | qualitative high | qualitative high | qualitative large | qualitative moderate | Same duplex used for DVT identifies cyst; MRI when uncertain. |
| Crescent sign (medial-malleolar ecchymosis) | qualitative low | qualitative high (when present) | qualitative large (when present) | qualitative near 1 | Rule-in clue, not rule-out test. |

**Contraindication reasoning.** No knee OA/RA/meniscal injury history; no preceding posterior-knee fullness or knee pain; swelling extends above knee or symmetrical; absent crescent sign (weak); flight history favors thrombotic etiology over cyst rupture. Definitive arbitration requires the same compression US that evaluates for DVT.

**Evidence citations.**

| # | Tier | Claim | Source |
|---|------|-------|--------|
| c1 | expert-opinion | Baker's cysts predominantly affect adults 35–70; prevalence rises with age due to knee-bursal communication. | [Baker's Cyst — StatPearls (NCBI, 2023)](https://www.ncbi.nlm.nih.gov/books/NBK430774/) |
| c2 | cohort | Of 3,072 patients undergoing duplex for DVT: 3.1% Baker's cysts; 10 ruptured; 7 had coexistent DVT. | [Baker's cysts mimicking DVT — duplex cohort (PubMed, 1997)](https://pubmed.ncbi.nlm.nih.gov/9129621/) |
| c3 | case-series | Crescent sign described as principal clinical sign differentiating ruptured cyst from DVT; physical exam alone often insufficient. | [Crescent sign of ruptured Baker's cyst (PMC, 2019)](https://pmc.ncbi.nlm.nih.gov/articles/PMC6732489/) |
| c4 | cohort | Baker's cyst prevalence 20–40% in knee OA patients (mean age ~63), correlating with K-L severity. | [Baker's cyst with knee OA (PMC, 2021)](https://pmc.ncbi.nlm.nih.gov/articles/PMC8739941/) |
| c5 | case-series | US preferred over MRI for initial workup; **anticoagulating a misdiagnosed ruptured cyst can precipitate compartment syndrome**. | [Ruptured Baker cyst case report (JUCM, 2023)](https://www.jucm.com/ruptured-baker-cyst-is-an-uncommon-complication-of-a-common-diagnosis-a-case-report/) |

### 4. Cellulitis (lower extremity) — L03.115

**Mechanism.** Non-purulent cellulitis is an acute bacterial infection of dermis and subcutaneous tissue, most often caused by beta-hemolytic *Streptococcus* (less commonly *S. aureus*). Bacteria gain entry through a skin breach — tinea pedis with toe-web maceration, abrasion, eczema, insect bite, or minor trauma — and spread via lymphatics, producing the classic tetrad of erythema, warmth, swelling, and tenderness, sometimes with systemic features (fever, tachycardia, leukocytosis). In a 28-year-old after a 12-hour flight, prolonged occlusive footwear and humid foot environments plausibly macerate the toe webs and seed infection. However, the clinical signs that suggest cellulitis are highly nonspecific — pooled misdiagnosis rate ~41% across nine studies.

**Test characteristics.**

| Test | Sens | Spec | LR+ | LR− | Notes |
|------|------|------|-----|-----|-------|
| Clinical exam (erythema, warmth, defined borders, systemic signs) | moderate–high for unambiguous presentations | poor (~41% misdiagnosis pooled) | qualitative weak | qualitative weak | No single sign diagnostic; bilateral presentation argues against. |
| ALT-70 (Asymmetry+3, Leukocytosis+1, Tachycardia+1, age≥70 +2) | 97.8% at ≥3 | 47.6% at ≥3 | 1.9 | 0.05 | Designed for ED-presenting lower-extremity cellulitis; here likely score=3 (Asymmetry only) → indeterminate. Strength is ruling OUT at low scores. |
| WBC + CRP | qualitative (frequently normal) | qualitative (also elevated in DVT/gout/sepsis) | qualitative modest | qualitative weak | Adjunct only. |

**Contraindication reasoning.** Vignette lacks erythema, warmth, defined borders, fever, malaise, or skin breach; ALT-70 likely indeterminate; temporal anchor (5d post-flight) fits VTE better than bacterial inoculation; calf tenderness without skin changes more consistent with intramuscular/venous pathology.

**Evidence citations.**

| # | Tier | Claim | Source |
|---|------|-------|--------|
| c1 | systematic-review | Pooled cellulitis misdiagnosis ~41% (95% CI 28–56%, 9 studies, n=1,600). | [Misdiagnosis of uncomplicated cellulitis — meta-analysis (PMC, 2023)](https://pmc.ncbi.nlm.nih.gov/articles/PMC10406744/) |
| c2 | cohort | Weng: 30.5% of admitted lower-extremity cellulitis misdiagnosed; national projected harm 50–130K unnecessary admissions, $195–515M/year. | [Costs of misdiagnosed cellulitis (PubMed, 2017)](https://pubmed.ncbi.nlm.nih.gov/27806170/) |
| c3 | cohort | ALT-70 score thresholds: 0–2 → >83% pseudocellulitis; 5–7 → >82% true cellulitis. | [ALT-70 score on MDCalc](https://www.mdcalc.com/calc/3998/alt-70-score-cellulitis) |
| c4 | cohort | Prospective ALT-70 validation: sens 97.8% / spec 47.6% / LR+ 1.9 / LR− 0.05 at cutoff ≥3 vs dermatology criterion. | [AAFP POEM summary of Li prospective validation (AAFP, 2021)](https://www.aafp.org/pubs/afp/issues/2021/0900/p309.html) |
| c5 | expert-opinion | IDSA SSTI guideline: cellulitis diagnosed clinically; routine blood cultures/biopsy not recommended for uncomplicated non-purulent cellulitis. | [IDSA 2014 SSTI guideline (Oxford CID)](https://academic.oup.com/cid/article/59/2/e10/2895845) |
| c6 | systematic-review | Bilateral lower-extremity cellulitis extremely rare; bilateral red/swollen legs almost always pseudocellulitis. | [Diagnostic criteria for lower-limb cellulitis — review (PMC, 2019)](https://pmc.ncbi.nlm.nih.gov/articles/PMC6916392/) |

---

## Red-flag advocate (mandatory, one per invocation)

**Must-not-miss diagnosis:** Pulmonary Embolism (PE) — ICD-10 I26.99
**Consequence severity:** **catastrophic**

**Sharing-features rationale.** PE shares the post-flight prolonged-immobility risk factor with DVT and frequently coexists with it silently. Stein's systematic review found silent PE in ~32% of DVT patients (27% by stricter PIOPED criteria), meaning a clinically obvious DVT carries roughly a 1-in-3 chance of concomitant PE even when the patient denies chest pain or dyspnoea. The cognitive trap is anchoring on the leg findings and inferring *"no respiratory symptoms = no PE."* Embolisation in DVT is a continuous process; today's silent subsegmental PE can become tomorrow's syncope, RV strain, or sudden death. Suspected DVT therefore obligates explicit PE pre-test probability assessment.

**Cheapest ruling-out test:** Wells score (PE) + age-adjusted D-dimer (PERC may be applied if pre-test probability is very low).

**Rationale.** For a 28-year-old with a clear provoking factor but no cardiopulmonary symptoms, Wells is likely low/unlikely. The Wells + age-adjusted D-dimer pathway is the cheapest defensible rule-out: an IPD meta-analysis (van Es 2017) reported a 3-month failure rate of ~0.8–0.9% — well within accepted safety thresholds — while increasing the proportion of patients ruled out without imaging. CTPA is reserved for moderate/high pre-test probability or positive D-dimer, avoiding unnecessary contrast and radiation in a young patient.

| Test | Sens | Spec | LR+ | LR− | Notes |
|------|------|------|-----|-----|-------|
| Wells (PE) + age-adjusted D-dimer | combined 3-month failure rate ~0.8–0.9% (van Es 2017) | D-dimer alone qualitative poor; age-adjustment improves | D-dimer LR+ qualitative weak (~1.5–2) | Wells-low + age-adj-Dd-neg NPV ~99.6% (strong LR− in low-prob stratum) | Cheapest defensible rule-out path. |
| CTPA (escalation) | 83% (PIOPED II) | 96% (PIOPED II) | strong in intermediate/high prob (PPV 92–96%) | NPV falls to ~60% when pre-test prob high — imaging cannot rescue a poor clinical assessment | Reserved for D-dimer positive or Wells moderate/high. |

**Consequence rationale.** Barritt & Jordan (1960) found 5 of 19 untreated PE patients died (~26%) plus 5 non-fatal recurrences; the trial was stopped early on ethical grounds. Modern treated PE 14-day mortality is ~10% and 90-day ~20%, but early anticoagulation in the ED reduces 30-day mortality from 15.3% to 4.4%. Stein also showed recurrent PE rates rise from 0.6% to 5.1% when silent PE is present at DVT diagnosis. The asymmetry — cheap rule-out test vs. sudden cardiac death — is what defines "must-not-miss."

**Evidence citations.**

| # | Tier | Claim | Source |
|---|------|-------|--------|
| c1 | systematic-review | Silent PE in ~32% (27% by strict PIOPED criteria) of DVT patients; recurrent PE 5.1% vs 0.6%. | [Silent PE in DVT — systematic review (Am J Med, 2010)](https://www.amjmed.com/article/S0002-9343(09)01111-5/abstract) |
| c2 | systematic-review | Wells + age-adjusted D-dimer 3-month failure rate ~0.8–0.9%. | [Original/simplified Wells + age-adj D-dimer IPD meta-analysis (Wiley, 2017)](https://onlinelibrary.wiley.com/doi/full/10.1111/jth.13630) |
| c3 | rct | Barritt & Jordan: 5/19 untreated PE patients died; none of 16 treated; trial stopped on ethical grounds. | [Mortality of untreated PE in ED (Annals of EM, 2005)](https://www.annemergmed.com/article/S0196-0644(04)01494-5/abstract) |
| c4 | expert-opinion | ESC 2019: Wells/Geneva pre-test probability (Class I); D-dimer initial test in low/intermediate; CTPA sens 83% / spec 96% (PIOPED II). | [2019 ESC PE Guidelines (Eur Heart J)](https://academic.oup.com/eurheartj/article/41/4/543/5556136) |

---

## Bayesian pre/post-test synthesis (mandatory)

### Pre-test probabilities (basis: assumption-based, illustrative)

For this 28-year-old, post-flight, unilateral calf swelling + tenderness, no chest/respiratory symptoms reported, no skin findings reported, no joint disease, no prior VTE — the differentials are not mutually exclusive (DVT and SVT and PE can coexist) so probabilities do not sum to 1.0.

| Differential | Pre-test probability | Basis |
|--------------|---------------------:|-------|
| DVT | ~25–35% | Wells likely 1–2 (calf swelling +1; localized tenderness along deep veins +1; recent immobilization +1); travel-VTE risk paradoxically elevated in <30 (Schwarz 2003, Kuipers 2007). Cohort literature places Wells-likely outpatient pre-test probability in the 20–35% band. |
| SVT | ~10–15% | Possible, especially if a palpable tender cord is later identified. Lower without that finding. Di Minno: ~18% of clinically diagnosed SVT have concomitant DVT — non-independence. |
| PE (must-not-miss) | ~10–15% | Conditional on DVT presence: Stein silent-PE prevalence ~32% × DVT pre-test 25–35% ≈ 8–11% baseline. Slightly higher when independent post-flight PE risk added. |
| Ruptured Baker's cyst | ~2–5% | No predisposing joint disease in 28y; flight is incidental. Bishop 1997 cohort: ~3.1% of DVT-suspect patients had Baker's cyst. |
| Cellulitis | ~5–10% | No erythema/warmth/fever in vignette; ALT-70 likely indeterminate at most. Misdiagnosis literature suggests cellulitis-vs-pseudocellulitis is high-prior only when classic skin signs are present. |
| Other (post-flight oedema, muscle tear, etc.) | residual | Not enumerated as a separate path. |

### Highest-impact test (single)

**Wells score (DVT) + high-sensitivity quantitative D-dimer.**

| Target differential | Likelihood-ratio impact |
|---------------------|------------------------|
| DVT | LR− qualitative ~0.05–0.10 when Wells-low + D-dimer-negative — strong rule-out. LR+ ~1.5–2 when D-dimer positive (non-specific). |
| PE | LR− qualitative ~0.05 when Wells-low + age-adjusted D-dimer-negative (NPV ~99.6%) — strong rule-out. CTPA reserved for positive. |
| SVT | D-dimer non-specific; ultrasound (often the same scan) becomes the discriminating test. |
| Baker's cyst | D-dimer not affected by cyst; same ultrasound that excludes DVT identifies the cyst. |
| Cellulitis | D-dimer non-specific; ALT-70 and clinical exam discriminate. |

The diagnostic efficiency comes from the fact that **one cheap, sensitive screening test (D-dimer) simultaneously rules out the most likely diagnosis (DVT) AND the must-not-miss diagnosis (PE)** when paired with their respective Wells scores. A positive D-dimer escalates to compression ultrasound (which also identifies Baker's cyst incidentally) and Wells-stratified imaging for PE.

### Post-test probability landscape (qualitative)

| Differential | If Wells-low + D-dimer NEGATIVE | If D-dimer POSITIVE (escalate) |
|--------------|--------------------------------:|-------------------------------:|
| DVT | ~2% (effectively ruled out at ~25–35% prior) | Rises substantially → compression US confirms/excludes |
| PE | ~0.4% (effectively ruled out, NPV ~99.6%) | Wells (PE) restratifies; CTPA if moderate/high |
| SVT | Unchanged-to-down — US needed regardless if symptoms persist | Unchanged-to-up; US discriminates |
| Baker's cyst | Unchanged (D-dimer not relevant); US (if obtained) identifies | Unchanged; US (if escalated) identifies |
| Cellulitis | Unchanged (D-dimer not specific); rely on clinical course + ALT-70 | Unchanged; D-dimer is not a cellulitis test |

### Educational learning objective

**When two differentials share a risk factor and a screening test, the diagnostic workup compounds — failing to consider both leaves the must-not-miss diagnosis silently uninvestigated.** Here, the same Wells + age-adjusted D-dimer pathway that rules out DVT also rules out the silent PE that makes DVT clinically important. Stein's ~32% silent-PE prevalence is the load-bearing number: omitting the PE pre-test probability assessment in a DVT workup is a *cognitive* failure (anchoring on "no chest pain"), not a *diagnostic* one. The Bayesian intuition: combine pre-test probability (Wells) with a sensitive-but-nonspecific test (D-dimer) to either rule out OR escalate — the test's value is in its **NPV**, not its PPV.

The numerate complement: in the Wells-low stratum, an NPV of ~99.6% leaves a residual ~0.4% post-test probability of PE. That is below the 1.85% accepted-safety threshold from the Christopher Study tradition, which is what makes the rule-out *defensible*. In a Wells-high patient, the same negative D-dimer cannot rescue you — the post-test probability stays above the threshold, and CTPA is required. **The same test is informative in one stratum and uninformative in another — pre-test probability is what does the work.**

---

## Educational learning summary

This case teaches three intertwined reasoning patterns. **First**, anatomically adjacent presentations (DVT, SVT, ruptured Baker's cyst, cellulitis) share enough surface features that no single physical sign discriminates reliably — bedside examination must be paired with a structured pre-test probability (Wells) plus a sensitive-but-nonspecific test (D-dimer). **Second**, the clinically dominant differential (DVT) is not the most dangerous (PE); the must-not-miss is silent in roughly a third of cases, and asking "what's the must-not-miss?" is a load-bearing cognitive habit, not an optional one. **Third**, Bayesian post-test probability depends on pre-test probability — the same negative D-dimer that rules out PE in a Wells-low patient does not rule it out in a Wells-high patient. Probability stratification is the work; the test is only a multiplier.

---

> **Disclaimer.** This is educational reasoning only, not medical advice. Not for point-of-care decisions. Consult a licensed clinician for individual patient care.

*Generated by `engage-apothecary` skill on 2026-05-17. 26 real citations across 5 evidence tiers (systematic-review, RCT, cohort, case-control, case-series, expert-opinion) and 12 distinct source domains. See [`Docs/case-studies/README.md`](../README.md) for the case-studies-vs-examples contract.*
