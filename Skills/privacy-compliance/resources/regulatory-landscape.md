# Regulatory Landscape Reference

Quick-reference for privacy regulations that affect web and mobile application development. Focus on implementation patterns, not legal interpretation.

> **This document does not constitute legal advice.** Privacy regulations are complex, jurisdiction-specific, and frequently updated. Consult qualified legal counsel for compliance requirements specific to your organization and use case.

---

## GDPR (General Data Protection Regulation)

### Overview

| Field | Detail |
|-------|--------|
| **Jurisdiction** | European Union and European Economic Area |
| **Effective** | May 25, 2018 |
| **Applies when** | Processing personal data of EU/EEA residents, regardless of company location |
| **Enforced by** | National Data Protection Authorities (DPAs) — e.g., CNIL (France), BfDI (Germany), ICO (UK, post-Brexit equivalent) |
| **Penalties** | Up to 4% of global annual turnover or 20M EUR, whichever is higher |

### Key Concepts for Developers

#### Lawful Basis (Article 6)

Every data processing operation needs one of these six bases:

| Basis | When to Use | Developer Action |
|-------|-------------|-----------------|
| **Consent** | Optional features (analytics, marketing) | Implement consent gate; record proof |
| **Contract** | Fulfilling a user agreement | Process only data needed for the service |
| **Legitimate interest** | Security logging, fraud prevention | Document the interest; offer opt-out |
| **Legal obligation** | Tax records, regulatory reporting | Retain required data; delete the rest |
| **Vital interest** | Emergency situations | Rarely applies to web apps |
| **Public task** | Government/public authority functions | Rarely applies to private companies |

#### Consent Requirements (Article 7)

For consent to be valid under GDPR:

```
Consent must be:
├── Freely given    → No penalty for refusing
├── Specific        → Per purpose, not blanket
├── Informed        → Clear language about what and why
├── Unambiguous     → Affirmative action (not pre-checked)
└── Withdrawable    → As easy to revoke as to give
```

#### Data Subject Rights (Articles 15-22)

| Right | Implementation Pattern |
|-------|----------------------|
| **Access** (Art. 15) | Export endpoint returning all personal data in machine-readable format |
| **Rectification** (Art. 16) | Profile edit functionality |
| **Erasure** (Art. 17) | Account deletion that removes personal data from all systems |
| **Portability** (Art. 20) | Data export in JSON, CSV, or other structured format |
| **Objection** (Art. 21) | Opt-out mechanism for processing based on legitimate interest |
| **Restrict processing** (Art. 18) | Flag to stop processing while dispute is resolved |

#### Breach Notification (Article 33)

```
Breach detected
    ├── Within 72 hours → Notify supervisory authority
    ├── High risk to individuals → Notify affected data subjects
    └── Document everything → What, when, impact, remediation
```

---

## CCPA / CPRA (California Consumer Privacy Act / California Privacy Rights Act)

### Overview

| Field | Detail |
|-------|--------|
| **Jurisdiction** | California, United States |
| **Effective** | CCPA: January 1, 2020; CPRA amendments: January 1, 2023 |
| **Applies when** | Business has CA customers AND meets any threshold: >$25M revenue, >100K consumers' data, >50% revenue from selling data |
| **Enforced by** | California Privacy Protection Agency (CPPA); California Attorney General |
| **Penalties** | $2,500/unintentional violation, $7,500/intentional violation |

### Key Differences from GDPR

| Aspect | GDPR | CCPA/CPRA |
|--------|------|-----------|
| **Consent model** | Opt-in (consent before processing) | Opt-out (can process until consumer objects) |
| **Scope** | Any data processor handling EU data | Businesses meeting revenue/volume thresholds |
| **"Sale" concept** | Not specifically defined | Broad — includes sharing for behavioral ads |
| **Cookie consent** | Required before setting | Not specifically required (via CCPA) |
| **Private right of action** | Limited | Yes, for data breaches |

### Key Implementation Requirements

#### "Do Not Sell or Share My Personal Information"

```html
<!-- Required link — must be in footer or clearly accessible -->
<a href="/do-not-sell">Do Not Sell or Share My Personal Information</a>
```

CPRA expanded "sale" to include "sharing" — transferring personal data to third parties for cross-context behavioral advertising, even without monetary exchange.

#### Global Privacy Control (GPC)

```javascript
// Detect GPC signal from browser
if (navigator.globalPrivacyControl) {
  // Treat as "Do Not Sell/Share" opt-out
  disableThirdPartyTracking();
  disableBehavioralAds();
}
```

Businesses must honor the GPC browser signal as a valid opt-out request under CPRA.

#### Non-Discrimination

