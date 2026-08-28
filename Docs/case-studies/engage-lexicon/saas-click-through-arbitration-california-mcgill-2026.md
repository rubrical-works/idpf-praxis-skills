# Case Study: SaaS Click-Through Arbitration Clause vs. California Procedural Unconscionability (2026)

**Skill:** [engage-lexicon](../../../Skills/engage-lexicon/)
**Run date:** 2026-05-18
**Domain:** consumer arbitration / FAA preemption / California unconscionability doctrine
**Mode:** debate (default)
**Jurisdiction (declared at gate):** US-CA (California substantive law) with US-Federal procedural overlay under the FAA
**Fetch budget:** 4 per advocate
**Rounds:** 1 (judge resolved on first pass; round-two not triggered)
**Verdict:** revise — qualified-survival narrowing
**Confidence:** high
**Audience caveat:** California-admitted lawyers and policy/compliance teams using this as a starting point for further professional review. **Not for direct reliance by any party in any matter.**

---

## Educational-Only Output — Not Licensed Legal Advice

> **Educational-only output.** The following is informational and educational, produced by an automated debate-prism-pattern analyst over live web research on 2026-05-18 under declared jurisdiction `US-CA`. It is **not licensed legal advice**, does not establish an attorney-client relationship, and is not protected by attorney-client privilege. It is not a substitute for consultation with a licensed attorney admitted in `US-CA`. Named statutes, regulations, cases, and agency guidance are illustrative; their continuing applicability and force depend on facts not before this analyst (including subsequent legislative amendments, agency action, judicial supersession, and forum-specific procedural posture). You should consult a licensed attorney before acting.

---

## Framing preamble

This case study captures a real run of `engage-lexicon` against a directional legal claim that has been live in California consumer-arbitration practice since 2017 and remains contested in 2026: **whether a SaaS provider's mandatory binding-arbitration clause with class-action waiver, embedded in a click-through Terms of Service that an individual consumer accepted without negotiation, survives a procedural-unconscionability challenge under California law given the *McGill v. Citibank* (2017) doctrine and the FAA preemption framework**.

**Who would ask this, and why it matters.** A SaaS company's general counsel revising a consumer Terms of Service in 2026 sits at the intersection of two non-aligned doctrinal trajectories: the US Supreme Court's FAA-preemption line (*Concepcion* → *Epic Systems* → *Lamps Plus* → *Viking River*), which broadly shields arbitration clauses from state-law unconscionability rules that single arbitration out, and California's surviving consumer-protection doctrines that the Court has *not* preempted — most importantly the *McGill* rule against waiving public injunctive relief in any forum, plus California's sliding-scale unconscionability doctrine (*Armendariz* / *OTO v. Kho* / *Sanchez*) which treats adhesive click-through assent as carrying meaningful procedural unconscionability. The same draft clause can be defended as a clean win under the for-side authorities and attacked as substantially exposed under the against-side authorities — exactly the contested-direction shape `engage-lexicon` is built for. **The audience is a lawyer.** Lay readers can read this case study to see what disciplined adversarial legal analysis looks like; they should not operationalize any of its conclusions.

**What to look for in this run:**

- The **jurisdiction-declared gate** fires before any other step — the run declared `US-CA` with a federal FAA overlay at invocation; the skill would have halted if jurisdiction had been left blank.
- Every citation conforms to the **extended legal citation schema**: `jurisdiction`, `courtLevel`, `year`, `pinCite`, `authorityType`, `authorityWeight` (controlling vs. persuasive). The judge's controlling-vs-persuasive distinction is mandatory and is what makes this skill different from `/debate-prism`.
- **Two-axis diversity** is enforced: zero URL overlap between for- and against-citations AND authority-hierarchy diversity (the against-side carries controlling-authority tuples — *McGill*, *OTO*, *Blair v. Rent-A-Center* — that are not on the for-side).
- The judge produces a **`revise` verdict** narrowing the claim to qualified survival, names the **specific weakening evidence** with `authorityWeight` annotation, and identifies the **flip conditions** under which the revised claim would itself fail.
- The mandatory **educational-only disclaimer** is stamped at the top of this artefact verbatim from the skill's `SKILL.md` template — it is unconditional, not heuristic-triggered.

**Live-research transparency.** Two citation-evidence notes the reader should understand:

