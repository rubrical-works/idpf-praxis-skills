# FORGE — Mobile-Form Error-Recovery Redesign

## Metadata

- **Date:** 2026-05-16
- **Skill:** engage-forge 1.0.0
- **Paths explored:** 3 (Contextual-inquiry journey map, Error-recovery try/fail cycle, Nielsen-heuristic-driven redesign)
- **Audit checklist:** wcag-aa
- **Persona source:** user-supplied-flag (Carla, accessibility-need user, screen-reader on Android)
- **Graft recommended:** yes — see audit pass below

---

## Problem

> "Our mobile sign-up form has a 22% completion rate. Users hit validation errors and don't recover. Redesign the form's error-handling so error recovery becomes the default path, not the exception."

---

## Paradigms Explored

| Path | Paradigm | Artefact | One-sentence rationale |
|---|---|---|---|
| 1 | Contextual inquiry | `journey-map` | Map what users experience emotionally and physically when validation rejects them, so the redesign is anchored on lived error-experience, not the form schema. |
| 2 | Error-recovery-first | `try-fail-cycle` | Document the dominant try-fail pattern explicitly; redesign so the second attempt succeeds without re-entering successful fields. |
| 3 | Nielsen-heuristic-driven redesign | `heuristic-matrix` | Audit the current form against Nielsen-10 (with WCAG-AA cross-check) — `Help users recognize, diagnose, and recover from errors` is the load-bearing heuristic. |

---

## Artefacts

### Path 1 — Contextual-inquiry journey map (artefactType: `journey-map`)

```json
{
  "artefactType": "journey-map",
  "title": "Sign-up form error-recovery journey",
  "persona": "Carla, screen-reader user on Android, completing sign-up while standing on a bus",
  "scenario": "Three-field sign-up form: email, password, postal code. Validates on submit. Submit fails on postal-code-format mismatch.",
  "stages": [
    { "stage": "Form-discovery", "userState": "intent: complete sign-up", "touchpoint": "Form landing", "emotion": "neutral", "opportunity": "Pre-announce field count via aria-live region so the screen-reader user knows the scope before starting." },
    { "stage": "First fill", "userState": "filling fields in order; screen-reader announces each label", "touchpoint": "Three text inputs in sequence", "emotion": "focused", "opportunity": "Per-field validation announcements so errors are caught before submit." },
    { "stage": "Submit", "userState": "taps submit confidently; expects success", "touchpoint": "Submit button", "emotion": "anticipating completion", "opportunity": "Visual + audio confirmation that submit was received." },
    { "stage": "Error surface", "userState": "screen-reader announces 'one error'; doesn't know which field", "touchpoint": "Error banner at top + red border on postal code", "emotion": "frustrated", "opportunity": "Move focus to the offending field; announce field name + specific error + correction example via aria-live=assertive." },
    { "stage": "Recovery attempt", "userState": "re-finds postal code; types corrected value; checks other fields are intact", "touchpoint": "Postal code input", "emotion": "anxious about losing other field values", "opportunity": "Explicitly persist other field values; announce 'other fields are unchanged' via screen-reader." },
    { "stage": "Re-submit", "userState": "submits again; succeeds", "touchpoint": "Submit button", "emotion": "relieved", "opportunity": "Acknowledge successful recovery as a first-class event, not silently transition." }
  ]
}
```

**Rationale.** The journey makes the error stage's friction visible — the screen-reader announces "one error" but doesn't say *which field*. The strongest design move is moving focus to the offending field and announcing field-name + correction via aria-live. The most contestable assumption: per-field validation announcements don't disrupt the user's typing flow.

**What would change:** (1) Per-field validation has been measured to disrupt typing — defer to submit-time validation only. (2) The user-base doesn't include screen-reader users — re-anchor the persona on visual-only error indicators.

### Path 2 — Error-recovery try/fail cycle (artefactType: `try-fail-cycle`)

```json
{
  "artefactType": "try-fail-cycle",
  "title": "Sign-up form try/fail/recover",
  "task": "Complete sign-up with email, password, postal code",
  "cycles": [
    { "attempt": 1, "userIntent": "Submit all three fields", "systemBehavior": "Validates on submit; postal code rejected (mismatched format)", "outcome": "fail-recoverable", "recoveryPath": "Banner at top; focus stays on submit; user must scroll to find error." },
    { "attempt": 2, "userIntent": "Locate offending field; correct it; submit", "systemBehavior": "Focus must be moved to postal code input; correction example shown; other fields preserved; resubmit succeeds", "outcome": "success", "recoveryPath": "Explicit 'recovered from error' affirmation reduces user uncertainty about whether the resubmit will fail similarly." }
  ],
  "finalOutcome": "task-completed"
}
```

