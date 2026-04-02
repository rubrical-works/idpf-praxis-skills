---
name: privacy-compliance
description: Provide structured privacy compliance guidance for web and mobile projects covering consent management, cookie compliance, dark pattern avoidance, and regulatory landscape
type: educational
version: "1.0.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-03-17"
license: Complete terms in LICENSE.txt
category: compliance
relevantTechStack: [gdpr, ccpa, privacy, cookies, consent]
copyright: "Rubrical Works (c) 2026"
---

# Privacy Compliance

**Purpose:** Guide developers through implementing privacy compliance patterns during development rather than retrofitting them during compliance audits.
**Audience:** Developers building web or mobile applications that collect, process, or store user data.
**Related Skills:** `seo-optimization` — for meta tag and structured data guidance that may overlap with consent metadata

---

## When to Use This Skill

Invoke this skill when:

- Adding analytics, tracking, or third-party scripts to a web application
- Implementing cookie consent banners or preference centers
- Designing forms that collect personal data
- Integrating with advertising or marketing platforms
- Building user account features (registration, profile management)
- Auditing an existing site for privacy compliance gaps
- Working with data storage (cookies, localStorage, IndexedDB) that may contain personal data

---

## Overview

The `privacy-compliance` skill covers four core areas:

1. **Consent Management** — Patterns for collecting, storing, and enforcing user consent before loading scripts or setting cookies
2. **Cookie Compliance** — Cookie classification, banner implementation, and auditing practices
3. **Dark Pattern Avoidance** — UI patterns that violate regulations or erode trust (reject-all parity, pre-checked boxes, cookie walls)
4. **Regulatory Landscape** — GDPR, CCPA/CPRA, LGPD, and ePrivacy Directive implementation patterns (not legal advice)

### What This Skill Does NOT Cover (v1)

These topics are deferred to a future version:

- Privacy-by-design: data minimization, purpose limitation, retention policies, anonymization/pseudonymization
- Data subject rights: right to deletion, data portability, access requests, consent withdrawal flows
- Third-party script auditing: data egress tracking, tag manager governance, sub-processor tracking
- Framework-specific guidance: SPA consent gates, SSR cookie handling, mobile consent flows (ATT), local storage/IndexedDB

See `Docs/02-Advanced/Skill-Guide-Privacy-Compliance.md` for curated external references on deferred topics.

---

## Consent Management Essentials

### The Core Rule

**Nothing loads before consent.** No analytics, no advertising pixels, no social media widgets, no non-essential cookies. The user must make an informed, affirmative choice before any data processing begins.

### Consent-Before-Load Pattern

```html
<!-- BAD: Scripts load immediately, consent asked after -->
<script src="https://analytics.example.com/tracker.js"></script>
<script>showConsentBanner();</script>

<!-- GOOD: Scripts only load after consent -->
<script>
  if (hasConsent('analytics')) {
    loadScript('https://analytics.example.com/tracker.js');
  }
</script>
```

### Consent Storage

Store consent decisions in a first-party cookie with the following properties:

```javascript
// Consent cookie structure
{
  "version": 2,                    // Schema version for migration
  "timestamp": "2026-01-15T10:30:00Z",
  "categories": {
    "necessary": true,             // Always true, cannot be declined
    "functional": true,
    "analytics": false,
    "marketing": false
  },
  "granular": {                    // Optional: per-vendor consent
    "google-analytics": false,
    "hotjar": false
  }
}
```

**Rules:**
- Store as first-party cookie (not localStorage — cookies travel with requests for server-side enforcement)
- Include schema version for future migration
- Include timestamp for audit trail
- Default all non-essential categories to `false`
- Never pre-select non-essential categories

### Preference Centers

A preference center allows users to modify their consent choices at any time.

**Requirements:**
- Accessible from every page (typically in footer)
- Shows current consent state (not defaults)
- Changes take effect immediately (revoke = stop processing)
- Granular control per category (at minimum) or per vendor

### Consent-as-a-Service vs Self-Hosted

| Approach | Pros | Cons |
|----------|------|------|
| CMP (Consent Management Platform) | Auto-updated for regulation changes, vendor integrations, compliance reporting | Third-party dependency, cost, data leaves your domain |
| Self-hosted | Full control, no data egress, no cost | Must track regulation changes, build UI, maintain compliance |

**When to use a CMP:** High regulatory exposure (EU users), many third-party integrations, need for compliance reporting.
**When to self-host:** Simple sites, few third-party scripts, strong privacy stance.

---

## Cookie Compliance Essentials

### Cookie Classification

Every cookie your site sets must be classified into one of four categories:

