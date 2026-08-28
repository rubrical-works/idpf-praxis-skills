# CHORUS — SaaS Vendor Contract Renewal (Q3 2026)

## Metadata

- **Date:** 2026-05-16
- **Skill:** engage-chorus 1.0.0
- **Situation:** Annual renewal of a $1.4M/year SaaS contract; vendor proposed 22% increase citing infra costs; buyer's procurement asked for a 5% decrease; legal/security pushed for stricter SLAs; engineering wants feature commitments.
- **Session type:** commercial
- **Stakeholders:** the-vendor, the-procurement-lead, the-security-lead, the-engineering-lead
- **Deprioritized:** none

---

## Situation

Annual SaaS contract renewal. Vendor wants 22% price increase (citing infrastructure cost growth and new feature investment). Buyer's procurement targets ≤5% decrease. Legal/security wants stronger SLAs (4-hour incident response → 2-hour; data-residency commitments). Engineering wants firm commitments on three roadmap features that have been "coming soon" for two cycles.

---

## Stakeholders

### the-vendor

*SaaS account-management team representing the vendor's commercial interests in renewal*

| Field | Value |
| --- | --- |
| interests | • Net-new ARR growth target for the quarter<br>• Maintain reference-account status with the buyer (public case study + analyst report co-marketing)<br>• Avoid SLA commitments that bind the engineering org to operational debt |
| statedPositions | 22% price increase tied to infrastructure cost recovery |
| batna | Hold price at current level and lose the ARR-growth target this quarter (acceptable; not catastrophic — but missed bonus) |
| reservationPoint | Anything below a 7% increase combined with two-year commitment requires escalation; below 4% triggers walk |
| tradeableConcessions | • Defer the price increase to Year 2 of a multi-year deal<br>• Commit to two of the three engineering-requested features in the next two quarters<br>• Accept tighter SLAs in exchange for usage caps that bound operational exposure<br>• Provide reference-case co-marketing credit in lieu of a price reduction |
| coalitionSignals | • *the-engineering-lead* — both want roadmap feature commitments documented |

The vendor's strongest framing is that the 22% is an opening anchor, not a final ask — and the BATNA (hold price, miss bonus) is real but not punishing. Reference-account value is the soft asset that can substitute for hard dollars.

**Steel-man tier:** *strong*

### the-procurement-lead

*Buyer's procurement lead with quarterly OpEx target*