**Rationale.** Documenting the try/fail cycle exposes that the current system makes the recovery attempt structurally harder than the first attempt (banner-not-focus, no correction example, ambiguous whether other fields are preserved). The redesign equalizes the second attempt's affordance with the first. The most contestable assumption: there's only one error per submit. With multiple errors, focus-on-first-error needs a "next error" affordance.

**What would change:** (1) Multi-error submits are the dominant pattern — add tab-through-errors mechanism. (2) Per-field validation eliminates the try/fail cycle entirely — re-anchor on a different paradigm.

### Path 3 — Nielsen-heuristic-driven redesign matrix (artefactType: `heuristic-matrix`)

```json
{
  "artefactType": "heuristic-matrix",
  "title": "Sign-up form audit (Nielsen-10 + WCAG-AA cross-check)",
  "subjectArtefact": "Current sign-up form",
  "findings": [
    { "heuristic": "Help users recognize, diagnose, and recover from errors", "artefactElement": "Error banner — 'Please fix the errors below'", "severity": "critical", "finding": "Banner names neither the field nor the correction. Vague error message is the load-bearing failure.", "recommendation": "Replace banner text with 'Postal code must be 5 digits — you entered \"M5V 2L4\"'; move focus to postal code input." },
    { "heuristic": "Error prevention", "artefactElement": "Postal-code input — no format hint", "severity": "major", "finding": "No format hint in the placeholder or label.", "recommendation": "Add 'e.g., 90210' as the placeholder; add format-mask if locale allows." },
    { "heuristic": "Visibility of system status", "artefactElement": "Validation timing — only on submit", "severity": "minor", "finding": "User doesn't know about errors until the round-trip completes.", "recommendation": "Soft per-field validation after blur; don't block typing." },
    { "heuristic": "Recognition rather than recall", "artefactElement": "Correction example", "severity": "major", "finding": "Error message must include a correct-format example, not just describe the rule.", "recommendation": "Always pair the error with an example of valid input." }
  ]
}
```

**Rationale.** `Help users recognize, diagnose, and recover from errors` is the critical-severity heuristic here. The fix is specific: error messages that name the field, the rule, the offending value, and a corrected example. The most contestable assumption: a single correction example is enough — some formats need multiple examples (e.g., international postal codes).

**What would change:** (1) International postal-code support — multiple examples per locale, lookup by country selection. (2) Real-time validation conflicts with low-bandwidth users — defer to submit-time validation only.

---

## Synthesis Comparison Table

```json
{
  "outputType": "comparison-table",
  "rows": [
    { "path": 1, "paradigm": "Contextual-inquiry journey map", "artefactType": "journey-map", "strengths": "Centers the screen-reader experience; surfaces accessibility-specific opportunities at every stage.", "weaknesses": "Journey map alone isn't an actionable form spec.", "fitWithStatedGoals": "Strong for accessibility; needs Path 3 for prioritization." },
    { "path": 2, "paradigm": "Error-recovery-first try/fail cycle", "artefactType": "try-fail-cycle", "strengths": "Crisp before/after of the recovery attempt; names the structural improvements.", "weaknesses": "Single-error-per-submit assumption; multi-error case absent.", "fitWithStatedGoals": "Strong — directly addresses the 22% completion problem." },
    { "path": 3, "paradigm": "Nielsen-heuristic-driven redesign", "artefactType": "heuristic-matrix", "strengths": "Concrete failure naming with severity ranking; the recommendation list is implementable directly.", "weaknesses": "Doesn't sequence the recommendations or surface dependencies between them.", "fitWithStatedGoals": "Strong — actionable specs that map to dev tasks." }
  ],
  "recommendedPath": 3,
  "recommendationRationale": "Path 3's heuristic-matrix produces the most directly actionable spec. Paths 1 and 2 inform Path 3's prioritization (which recommendations matter most, what the recovery path looks like end-to-end) but aren't standalone deliverables."
}
```

---

## Heuristic Audit (WCAG-AA)

