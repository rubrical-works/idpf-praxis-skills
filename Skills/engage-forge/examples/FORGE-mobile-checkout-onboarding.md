# FORGE — Mobile Checkout Onboarding Flow Redesign

## Metadata

- **Date:** 2026-05-16
- **Skill:** engage-forge 1.0.0
- **Paths explored:** 3 (JTBD onboarding flow, Atomic-design IA tree, Kano feature prioritization)
- **Audit checklist:** nielsen-10
- **Persona source:** selected-from-problem (Mei, smartphone-first returning shopper)
- **Graft recommended:** yes — see audit pass below

---

## Problem

> "Our mobile checkout onboarding loses 38% of returning users between the 'enter email' step and the 'enter payment' step. Redesign the onboarding flow."

---

## Paradigms Explored

| Path | Paradigm | Artefact | One-sentence rationale |
|---|---|---|---|
| 1 | JTBD onboarding flow | `flow` | The user's job is "complete the purchase I came here for"; the flow should make every step visibly serve that job. |
| 2 | Atomic-design IA tree | `ia-tree` | Decompose the onboarding surface into reusable atoms / molecules so the checkout flow inherits established component patterns. |
| 3 | Kano feature prioritization | `kano-grid` | Some onboarding features are basics (must be present); some are delights (drive surprise + return). Classifying before designing prevents over-investing in delight at the expense of basics. |

---

## Artefacts

### Path 1 — JTBD onboarding flow (artefactType: `flow`)

```json
{
  "artefactType": "flow",
  "title": "Mobile checkout onboarding — JTBD-anchored",
  "entryCondition": "Returning user; cart has ≥1 item; not signed in.",
  "exitCondition": "Order placed OR user abandons.",
  "steps": [
    { "step": 1, "userAction": "Tap 'Checkout' from cart", "systemResponse": "Pre-fill email from prior session cookie; show single-tap 'Continue as Mei' affordance", "notes": "Address the JTBD friction at the first step — recognize returning users immediately." },
    { "step": 2, "userAction": "Tap 'Continue as Mei'", "systemResponse": "Show order summary with saved address (one-line) and saved card masked", "notes": "Visible commitment to recognizing the user from saved data." },
    { "step": 3, "userAction": "Confirm address (one-tap)", "systemResponse": "Highlight delivery date; show one-tap card-on-file selection", "notes": "Default to saved card; alternatives accessible via 'Use different card' affordance." },
    { "step": 4, "userAction": "Tap 'Place order'", "systemResponse": "Show large 'Placing order…' state for ≥1s, then order confirmation", "notes": "Visibility-of-system-status: never show silent transitions." },
    { "step": 5, "userAction": "(none)", "systemResponse": "Order confirmation page — order number in 18pt, next-step affordances secondary", "notes": "The job is done — make the receipt the headline." }
  ]
}
```

**Rationale.** The 38% drop-off between email and payment indicates returning users are being re-asked for information the system already has. The strongest design move is to recognize the returning user at Step 1 and collapse Steps 2–4 from "enter information" to "confirm information." The most contestable assumption: the prior-session cookie reliably identifies the user. If the cookie is cleared, the flow falls back to "Sign in or continue as guest" — a separate path not shown here.

**What would change the artefact:** (1) Cookie-based recognition is unreliable in this context — switch to email-tap-to-magic-link. (2) Saved-card affordance is illegal in target market — collapse Steps 3–4 into a single tokenized payment step.

### Path 2 — Atomic-design IA tree (artefactType: `ia-tree`)

```json
{
  "artefactType": "ia-tree",
  "title": "Checkout onboarding IA (atomic decomposition)",
  "root": {
    "label": "Checkout Onboarding (Page)",
    "children": [
      {
        "label": "Identity Recognition (Organism)",
        "children": [
          { "label": "Returning-user banner (Molecule)" },
          { "label": "Guest-checkout link (Atom)" },
          { "label": "Sign-in link (Atom)" }
        ]
      },
      {
        "label": "Order Summary (Organism)",
        "children": [
          { "label": "Line-item card (Molecule)" },
          { "label": "Subtotal block (Molecule)" }
        ]
      },
      {
        "label": "Address Section (Organism)",
        "children": [
          { "label": "Saved-address card (Molecule)" },
          { "label": "Edit-address button (Atom)" }
        ]
      },
      {
        "label": "Payment Section (Organism)",
        "children": [
          { "label": "Saved-card selector (Molecule)" },
          { "label": "Add-new-card button (Atom)" }
        ]
      },
      {
        "label": "Place-Order CTA (Molecule)",
        "children": [
          { "label": "Primary button (Atom)" },
          { "label": "Order-total display (Atom)" }
        ]
      }
    ]
  }
}
```