| Category | Description | Consent Required | Examples |
|----------|-------------|-----------------|----------|
| **Strictly Necessary** | Essential for site function | No | Session ID, CSRF token, load balancer affinity, consent cookie itself |
| **Functional** | Enhanced features, not essential | Yes | Language preference, theme, remembered login |
| **Analytics** | Usage measurement and improvement | Yes | Google Analytics, Hotjar, page view counters |
| **Marketing** | Advertising and cross-site tracking | Yes | Ad network cookies, retargeting pixels, social media trackers |

### Cookie Banner Implementation

```html
<div id="cookie-banner" role="dialog" aria-label="Cookie consent">
  <p>We use cookies to improve your experience.
     <a href="/privacy-policy">Learn more</a>.</p>
  <div class="cookie-actions">
    <!-- CRITICAL: Reject must be as prominent as Accept -->
    <button id="reject-all">Reject All</button>
    <button id="customize">Customize</button>
    <button id="accept-all">Accept All</button>
  </div>
</div>
```

**Rules:**
- Banner must appear before any non-essential cookies are set
- "Reject All" must be as easy to find and use as "Accept All"
- Banner must not block content entirely (no cookie walls under GDPR)
- Must link to full privacy policy
- Must be accessible (ARIA roles, keyboard navigable)

### Cookie Auditing

Regularly audit what cookies your site actually sets:

| Check | How | Why |
|-------|-----|-----|
| Inventory all cookies | Browser DevTools → Application → Cookies | Know what you're setting |
| Classify each cookie | Map to category (necessary/functional/analytics/marketing) | Required for banner |
| Check third-party cookies | Filter by domain in DevTools | These need explicit consent |
| Verify consent enforcement | Reject all → check no non-essential cookies set | Prove compliance |
| Check cookie attributes | `Secure`, `HttpOnly`, `SameSite`, `Path`, expiration | Security and scope |

---

## Dark Pattern Avoidance Essentials

### What Are Dark Patterns?

Dark patterns are UI designs that trick users into making choices they wouldn't make if fully informed. In privacy contexts, they undermine consent validity — consent obtained through manipulation is not valid consent under GDPR.

### The Rules

#### 1. Reject-All Parity

"Reject All" must be as easy to find and use as "Accept All."

```html
<!-- BAD: Accept is prominent, reject is hidden -->
<button class="btn-primary btn-large">Accept All</button>
<a href="#" class="text-small text-gray">Manage preferences</a>

<!-- GOOD: Equal prominence -->
<button class="btn-secondary">Reject All</button>
<button class="btn-secondary">Customize</button>
<button class="btn-primary">Accept All</button>
```

**Violations:**
- "Accept" is a button, "Reject" is a text link
- "Accept" is brightly colored, "Reject" is grayed out
- Rejecting requires navigating through multiple screens
- "Reject" option is only available in a sub-menu

#### 2. No Pre-Checked Boxes

Consent checkboxes must default to unchecked. Pre-checked boxes do not constitute valid consent under GDPR Article 7.

```html
<!-- BAD: Pre-checked (invalid consent) -->
<label>
  <input type="checkbox" checked> I agree to marketing emails
</label>

<!-- GOOD: Unchecked by default -->
<label>
  <input type="checkbox"> I agree to marketing emails
</label>
```

#### 3. No Cookie Walls

A cookie wall blocks access to content unless the user accepts all cookies. Under GDPR and ePrivacy guidelines, this is generally not valid because consent is not freely given if the alternative is losing access.

```
<!-- BAD: Cookie wall -->
┌─────────────────────────────────────┐
│  Accept cookies to continue         │
│                                     │
│  [Accept All Cookies]               │
│                                     │
│  Content is blocked until you       │
│  accept cookies.                    │
└─────────────────────────────────────┘

<!-- GOOD: Non-blocking banner -->
┌─────────────────────────────────────┐
│  We use cookies to improve your     │
│  experience.                        │
│  [Reject All] [Customize] [Accept]  │
└─────────────────────────────────────┘
(Content is visible and usable below)
```

#### 4. No Confirmshaming

Do not use guilt-inducing language to discourage rejection.

```
<!-- BAD: Confirmshaming -->
[Accept All Cookies]
[No thanks, I don't care about my experience]

<!-- GOOD: Neutral language -->
[Accept All]
[Reject All]
```

### Dark Pattern Checklist

- [ ] "Reject All" and "Accept All" have equal visual weight
- [ ] No pre-checked consent boxes
- [ ] Content is accessible without accepting cookies
- [ ] No guilt-inducing language for rejection
- [ ] Withdrawing consent is as easy as giving it
- [ ] No repeated consent prompts after rejection (nagging)
- [ ] Consent modal can be closed without making a choice (defaults to reject)