- The for-advocate's `webResearch.attemptedCalls` log records four clean Cornell LII fetches (`law.cornell.edu`) for the four US Supreme Court opinions it cites. Those URLs are the canonical syllabus/opinion pages for *Concepcion*, *Epic Systems*, *Lamps Plus*, and *Viking River*; they are well-known stable references. The log itself is idealized (all four success records cluster in a four-second window), but the underlying URLs and the cited holdings are verifiable independently.
- The against-advocate's `webResearch.attemptedCalls` log records the messier reality of live legal research: HTTP 403 from `law.justia.com`, HTTP 301 from `courts.ca.gov`, blank-body 200 from CourtListener, then successful fetches from Public Citizen's litigation page (`citizen.org`), Stanford SCOCAL (`scocal.stanford.edu`), a Kilpatrick Townsend law-firm commentary (`ktslaw.com`), and a ZwillGen secondary survey (`zwillgen.com`). The **Blair v. Rent-A-Center** citation in particular rests on the *ktslaw.com* secondary-source URL because the Ninth Circuit slip-opinion source returned blank during the live run; the holding it attributes to *Blair* is consistent with the well-documented post-*Blair* federal landscape, but the URL itself is commentary, not the opinion. This is flagged in the judge's degradation list below.

**Citation decay caveat.** URLs below were fetched on 2026-05-18. Cornell LII is stable. Stanford SCOCAL has historically been stable. Public Citizen litigation pages are stable as long as the case is active in their portfolio. Law-firm commentary URLs (`ktslaw.com`, `zwillgen.com`) are the most vulnerable to link rot. Treat each citation as evidence of what was published at the recorded timestamp, not as a permanent reference.

---

## Claim

> A SaaS provider's mandatory binding-arbitration clause with class-action waiver, embedded in a click-through Terms of Service that an individual consumer (not a business) accepted without negotiation, **SURVIVES** a procedural-unconscionability challenge under California law in 2026, because (a) *AT&T Mobility LLC v. Concepcion* (2011) and *Epic Systems Corp. v. Lewis* (2018) under the FAA preempt state-law rules that would invalidate the arbitration agreement or its class-action waiver, (b) California unconscionability doctrine requires both procedural and substantive unconscionability on a sliding scale and does not categorically render every adhesive consumer arbitration clause invalid, and (c) the *McGill v. Citibank* (2017) rule against waiving public injunctive relief is at most a narrow, severable defect, not a general death sentence for click-through arbitration clauses.

## Jurisdiction

`US-CA` — California substantive law governs the unconscionability analysis because the consumer is a California resident contracting with a California-seated (or California-presence) SaaS provider; the Federal Arbitration Act supplies the federal procedural overlay because the contract evidences a transaction involving commerce and the arbitration provision invokes FAA § 2. The Ninth Circuit is the federal-procedural overlay for California-seated SaaS consumer disputes. Alternative jurisdictions where this question could arise (e.g., other circuits applying California law in diversity, or California Supreme Court direct review of state-court adjudication) are noted but not adjudicated here.

## Research Plan

- **Authority anchors:**
  - *AT&T Mobility LLC v. Concepcion*, 563 U.S. 333 (2011) — FAA-preemption framework for state-law obstacle rules.
  - *Epic Systems Corp. v. Lewis*, 138 S. Ct. 1612 (2018) — individualized-proceedings command under the FAA.
  - *Lamps Plus, Inc. v. Varela*, 139 S. Ct. 1407 (2019) — class consent cannot be inferred from ambiguity.
  - *Viking River Cruises, Inc. v. Moriana*, 142 S. Ct. 1906 (2022) — partial preemption of *Iskanian*.
  - *McGill v. Citibank, N.A.*, 2 Cal. 5th 945 (2017) — unwaivability of public injunctive relief; FAA non-preemption.
  - *Blair v. Rent-A-Center, Inc.*, 928 F.3d 819 (9th Cir. 2019) — Ninth Circuit confirms McGill is not FAA-preempted.
  - *OTO, L.L.C. v. Kho*, 8 Cal. 5th 111 (2019) — sliding-scale unconscionability; oppression/surprise definitions.
  - *MacClelland v. Cellco P'ship*, 609 F. Supp. 3d 1024 (N.D. Cal. 2022) — mass-arbitration choke clause substantively unconscionable.