**Rationale.** Decomposing into atoms / molecules / organisms makes the system-of-systems explicit and surfaces reusable patterns. The Identity Recognition organism is new; the rest reuses the existing component library. The most contestable assumption: the team has bandwidth to build the Identity Recognition organism this sprint.

**What would change the artefact:** (1) If the component library doesn't yet have a returning-user banner, the dependency tree gets a new node. (2) If A/B testing constraints require a single-variant flow, the Identity Recognition organism gets collapsed into a single Atom.

### Path 3 — Kano feature prioritization (artefactType: `kano-grid`)

```json
{
  "artefactType": "kano-grid",
  "title": "Checkout onboarding feature classification — Mei segment",
  "userSegment": "Returning smartphone-first shoppers",
  "features": [
    { "feature": "Recognize returning user at first step", "category": "basic", "rationale": "Users assume the system remembers them; absence is a friction." },
    { "feature": "Saved-card selection on payment step", "category": "performance", "rationale": "Reduces total taps from 12+ to 3-4; linear satisfaction curve." },
    { "feature": "Order-tracking link on confirmation", "category": "basic", "rationale": "Expected feature in 2026 mobile commerce." },
    { "feature": "Confetti animation on order placement", "category": "delight", "rationale": "Unexpected and pleasant; absent without disappointment." },
    { "feature": "Delivery-date promise above payment CTA", "category": "performance", "rationale": "Speeds decision; absence increases hesitation." },
    { "feature": "Voice-driven checkout", "category": "indifferent", "rationale": "Target segment uses thumbs, not voice, on commute." }
  ]
}
```

**Rationale.** The drop-off problem looks like a missing-basic problem (recognition + saved-card) more than a missing-delight problem. Prioritizing basics in the redesign should close most of the gap. The most contestable assumption: the 38% drop-off cohort is dominated by returning users; if it's heavy guest, the prioritization shifts.

**What would change the artefact:** (1) If guest-checkout is >50% of the drop-off cohort, the priority shifts to guest-checkout streamlining. (2) Voice-driven checkout is `indifferent` for *this* segment but could be `delight` for an accessibility-need-anchored segment.

---

## Synthesis Comparison Table

```json
{
  "outputType": "comparison-table",
  "rows": [
    { "path": 1, "paradigm": "JTBD onboarding flow", "artefactType": "flow", "strengths": "Directly addresses the 38% drop-off via returning-user recognition; concrete step-by-step instruction.", "weaknesses": "Assumes cookie-based recognition; doesn't address guest-checkout cohort.", "fitWithStatedGoals": "Strong — the problem is drop-off; the artefact is a flow that reduces it." },
    { "path": 2, "paradigm": "Atomic-design IA tree", "artefactType": "ia-tree", "strengths": "Surfaces reusable components and dependencies; sets up future redesigns.", "weaknesses": "Doesn't directly explain *how* the flow changes; needs Path 1 to be actionable.", "fitWithStatedGoals": "Medium — useful as architecture but doesn't close the drop-off on its own." },
    { "path": 3, "paradigm": "Kano feature prioritization", "artefactType": "kano-grid", "strengths": "Names which features to invest in and which to defer; basic-vs-delight classification prevents overbuild.", "weaknesses": "Classification, not flow; user can't implement a kano grid directly.", "fitWithStatedGoals": "Medium — informs Path 1 but doesn't replace it." }
  ],
  "recommendedPath": 1,
  "recommendationRationale": "Path 1 is the actionable artefact that directly addresses the 38% drop-off. Paths 2 and 3 inform Path 1's design choices but are not standalone deliverables."
}
```