| Field | Value |
| --- | --- |
| interests | • Hit OpEx target (-3% this fiscal year on SaaS spend)<br>• Establish multi-year price discipline pattern across the SaaS portfolio<br>• Avoid lock-in to a single vendor for a category with growing competition |
| statedPositions | 5% decrease in renewal price |
| batna | Issue an RFP and migrate to a competitor — quotes from two competitive vendors are 15-25% below current contract value, but switching cost is estimated at $400K + 6 months of engineering team time |
| reservationPoint | No deal above current contract value without offsetting service commitments worth at least 10% of contract value |
| tradeableConcessions | • Accept a 2-year commitment in exchange for flat pricing<br>• Forego the 5%-decrease target if SLAs and roadmap features are firmly committed<br>• Allow public reference-case co-marketing (the vendor's softest ask) |
| coalitionSignals | • *the-security-lead* — shared interest in SLA strengthening as offsetting value<br>• *the-engineering-lead* — shared interest in roadmap-feature commitments as offsetting value |

Procurement's BATNA (RFP + switch) is real but expensive; the steel-man framing acknowledges that the OpEx target is a defensible position, NOT just opening posturing. Multi-year price discipline pattern is the strategic interest beneath the tactical 5%-decrease.

**Steel-man tier:** *strong*

### the-security-lead

*Buyer's CISO representing security and compliance requirements*

| Field | Value |
| --- | --- |
| interests | • Reduce mean time to incident recovery (current 4-hour SLA leaves the org exposed during business-day incidents)<br>• Lock in EU data-residency commitments before the upcoming regulatory review<br>• Avoid having to relitigate security requirements at next renewal cycle |
| statedPositions | 2-hour incident response SLA; explicit EU data-residency clause; SOC 2 Type II annual audit access |
| batna | Pre-renewal regulatory review finds gaps and CISO must escalate to executive committee — embarrassing but ultimately strengthens hand for next renewal cycle |
| reservationPoint | No renewal without at least the 2-hour SLA (data-residency negotiable; SOC 2 access non-negotiable) |
| tradeableConcessions | • Accept 3-hour SLA (instead of 2-hour) if usage caps are set such that high-usage tier triggers escalation<br>• Defer EU data-residency to a phased migration over the contract term<br>• Forego the SOC 2 audit-access clause IF the vendor commits to a third-party compliance attestation |
| coalitionSignals | • *the-procurement-lead* — shared interest in SLA strengthening as offsetting value (vs. price reduction) |

Security's BATNA is non-trivial — a pre-renewal regulatory review finding is a real escalation, not just a procedural step. The reservation point is honestly drawn (2-hour SLA non-negotiable; the rest is movement room).

**Steel-man tier:** *strong*

### the-engineering-lead

*Buyer's engineering lead representing the team's blocking dependencies on vendor features*

| Field | Value |
| --- | --- |
| interests | • Land the three deferred roadmap features (API webhooks, multi-region replication, custom-field schema) in the next two quarters<br>• Avoid context-switch cost from a vendor migration ($400K + 6 months)<br>• Reduce ongoing maintenance burden from missing-feature workarounds |
| statedPositions | Firm commitments on the three roadmap features |
| batna | Continue building workarounds in-house — sustainable for 6 more months but increasingly expensive |
| reservationPoint | No renewal without firm commitments on at least 2 of the 3 features in writing with delivery dates |
| tradeableConcessions | • Accept partial-feature commitments (e.g., webhooks delivered first, multi-region within 12 months)<br>• Provide engineering-team time for vendor-side beta testing to accelerate delivery<br>• Allow vendor to publicize the roadmap commitments as a case study to other prospects |
| coalitionSignals | • *the-vendor* — both want documented roadmap commitments (vendor for ARR signal, engineering for unblocking)<br>• *the-procurement-lead* — shared interest in feature commitments as offsetting value vs. straight price reduction |

Engineering's interests align unexpectedly with the vendor's — both want documented roadmap commitments, just for different reasons. This is the strongest coalition signal in the situation.

**Steel-man tier:** *strong*

---

## Mediator Landscape

### ZOPA

| Issue | Overlap |
| --- | --- |
| price | 4-8% increase range bridges procurement's tolerance-with-offsets and vendor's escalation threshold; flat-with-multi-year-commitment is also in zone |
| SLA | 3-hour SLA with usage caps bridges security's 2-hour ask and vendor's reluctance to bind operations |
| roadmap features | Two of three features with firm dates is in vendor's tradeable concession space and engineering's reservation point |

### Trade frontier

| Gives up | Stakeholder | In exchange for | Counterparty |
| --- | --- | --- | --- |
| drop price increase to flat-rate with 2-year commitment | the-vendor | drop the 5%-decrease ask; agree to public reference-case | the-procurement-lead |
| commit to 2 of 3 roadmap features with firm dates | the-vendor | provide beta-test engineering time + public case study credit | the-engineering-lead |
| 3-hour SLA with usage-cap escalation tier | the-vendor | defer EU data-residency to phased migration over contract term | the-security-lead |

### Settlement zones

| Rank | Outcome | Endorsed by |
| --- | --- | --- |
| 1 | Flat-rate 2-year deal + 2/3 roadmap features with dates + 3-hour SLA with usage caps + phased EU data-residency + public reference-case | the-vendor, the-procurement-lead, the-security-lead, the-engineering-lead |
| 2 | 4% increase 2-year deal + all 3 roadmap features + 2-hour SLA + immediate EU data-residency (vendor concedes more; buyer concedes price discipline) | the-security-lead, the-engineering-lead |
| 3 | 1-year extension at current rates with renegotiation kick-can (low ambition; everyone tolerates, no one prefers) | the-procurement-lead |

### Unresolved conflicts

| Conflict | Stakeholders |
| --- | --- |
| SOC 2 Type II audit-access clause: security wants it; vendor will not commit. Compromise (third-party attestation) may resolve at the table or may be escalated. | the-security-lead, the-vendor |

### Concession sequencing

| # | Stakeholder | Move | Tests |
| --- | --- | --- | --- |
| 1 | the-vendor | Propose flat-rate 2-year deal as opening counter to procurement's -5% | Whether procurement will trade price for term commitment |
| 2 | the-procurement-lead | Conditionally accept flat-rate 2-year IF roadmap features + SLAs are committed | Whether the vendor will trade documented commitments for term commitment |
| 3 | the-engineering-lead | Offer beta-test engineering time + public case study credit in exchange for 2/3 roadmap features with firm dates | Vendor's willingness to commit dates publicly |
| 4 | the-security-lead | Offer to phase EU data-residency in exchange for 3-hour SLA with usage caps | Vendor's flexibility on SLA when usage-cap escalation tier is in scope |
| 5 | any | Address SOC 2 audit-access via third-party-attestation compromise | Whether the remaining unresolved conflict can clear at the table |

### Coalition map

| Members | Aligned interest |
| --- | --- |
| the-vendor, the-engineering-lead | documented roadmap commitments (vendor for ARR signal, engineering for unblocking) |
| the-procurement-lead, the-security-lead, the-engineering-lead | non-price offsetting value (SLAs + features) substitutes for straight price reduction |

---

## Recommended Concession Sequence

1. **Vendor opens with flat-rate + 2-year commitment** — repositions the negotiation from price-vs-price to value-vs-term.
2. **Procurement conditionally accepts** — signals trade space.
3. **Engineering offers beta time + case study credit** for 2/3 roadmap features — exploits the vendor-engineering coalition.
4. **Security offers phased EU data-residency** for 3-hour SLA with usage caps — closes the security ask without binding vendor ops indefinitely.
5. **SOC 2 audit-access** addressed via third-party attestation compromise.

---

## What Would Change This Landscape

- **Vendor reservation point lowers** (revenue miss this quarter would be punishing): vendor accepts 2% decrease + multi-year, landscape shifts toward procurement's preferred zone.
- **Procurement OpEx target hardens** (CFO mandate changes mid-cycle): the -5% becomes non-negotiable, no flat-rate deal possible, BATNA (RFP) becomes credible.
- **Engineering's BATNA strengthens** (in-house workaround becomes cheaper than expected): roadmap-feature ask weakens, vendor-engineering coalition fragments.