Cannot penalize consumers for exercising privacy rights:
- No price increases for opting out
- No degraded service quality
- No denial of service (except where data is essential)

---

## LGPD (Lei Geral de Protecao de Dados)

### Overview

| Field | Detail |
|-------|--------|
| **Jurisdiction** | Brazil |
| **Effective** | September 18, 2020 |
| **Applies when** | Processing personal data of individuals in Brazil |
| **Enforced by** | ANPD (Autoridade Nacional de Protecao de Dados) |
| **Penalties** | Up to 2% of revenue in Brazil, capped at 50M BRL per violation |

### Key Concepts for Developers

#### 10 Lawful Bases (Article 7)

LGPD provides 10 lawful bases (vs GDPR's 6):

1. Consent
2. Legal obligation
3. Public administration
4. Research (anonymized when possible)
5. Contract performance
6. Exercise of rights in judicial/administrative proceedings
7. Life or physical safety protection
8. Health protection
9. Legitimate interest
10. **Credit protection** (unique to LGPD)

#### Consent Requirements

Similar to GDPR but with additional specificity:
- Must be in writing or by other means demonstrating the will of the data subject
- If provided in writing, must be in a separate clause
- Controller bears the burden of proof
- Consent can be revoked at any time through a free and easy procedure

#### International Data Transfers

Transfers of personal data to other countries are permitted when:
- The destination country provides an adequate level of protection
- The controller offers guarantees (standard contractual clauses, binding corporate rules)
- The data subject has given specific, informed consent

---

## ePrivacy Directive (Directive 2002/58/EC)

### Overview

| Field | Detail |
|-------|--------|
| **Jurisdiction** | European Union (supplements GDPR) |
| **Effective** | 2002 (amended 2009 — "Cookie Directive") |
| **Applies when** | Using cookies, email marketing, or electronic communications in the EU |
| **Enforced by** | National regulators (same DPAs as GDPR in most countries) |
| **Status** | Regulation replacement (ePrivacy Regulation) in draft since 2017 |

### Key Requirements

#### Cookie Consent (Article 5(3))

The ePrivacy Directive is the legal basis for cookie banners in the EU:

```
Storing information (cookies) on user's device:
├── Strictly necessary for the service → No consent needed
└── All other purposes → Prior, informed consent required
```

**What counts as "storing information":**
- HTTP cookies (all types)
- localStorage and sessionStorage
- IndexedDB
- Device fingerprinting techniques
- Tracking pixels (they trigger cookie setting)

#### Email Marketing (Article 13)

| Scenario | Consent Required? |
|----------|:----------------:|
| Marketing to new contacts | Yes (opt-in) |
| Marketing to existing customers (related products) | No (soft opt-in, must offer opt-out) |
| Marketing to businesses (B2B) | Varies by national implementation |

Every marketing email must include:
- Clear identification as marketing
- Sender identity
- Unsubscribe mechanism (one-click preferred)

---

## Comparison Matrix

| Requirement | GDPR | CCPA/CPRA | LGPD | ePrivacy |
|-------------|:----:|:---------:|:----:|:--------:|
| Consent model | Opt-in | Opt-out | Opt-in | Opt-in |
| Cookie consent | Via ePrivacy | Not specifically | Yes | Yes (primary) |
| Right to delete | Yes | Yes | Yes | — |
| Right to access | Yes | Yes | Yes | — |
| Data portability | Yes | Yes (limited) | Yes | — |
| Breach notification | 72 hours | — | Reasonable time | — |
| DPO required | Sometimes | No | Sometimes | — |
| Private right of action | Limited | Yes (breaches) | Yes | Varies |
| Extraterritorial | Yes | Yes (threshold) | Yes | Yes |
| Max penalty | 4% global turnover | $7,500/violation | 2% BR revenue | Varies |

---

## Developer Quick Reference

### Minimum Viable Compliance Checklist

Regardless of which regulations apply, these practices provide a strong baseline:

- [ ] Know what personal data you collect and why
- [ ] Get consent before non-essential data processing
- [ ] Let users access, export, and delete their data
- [ ] Only collect data you actually need
- [ ] Secure personal data in transit and at rest
- [ ] Document your data processing activities
- [ ] Have a breach response plan
- [ ] Keep a privacy policy that is accurate and current

### Determining Which Regulations Apply

```
Where are your users?
├── EU/EEA → GDPR + ePrivacy
├── California → CCPA/CPRA (if thresholds met)
├── Brazil → LGPD
├── UK → UK GDPR (similar to EU GDPR)
└── Multiple → Apply the strictest regulation as baseline
```

**Practical approach:** If you serve a global audience, implement GDPR-level compliance as your baseline — it is the strictest major regulation and will satisfy most others.

---