---

## Regulatory Landscape Overview

> **Disclaimer:** This section provides implementation patterns for developers. It does not constitute legal advice. Consult qualified legal counsel for compliance requirements specific to your jurisdiction and use case.

### GDPR (General Data Protection Regulation)

**Jurisdiction:** European Union and EEA
**Applies when:** Processing personal data of EU/EEA residents, regardless of where your company is based.

**Key implementation requirements:**
- **Lawful basis required** — Consent, legitimate interest, contract, legal obligation, vital interest, or public task
- **Consent must be:** freely given, specific, informed, unambiguous, and as easy to withdraw as to give
- **Data minimization** — Collect only what is necessary for the stated purpose
- **Right to be forgotten** — Must be able to delete personal data on request
- **Data portability** — Must be able to export personal data in a machine-readable format
- **72-hour breach notification** — Must notify supervisory authority within 72 hours of discovering a breach

**Penalties:** Up to 4% of global annual turnover or 20 million EUR, whichever is higher.

### CCPA / CPRA (California Consumer Privacy Act / California Privacy Rights Act)

**Jurisdiction:** California, United States
**Applies when:** Business has CA customers AND meets revenue/data thresholds.

**Key implementation requirements:**
- **"Do Not Sell or Share"** — Must honor opt-out of data sale/sharing
- **Right to know** — Users can request what data you have about them
- **Right to delete** — Users can request deletion of their personal data
- **Non-discrimination** — Cannot penalize users for exercising privacy rights
- **Opt-out, not opt-in** — Unlike GDPR, CCPA uses an opt-out model (except for minors)

**Penalties:** $2,500 per unintentional violation, $7,500 per intentional violation.

### LGPD (Lei Geral de Protecao de Dados)

**Jurisdiction:** Brazil
**Applies when:** Processing personal data of individuals in Brazil.

**Key implementation requirements:**
- **10 lawful bases** — Similar to GDPR but includes credit protection and health protection
- **Consent requirements** — Must be specific, informed, and freely given
- **Data Protection Officer (DPO)** — May be required depending on data processing volume
- **Data transfer restrictions** — Similar to GDPR's adequacy requirements
- **Breach notification** — Must notify authority and data subjects within a "reasonable time"

**Penalties:** Up to 2% of revenue in Brazil, capped at 50 million BRL per violation.

### ePrivacy Directive

**Jurisdiction:** European Union (supplements GDPR)
**Applies when:** Using cookies, email marketing, or electronic communications in the EU.

**Key implementation requirements:**
- **Cookie consent** — Prior consent required for non-essential cookies (the basis for cookie banners)
- **Email marketing** — Opt-in required for marketing emails (soft opt-in exception for existing customers)
- **Metadata protection** — Communication metadata (who, when, where) is protected

**Note:** The ePrivacy Regulation (replacement) has been in draft since 2017. Current implementations should follow the Directive as interpreted by national implementations.

### Comparison Matrix

| Requirement | GDPR | CCPA/CPRA | LGPD | ePrivacy |
|-------------|------|-----------|------|----------|
| Consent model | Opt-in | Opt-out | Opt-in | Opt-in |
| Cookie consent | Via ePrivacy | Not specifically | Yes | Yes (primary) |
| Right to delete | Yes | Yes | Yes | — |
| Data portability | Yes | Yes (limited) | Yes | — |
| Breach notification | 72 hours | — | Reasonable time | — |
| DPO required | Sometimes | No | Sometimes | — |
| Extraterritorial | Yes | Yes (threshold) | Yes | Yes |

---

## Quick Reference Checklist

Use this checklist when reviewing a page or feature for privacy compliance:

### Consent Management
- [ ] No scripts load before consent is given
- [ ] Consent stored in first-party cookie with categories
- [ ] Preference center accessible from every page
- [ ] Consent withdrawal stops processing immediately
- [ ] Default state is "all non-essential declined"

### Cookie Compliance
- [ ] All cookies classified (necessary, functional, analytics, marketing)
- [ ] Banner appears before non-essential cookies are set
- [ ] "Reject All" has equal prominence to "Accept All"
- [ ] Cookie audit performed and documented
- [ ] Third-party cookies identified and consented

### Dark Pattern Avoidance
- [ ] No pre-checked consent boxes
- [ ] No cookie walls blocking content
- [ ] No confirmshaming language
- [ ] Rejection is one click (not multi-step)
- [ ] No repeated prompts after rejection

### Regulatory
- [ ] Privacy policy is linked and current
- [ ] Correct consent model for target jurisdictions (opt-in vs opt-out)
- [ ] Data collection serves a stated purpose
- [ ] Breach notification process documented

---