- **Source classes used:** controlling-case (US Supreme Court, California Supreme Court, Ninth Circuit), persuasive-case (federal district court within California), law-review / bar-publication (secondary-source confirmation of *Blair*'s holding).

- **Recency window:** Case law since 2011 (*Concepcion*) with priority weight on post-2018 federal authority (*Epic Systems*, *Lamps Plus*, *Viking River*) and post-2017 California authority (*McGill*, *Blair*, *OTO*, *MacClelland*). No statutes or regulations cited, so the Statutory Recency Gate is not engaged.

- **Freshness class:** general (72-hour threshold on recent case-law treatments). Not statutory, so no most-recent-amendment-date scan was required.

- **Authority preferences within US-CA + federal overlay:** US Supreme Court > California Supreme Court > Ninth Circuit > California Court of Appeal > federal district court within California > law-review / bar-publication.

- **Fetch budget:** 4 per advocate.

## Baseline

Primary agent's initial read: **lean revise.** The for-side's anchor cluster (*Concepcion* / *Epic Systems* / *Lamps Plus* / *Viking River*) is real and load-bearing on the question of *class-action-waiver* enforceability under the FAA — those decisions do preempt categorical California-only rules that single arbitration out. But the for-side's framing ("survives a procedural-unconscionability challenge") elides the *McGill* rule, which the California Supreme Court grounded in generally-applicable contract law (not arbitration-singling) and which the Ninth Circuit has held the FAA does not preempt. The honest baseline is that a typical 2026 click-through SaaS arbitration clause will survive a *generic* class-waiver-preemption challenge but is exposed on at least three independent fronts: (1) any "no public injunctive relief in any forum" language is unenforceable per *McGill*; (2) substantive-unconscionability vulnerabilities (mass-arbitration choke, asymmetric fees, short limitations) are independent and not saved by FAA preemption; (3) high procedural unconscionability in adhesive click-through formation lowers the substantive-unconscionability threshold under California's sliding scale. One grounding citation: the California Supreme Court's statement in *McGill* — accessed via the Public Citizen litigation page — that *"California law does not permit enforcement of any agreement that waives a claim for public injunctive relief, and . . . the FAA does not require enforcement of such an agreement merely because it is included in an arbitration agreement"* ([citizen.org/litigation/mcgill-v-citibank/](https://www.citizen.org/litigation/mcgill-v-citibank/)).

## For-Brief

### Core Position

Under California substantive law with the federal FAA procedural overlay, a click-through SaaS arbitration clause with class-action waiver survives a procedural-unconscionability challenge in 2026 because Section 2 of the Federal Arbitration Act, as construed by the Supreme Court in *Concepcion* and *Epic Systems*, preempts any California rule — common-law or statutory — that would treat adhesion plus a class-action waiver as categorically unconscionable. California's own unconscionability doctrine has never adopted such a categorical rule: it requires a sliding-scale showing of *both* procedural *and* substantive unconscionability, and an unnegotiated click-through ToS is at most "minimal" procedural unconscionability, which alone cannot invalidate a contract.

The *McGill* rule against waiving public-injunctive-relief claims is the only meaningful Californian remaining bite on adhesive arbitration clauses, and on its own terms it is narrow: it invalidates the *waiver of public injunctive relief*, not the *arbitration clause as a whole*, and standard severability language preserves the rest of the agreement. *Lamps Plus* and *Viking River Cruises* further confirm that the Supreme Court continues to police California rules that single arbitration agreements out for disfavored treatment, leaving the procedural-unconscionability ground of attack toothless in the click-through SaaS consumer context.

### Citations

| # | Title | URL | authorityType | authorityWeight | jurisdiction | courtLevel | year | pinCite | Excerpt |
|---|---|---|---|---|---|---|---|---|---|
| 0 | *AT&T Mobility LLC v. Concepcion*, 563 U.S. 333 | https://www.law.cornell.edu/supct/html/09-893.ZS.html | controlling-case | controlling | US-Federal (binding in US-CA) | supreme-court | 2011 | 563 U.S. at 352 (syllabus) | "Because it 'stands as an obstacle to the accomplishment and execution of the full purposes and objectives of Congress,' California's *Discover Bank* rule is pre-empted by the FAA." |
| 1 | *Epic Systems Corp. v. Lewis*, 138 S. Ct. 1612 | https://www.law.cornell.edu/supremecourt/text/16-285 | controlling-case | controlling | US-Federal (binding in US-CA) | supreme-court | 2018 | 138 S. Ct. at 1619 | "Congress has instructed in the Arbitration Act that arbitration agreements providing for individualized proceedings must be enforced." |
| 2 | *Lamps Plus, Inc. v. Varela*, 139 S. Ct. 1407 | https://www.law.cornell.edu/supremecourt/text/17-988 | controlling-case | controlling | US-Federal (binding in US-CA) | supreme-court | 2019 | 139 S. Ct. at 1415 | "[A] party may not be compelled under the FAA to submit to class arbitration unless there is a contractual basis for concluding that the party agreed to do so." |
| 3 | *Viking River Cruises, Inc. v. Moriana*, 142 S. Ct. 1906 | https://www.law.cornell.edu/supremecourt/text/20-1573 | controlling-case | controlling | US-Federal (binding in US-CA) | supreme-court | 2022 | 142 S. Ct. at 1924 | "The FAA preempts the rule of Iskanian insofar as it precludes division of PAGA actions into individual and non-individual claims through an agreement to arbitrate." |

### Analysis Summary

- **Step 1** (cites 0): FAA Section 2 supplies a substantive federal rule that binds California courts. *Concepcion* preempted California's *Discover Bank* rule — a state unconscionability gloss specific to consumer-adhesion arbitration with class-action waivers, exactly the doctrinal posture an unconscionability challenge to a SaaS click-through tries to reproduce today.
- **Step 2** (cites 0, 1): *Epic Systems* extends *Concepcion* and reiterates that arbitration agreements "providing for individualized proceedings must be enforced." A California court cannot import a per-se rule that a class-action waiver in an adhesive contract is substantively unconscionable.
- **Step 3** (cites 0, 1): California's *Armendariz*-line sliding scale requires *both* prongs. Minimal procedural unconscionability in a click-through (oppression in take-it-or-leave-it presentation, but no surprise where terms are reasonably accessible) requires *substantial* substantive unconscionability to invalidate — and post-*Concepcion* California courts have no permissible state-law lever to label "individualized arbitration of disputes arising from your use of the service" substantively unconscionable without running into preemption.
- **Step 4** (cites 2): *Lamps Plus* forecloses interpretive workarounds. California's *contra proferentem* canon — historically a workhorse for converting adhesive ambiguity into class arbitration — is preempted when applied to compel class arbitration absent affirmative consent. A 2026 challenger cannot use ambiguity in a click-through ToS as a back-door route to class proceedings.
- **Step 5** (cites 3): *Viking River* signals the continuing trajectory — the Court continues to preempt California-specific rules that condition arbitration on the availability of representative or aggregate procedures.
- **Step 6** (cites 0, 3): Even granting the *McGill* rule, it invalidates only the *public-injunctive-relief waiver*, not the arbitration clause as a whole. A standard severability clause in a SaaS ToS preserves binding arbitration of damages claims and the class-action waiver itself.
- **Step 7** (cites 0, 1, 2, 3): The clause survives. A California court adjudicating a procedural-unconscionability challenge must (i) enforce the clause according to its terms, (ii) reject any rule that singles arbitration out, (iii) refuse to read ambiguity into class consent, and (iv) sever at most the public-injunctive-relief waiver.

### For-Recommendation

For educational purposes only and not as advice to any specific party or matter: the post-*Concepcion* / post-*Epic Systems* / post-*Viking River* doctrinal landscape gives a SaaS provider drafting a 2026 click-through ToS strong grounds to expect that a generic procedural-unconscionability challenge — adhesion plus class-action waiver — will fail in a California forum, provided the clause is drafted with (a) reasonable notice of the arbitration terms, (b) an explicit class-action waiver, (c) a severability clause that preserves the rest of the agreement if the public-injunctive-relief carve-out under *McGill* is found applicable, and (d) no other substantive features (e.g., one-sided fee-shifting, unconscionably short claim windows, unilateral modification clauses) that could supply the substantive prong the sliding scale requires.

## Against-Brief

### Core Position

The claim — that a SaaS click-through ToS arbitration clause with class-action waiver survives a procedural-unconscionability challenge under California law in 2026 — is at meaningful risk of being held unenforceable, and is **categorically unenforceable as to public injunctive relief** under the controlling California Supreme Court rule in *McGill v. Citibank, N.A.*, which the Ninth Circuit has expressly held the FAA does *not* preempt. Even setting aside *McGill*, California's surviving sliding-scale unconscionability doctrine (*Armendariz* / *OTO v. Kho*) treats adhesive, take-it-or-leave-it consumer click-throughs as carrying built-in procedural unconscionability (oppression + surprise), and recent federal district authority within California (*MacClelland v. Cellco P'ship*) has invalidated consumer ToS arbitration provisions on substantive-unconscionability grounds the FAA does not save. The for-side's reliance on *Concepcion* / *Epic Systems* / *Lamps Plus* / *Viking River* addresses class-waiver preemption and PAGA splitting — not the *McGill* rule, not the click-through formation gap, and not the substantive unconscionability of mass-arbitration choke clauses.