```json
{
  "checklistId": "wcag-aa",
  "subjectArtefact": { "pathNumber": 3, "paradigm": "Nielsen-heuristic-driven redesign", "artefactType": "heuristic-matrix" },
  "findings": [
    { "heuristic": "Text alternatives (1.1.1)", "artefactElement": "Error icon next to postal code field", "severity": "major", "finding": "Path 3 doesn't specify alt text for the error icon; screen-reader users get unannotated visual signal.", "recommendation": "Mandate accessible name 'Error in {field name}' on every error indicator." },
    { "heuristic": "Info and relationships (1.3.1)", "artefactElement": "Error banner to field association", "severity": "major", "finding": "Path 3 specifies updated banner text but not the aria-describedby linkage between banner and field.", "recommendation": "Add aria-describedby from each field to its error message; banner references each error's field id." },
    { "heuristic": "Labels or instructions (3.3.2)", "artefactElement": "Postal-code placeholder + format hint", "severity": "pass", "finding": "Path 3 already names placeholder + format hint.", "recommendation": "Hold; ensure placeholder is NOT used as a substitute for a programmatic label." },
    { "heuristic": "Error identification (3.3.1)", "artefactElement": "Error message content", "severity": "pass", "finding": "Path 3's recommendation explicitly names field + rule + offending value + example. Strong.", "recommendation": "Hold." },
    { "heuristic": "Error suggestion (3.3.3)", "artefactElement": "Correction example in error message", "severity": "pass", "finding": "Path 3's recommendation pairs error with a correct-input example.", "recommendation": "Hold." },
    { "heuristic": "Keyboard (2.1.1)", "artefactElement": "Focus management on error", "severity": "major", "finding": "Path 3's recommendation moves focus to offending field on submit-fail, but does not specify keyboard reachability of the 'next error' affordance for multi-error submits.", "recommendation": "Add explicit Tab order through error indicators; first Tab from submit jumps to first error." }
  ],
  "mostSevereFinding": {
    "heuristic": "Text alternatives (1.1.1)",
    "severity": "major",
    "recommendation": "Mandate accessible name 'Error in {field name}' on every error indicator."
  },
  "graftRecommendation": {
    "fromPath": 1,
    "fromArtefactElement": "Stage 'Error surface' opportunity — 'announce field name + specific error + correction example via aria-live=assertive'",
    "heuristic": "Info and relationships (1.3.1)",
    "transplantTo": "Path 3's banner-text recommendation",
    "instruction": "Adopt Path 1's aria-live=assertive announcement specification as the implementation mechanism for Path 3's 'name the field + rule + offending value + example' recommendation. Path 3 names what the error message should say; Path 1's journey map names how the screen-reader should announce it."
  }
}
```

The graft fires because Path 1's accessibility-anchored journey map scores higher on `Info and relationships` than Path 3's heuristic-matrix, and the journey-map's `aria-live=assertive` element is a transplantable structural specification.

---

## Critique

```json
{
  "persona": {
    "name": "Carla",
    "shortDescriptor": "screen-reader user on Android, signing up while on a bus, technicalComfort: medium, accessibilityNeeds: ['screen-reader', 'voice-output']",
    "selectionSource": "user-supplied-flag"
  },
  "subjectArtefact": { "pathNumber": 3, "artefactType": "heuristic-matrix" },
  "frictionPoints": [
    { "artefactElement": "Finding row: 'Soft per-field validation after blur'", "friction": "On a bus my screen-reader is competing with bus announcements. Per-field validation announcements after every blur will overwhelm me — I'll miss the bus stop or miss the validation.", "remediation": "Make per-field validation announcements respect a user-controlled verbosity setting; default to submit-time-only on screen-reader use." },
    { "artefactElement": "Finding row: 'Replace banner text with specific error'", "friction": "The specific error helps, but if the banner is at the top of the page and focus stays on submit at the bottom, I'll never hear it. The recommendation says 'move focus to postal code input' — does that come *before* or *after* the announcement? Order matters.", "remediation": "Sequence: announce error first (aria-live=assertive); pause 500ms; then move focus to the offending field. Document the sequence in the spec." },
    { "artefactElement": "Finding row: 'Add aria-describedby from each field to its error message'", "friction": "aria-describedby is read after the field label by default. For a complex form-error context I need the error read with the same urgency as the label — describedby is too quiet.", "remediation": "Use aria-labelledby to chain the label + error message when an error is active, so the error becomes part of the accessible name for the field — not a quiet describedby." }
  ]
}
```

---

## What Would Change This Recommendation

- **International postal-code support.** Multiple correction examples per locale; country selector drives validation rules. The single-example assumption in Path 3 needs revision.
- **Per-field validation creates accessibility regressions.** Defer all validation to submit-time only; the journey map's per-field opportunity goes away.
- **Multi-error submits dominate.** Path 2's single-error cycle no longer applies; the recovery path needs a 'next error' affordance and tab order through error indicators.

---

## Audit

See the heuristic audit pass output above (WCAG-AA checklist) for the full finding matrix and graft recommendation.