---

## Heuristic Audit

```json
{
  "checklistId": "nielsen-10",
  "subjectArtefact": { "pathNumber": 1, "paradigm": "JTBD onboarding flow", "artefactType": "flow" },
  "findings": [
    { "heuristic": "Visibility of system status", "artefactElement": "Step 4: 'Placing order…' state", "severity": "pass", "finding": "≥1s explicit state covers the silent-transition risk.", "recommendation": "Hold." },
    { "heuristic": "Match between system and the real world", "artefactElement": "Step 2: 'Continue as Mei'", "severity": "pass", "finding": "Personalized greeting matches user mental model of recognition.", "recommendation": "Hold." },
    { "heuristic": "User control and freedom", "artefactElement": "Step 1: 'Continue as Mei' affordance", "severity": "major", "finding": "No visible escape hatch — the returning-user banner doesn't say how to checkout as someone else.", "recommendation": "Add 'Not Mei? Sign in' link adjacent to the Continue-as-Mei button." },
    { "heuristic": "Error prevention", "artefactElement": "Step 3: one-tap card selection", "severity": "minor", "finding": "No double-confirmation on payment; one tap places the order.", "recommendation": "Add a 'Review' state on the order-confirmation tap that summarizes total + payment method before commit." }
  ],
  "mostSevereFinding": {
    "heuristic": "User control and freedom",
    "severity": "major",
    "recommendation": "Add 'Not Mei? Sign in' link adjacent to the Continue-as-Mei button."
  },
  "graftRecommendation": {
    "fromPath": 2,
    "fromArtefactElement": "Identity Recognition organism > Guest-checkout link (Atom)",
    "heuristic": "User control and freedom",
    "transplantTo": "Step 1 of the JTBD flow (returning-user recognition step)",
    "instruction": "Adopt the Identity Recognition organism's Guest-checkout link Atom as a sibling affordance to 'Continue as Mei' in Step 1. The atomic-design path already names the component; lifting it into the flow closes the User Control gap without redesigning the recognition affordance."
  }
}
```

---

## Critique

```json
{
  "persona": { "name": "Mei", "shortDescriptor": "smartphone-first returning shopper, commuting on subway, technicalComfort: medium", "selectionSource": "selected-from-problem" },
  "subjectArtefact": { "pathNumber": 1, "artefactType": "flow" },
  "frictionPoints": [
    { "artefactElement": "Step 1: 'Continue as Mei' affordance", "friction": "On a packed subway my finger glances the button accidentally when I'm trying to scroll. The flow committed me to a transaction I didn't intend to start.", "remediation": "Require a held tap (≥300ms) on the 'Continue as Mei' button — or move it below the fold so accidental contact during scroll is unlikely." },
    { "artefactElement": "Step 3: 'Confirm address' one-tap", "friction": "I shipped to my old apartment three months ago because I tapped through. I need a 1-second pause where the address is visible and prominent before I commit.", "remediation": "Increase the address display to 18pt and add a 1-second 'about to ship to {address}' delay before the next-step affordance becomes tappable." },
    { "artefactElement": "Step 5: order confirmation page", "friction": "On subway WiFi the order confirmation took 8 seconds. During those 8 seconds I had no idea if my order placed. I retried and got a duplicate.", "remediation": "Optimistically show the order number on Step 4's 'Placing order…' state, derived client-side, with a server-confirmation badge that appears when the server acknowledges. Reject duplicate-submit during the pending window." }
  ]
}
```

---

## What Would Change This Recommendation

- **Cookie-based recognition is unreliable in this context.** Falls back to email magic-link — Path 1 needs a major rework (Step 1 becomes "enter email" again, and the JTBD-anchored framing is weaker).
- **Guest checkout is >50% of the drop-off cohort.** The Kano-grid's `recognize returning user` priority drops to medium; guest-checkout streamlining takes the top slot.
- **Accessibility audit replaces Nielsen-10 as the checklist.** Re-run with `--audit-checklist wcag-aa`; the User Control finding becomes Keyboard-Accessible / No-Trap and the graft target shifts.

---

## Audit

See the heuristic audit pass output above for the full finding matrix and graft recommendation.