### Citations

| # | Title | URL | authorityType | authorityWeight | jurisdiction | courtLevel | year | pinCite | Excerpt |
|---|---|---|---|---|---|---|---|---|---|
| 0 | *McGill v. Citibank, N.A.*, 2 Cal. 5th 945 (case page) | https://www.citizen.org/litigation/mcgill-v-citibank/ | controlling-case | controlling | US-CA | state-supreme | 2017 | 2 Cal. 5th at 956 | "California law does not permit enforcement of any agreement that waives a claim for public injunctive relief, and . . . the FAA does not require enforcement of such an agreement merely because it is included in an arbitration agreement." |
| 1 | *OTO, L.L.C. v. Kho*, 8 Cal. 5th 111 | https://scocal.stanford.edu/opinion/oto-llc-v-kho-34655 | controlling-case | controlling | US-CA | state-supreme | 2019 | 8 Cal. 5th at 113–115 | "Both procedural and substantive unconscionability must be shown for the defense to be established, but 'they need not be present in the same degree.' . . . The more substantively oppressive the contract term, the less evidence of procedural unconscionability is required. . . . Oppression occurs where a contract involves lack of negotiation and meaningful choice, surprise where the allegedly unconscionable provision is hidden within a prolix printed form." |
| 2 | *Blair v. Rent-A-Center, Inc.*, 928 F.3d 819 — cited in Kilpatrick Townsend commentary | https://ktslaw.com/en/Blog/classaction/2024/4/The-Central-District-of-California-clarifies-private-injunctive-relief-for-purposes-of-McGill | controlling-case | controlling | US-CA-9th | federal-circuit | 2019 | 928 F.3d at 822–831 | "[T]he Ninth Circuit held that — given the limitations placed on 'public injunctive relief' in *McGill* — the Federal Arbitration Act ('FAA') did not preempt the *McGill* rule." |
| 3 | *MacClelland v. Cellco P'ship*, 609 F. Supp. 3d 1024 (case page) | https://www.citizen.org/litigation/macclelland-v-cellco-partnership/ | persuasive-case | persuasive | US-CA-ND | federal-district | 2022 | 609 F. Supp. 3d at 1037–1043 | Verizon's motion to compel arbitration denied; the mass-arbitration choke provision was substantively unconscionable because "it could take up to 156 years to resolve all claims, thus deterring potential litigants from enforcing their rights," and the statute-of-limitations clause "did not contain a tolling provision," rendering the arbitration forum an "'inferior' and often 'wholly ineffective' forum." |
| 4 | ZwillGen, "Ninth Circuit Limits Scope of *McGill* Rule on Public Injunctive Relief" | https://www.zwillgen.com/litigation/ninth-circuit-limits-scope-mcgill-rule/ | law-review | persuasive | US-CA-9th | secondary | 2021 | n/a | "Under California's *McGill* rule, a contractual provision that waives the right to seek 'public injunctive relief' in all forums is unenforceable" — confirming the rule remains live federal law within the Ninth Circuit even as courts narrow what counts as "public" injunctive relief. |

### Targeted Citation

`targetedCitationIndex: 0` — *McGill v. Citibank* is the single most direct rebuttal of the for-side's claim. The for-side's anchor cluster (*Concepcion* / *Epic* / *Lamps Plus* / *Viking River*) does not reach *McGill*, and the Ninth Circuit has held *McGill* is not FAA-preempted (*Blair*, against-citation 2). Any "survives in 2026" claim that ignores *McGill* is incomplete on the face of controlling California Supreme Court law.

### Authority-Hierarchy Conflict

| Field | Value |
|---|---|
| For-side citation guessed | *AT&T Mobility LLC v. Concepcion*, 563 U.S. 333 (2011) |
| Against-side citation index | 0 (*McGill v. Citibank*) |
| Conflict type | `same-authority-different-holding` |

The for-side leans on *Concepcion*'s FAA-preemption holding to argue the click-through arbitration clause is shielded. *McGill* is the California Supreme Court's authoritative narrowing of *Concepcion*'s reach: *McGill* expressly distinguishes *Concepcion* on the ground that the public-injunctive-relief rule is generally-applicable California contract law, not arbitration-singling, and therefore falls outside *Concepcion*'s preemption zone. Both speak to the same FAA-preemption question; they reach different holdings on overlapping doctrinal terrain. *Blair v. Rent-A-Center* (against-citation 2) is the Ninth Circuit's federal-procedural confirmation that *McGill* survives *Concepcion* within the federal overlay that matters for any California-seated SaaS.

### Analysis Summary

- **Step 1** (cites 0): The *McGill* rule renders any "in any forum" public-injunctive-relief waiver in a California-consumer-facing SaaS ToS unenforceable as a matter of controlling California Supreme Court law. The for-side cannot rebut this by invoking *Concepcion* or *Epic Systems* because the *McGill* court expressly grounded the rule in *generally applicable* California contract law — the FAA's preemption doctrine reaches only state rules that single out arbitration, not rules of general public-policy unenforceability.
- **Step 2** (cites 2, 4): The Ninth Circuit has affirmatively held *McGill* is NOT FAA-preempted. Within the Ninth Circuit (the federal-procedural overlay for any California-seated SaaS consumer), *Blair v. Rent-A-Center* binds federal district courts to apply *McGill* — meaning a SaaS ToS containing typical "no public injunctive relief in arbitration or court" language is at minimum severable and at maximum a complete invalidator of the arbitration provision, depending on the ToS's severance clause.
- **Step 3** (cites 1): California's sliding-scale unconscionability doctrine survived *Concepcion* and continues to invalidate adhesive arbitration provisions where procedural unconscionability is high — even on modest substantive unconscionability. Click-through ToS supply exactly the "oppression" (no meaningful choice) and "surprise" (provision hidden within prolix form) the California Supreme Court named in *OTO v. Kho*.
- **Step 4** (cites 1, 3): Modest substantive unconscionability suffices when procedural unconscionability is high. *MacClelland v. Cellco P'ship* illustrates the live in-California application: the Northern District invalidated Verizon's consumer ToS arbitration provision in 2022 because mass-arbitration choke clauses (no more than ten consumers at one time, 156-year resolution horizon, no tolling) were substantively unconscionable. Modern SaaS ToS that import similar mass-arb-throttling, fee-shifting, or one-way-attorney-fee provisions inherit *MacClelland*'s vulnerability.
- **Step 5** (cites 0, 2): The for-side's authorities address different questions — *Concepcion* preempts categorical state-law refusals to enforce class-action waivers; it does not preempt *McGill*. *Epic Systems* addresses NLRA-arbitration intersection in employment, not consumer click-throughs. *Lamps Plus* addresses ambiguity-construction in class-arbitration consent contexts; it does not validate substantively unconscionable consumer terms. *Viking River* addresses PAGA splitting, an entirely separate California-statutory carve-out. The for-side's anchor cluster, even taken at maximum strength, leaves *McGill* and the *OTO*-line unconscionability untouched.
- **Step 6** (cites 0, 1, 2, 3): The claim as stated — that the clause "survives" procedural-unconscionability challenge — is overbroad. A more accurate stating: *a properly-drafted SaaS arbitration clause with class-action waiver may survive a generic procedural-unconscionability challenge under* Concepcion*-line preemption, but is independently at risk of (a) total or partial unenforceability under* McGill *as to public injunctive relief, (b) full unenforceability under California's sliding-scale unconscionability doctrine where the substantive terms include mass-arbitration choke provisions or asymmetric fee/limitations terms, and (c) drafting-specific challenges to the formation gap inherent in click-through assent.*

### Against-Recommendation

For educational and informational purposes, a properly-disciplined analysis cannot end at *Concepcion* / *Epic Systems* / *Lamps Plus* / *Viking River*. The *McGill* rule imposes a categorical floor: any "no public injunctive relief in any forum" language is unenforceable on its face. Beyond that, California's sliding-scale unconscionability doctrine treats click-through adhesion as supplying meaningful procedural unconscionability, lowering the substantive-unconscionability threshold needed to invalidate — a vulnerability *MacClelland* made concrete for mass-arbitration choke provisions. The defensible educational framing is therefore *qualified survival, not categorical survival*.

## Judge Output

### Weakening Evidence

Against-citation index `0` (*McGill v. Citibank, N.A.*, 2 Cal. 5th 945, 956 (2017)), `authorityWeight: controlling`, `authorityType: controlling-case`, jurisdiction `US-CA`. Quoted holding: *"California law does not permit enforcement of any agreement that waives a claim for public injunctive relief, and . . . the FAA does not require enforcement of such an agreement merely because it is included in an arbitration agreement."* This is the strongest piece of the against-case — controlling California Supreme Court authority, FAA non-preemption affirmatively held, with Ninth Circuit federal-procedural confirmation in *Blair v. Rent-A-Center* (against-citation 2, `authorityWeight: controlling`, `authorityType: controlling-case`, jurisdiction `US-CA-9th`). The for-side acknowledged *McGill* abstractly in its Step 6 ("narrow and severable") but did not engage with *Blair*'s federal-procedural confirmation that *McGill* survives FAA preemption — leaving the for-side's "preempted by the FAA" theory of the case untested against the most directly responsive controlling authority.

### Verdict

**revise** — qualified-survival narrowing.

**Revised claim:** *A SaaS provider's mandatory binding-arbitration clause with class-action waiver, embedded in a click-through Terms of Service that an individual consumer accepted without negotiation, **partially survives** a procedural-unconscionability challenge under California law in 2026 — the class-action waiver and the agreement to arbitrate damages claims survive under* Concepcion*/*Epic Systems*-line FAA preemption — **but**: (i) any waiver of the right to seek public injunctive relief in any forum is independently unenforceable under* McGill v. Citibank*, FAA non-preemption confirmed by* Blair v. Rent-A-Center *(9th Cir. 2019); (ii) the agreement remains exposed to substantive-unconscionability invalidation under California's sliding-scale doctrine (*OTO v. Kho*) if its substantive terms include features* MacClelland v. Cellco P'ship *or analogous California authority would treat as overly harsh (mass-arbitration choke clauses, asymmetric fee-shifting, unduly short limitations periods, no-tolling provisions, unilateral-modification clauses); and (iii) the surviving force of the clause depends on a severability provision adequate to excise the public-injunctive-relief waiver without invalidating the remainder of the agreement.*

### Flip Conditions

- **Verdict flips to `endorse`** (i.e., the unqualified for-side claim becomes correct) if: a US Supreme Court decision after 2026 holds that *McGill*-type generally-applicable state public-policy rules are preempted by the FAA when applied to arbitration agreements, OR if the California Supreme Court overrules *McGill*. Both are non-trivial doctrinal moves; neither is on any 2026 docket the analyst could identify.
- **Verdict flips to `reject`** (i.e., the clause does not survive even in qualified form) if: a controlling Ninth Circuit or California Supreme Court decision after 2026 holds that click-through adhesion *plus* a class-action waiver is *per se* substantively unconscionable. Such a rule would itself almost certainly be preempted under *Concepcion*'s arbitration-singling doctrine, so this flip-condition path is implausible — but the most plausible *partial* rejection would be a holding that severability cannot cure a *McGill*-defective public-injunctive-relief waiver because the waiver is materially intertwined with the rest of the arbitration provision.
- **Verdict flips on individual facts:** the revised claim assumes the SaaS provider's clause does not contain any of the *MacClelland*-style choke features. If it does, the revised claim's "qualified survival" weakens further and may collapse into full unenforceability on substantive-unconscionability grounds.

### Confidence

**high.** One-line rationale: the for-side's federal authorities (*Concepcion*, *Epic Systems*, *Lamps Plus*, *Viking River*) are controlling on FAA preemption of class-waiver invalidation rules, and the against-side's California-and-Ninth-Circuit authorities (*McGill*, *Blair*, *OTO*, *MacClelland*) are controlling on the questions the for-side does not reach. The doctrines are non-overlapping; the verdict is constrained by both, and a "revise" narrowing is the only disposition consistent with both authority sets.

### Controlling Authorities Referenced

| Authority | authorityWeight | authorityType | Jurisdiction |
|---|---|---|---|
| *AT&T Mobility LLC v. Concepcion*, 563 U.S. 333 (2011) | controlling | controlling-case | US-Federal |
| *Epic Systems Corp. v. Lewis*, 138 S. Ct. 1612 (2018) | controlling | controlling-case | US-Federal |
| *Lamps Plus, Inc. v. Varela*, 139 S. Ct. 1407 (2019) | controlling | controlling-case | US-Federal |
| *Viking River Cruises, Inc. v. Moriana*, 142 S. Ct. 1906 (2022) | controlling | controlling-case | US-Federal |
| *McGill v. Citibank, N.A.*, 2 Cal. 5th 945 (2017) | controlling | controlling-case | US-CA |
| *Blair v. Rent-A-Center, Inc.*, 928 F.3d 819 (9th Cir. 2019) | controlling | controlling-case | US-CA-9th |
| *OTO, L.L.C. v. Kho*, 8 Cal. 5th 111 (2019) | controlling | controlling-case | US-CA |
| *MacClelland v. Cellco P'ship*, 609 F. Supp. 3d 1024 (N.D. Cal. 2022) | persuasive | persuasive-case | US-CA-ND |

### Degradation Flags

- **`secondary-source-url-for-controlling-case`** on against-citation 2 (*Blair v. Rent-A-Center*). The URL fetched (`ktslaw.com` law-firm commentary) is a real, resolvable URL and the commentary accurately states *Blair*'s holding that the FAA does not preempt the *McGill* rule, but the URL itself is not the Ninth Circuit slip-opinion source. The CourtListener primary source returned a blank body during the live run; a primary-source URL substitution would be desirable in a corrected re-run.
- **`for-advocate-attempted-calls-idealized`**. The for-advocate's `webResearch.attemptedCalls` records four clean Cornell LII fetches in a four-second window with no failures or alternates attempted. The cited URLs are well-known canonical Supreme Court pages and resolve cleanly when independently checked; the underlying citations are reliable. The record itself, however, lacks the failure-and-fallback fingerprint the against-advocate's record does have. Future runs should require the for-advocate to log at least one probe-failure to demonstrate live-research behavior rather than capability self-report.

No `citationOverlap`, `authorityHierarchyOverlap`, `statutoryRecencyStale`, `statutoryRecencyUnverified`, or `evidence-fabrication-risk` flags. URL overlap between for- and against-sides = 0. Authority-hierarchy diversity satisfied — the against-side carries unique controlling-authority tuples in (`US-CA`, `controlling-case`, *McGill*), (`US-CA-9th`, `controlling-case`, *Blair*), and (`US-CA`, `controlling-case`, *OTO*) that are not on the for-side.

## Statutory Recency Findings

*Not applicable — no statutory or regulatory citations in this debate.* California's UCL and CLRA underpin the *McGill* rule but neither was directly cited; the doctrinal vehicle in each cited authority is judge-made contract law or FAA case law.

---

## Skill discipline observations (case-study-specific)

A `/debate-prism` run on this same question would have produced something close to the for-brief and the against-brief as written, but it would not have done five things `engage-lexicon` did:

1. **Refused to start without a declared jurisdiction.** The jurisdiction-declared gate is the first hard stop. A version of this question pitched as "does this arbitration clause survive consumer-protection challenges" without naming a forum would have halted at the gate.
2. **Tagged every citation with `authorityWeight` and `authorityType`.** The judge's controlling-vs-persuasive distinction depends on this; *MacClelland* dropping in as `persuasive-case` (federal district, not Ninth Circuit binding) shapes the verdict in a way a flat citation list would not.
3. **Enforced authority-hierarchy diversity in addition to URL non-overlap.** A `/debate-prism` run could have produced a for-side and against-side both anchored on *Concepcion* with conflicting readings. `engage-lexicon` instead forced the against-side to anchor on a different controlling-case tuple (*McGill*) — which is the dispositive move in this debate.
4. **Required the judge to identify the deciding authority's class (controlling vs. persuasive).** *McGill* (controlling, California Supreme Court) being named as the weakening evidence — not *MacClelland* (persuasive, federal district) — is the kind of distinction the discipline forces.
5. **Stamped the educational-only disclaimer unconditionally.** No detection heuristic, no opt-out. The disclaimer at the top of this artefact is the same disclaimer text on any `engage-lexicon` output, parameterized only by date and jurisdiction.

These five disciplines are why `engage-lexicon` is a separate skill from `/debate-prism`, not a flag on it.

---

*Generated by `engage-lexicon` skill on 2026-05-18 under declared jurisdiction `US-CA`. Real-run case study capturing live web research, parallel for/against subagent dispatch, judge synthesis, and educational-only disclaimer stamp. See [`Docs/case-studies/README.md`](../README.md) for the case-studies-vs-examples contract. **Not licensed legal advice. Consult a California-admitted attorney before acting on any specific matter.**
