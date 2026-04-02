# Dark Pattern Avoidance Reference

Quick-reference for identifying and avoiding privacy-hostile UI patterns that undermine consent validity and violate regulations.

---

## What Are Dark Patterns?

Dark patterns are user interface designs that manipulate users into making choices they would not make if fully informed. In privacy contexts, dark patterns are particularly harmful because:

1. **Consent obtained through manipulation is not valid** under GDPR Article 7
2. **Regulators actively enforce against them** — the CNIL (France), ICO (UK), and EDPB have all issued guidance
3. **They erode user trust** — short-term conversion gains at the cost of long-term reputation

---

## The Six Privacy Dark Patterns

### 1. Reject-All Disparity

Making "Reject" harder to find or use than "Accept."

```html
<!-- DARK PATTERN: Accept is prominent, reject is hidden -->
<div class="consent-actions">
  <button class="btn btn-large btn-primary">Accept All Cookies</button>
  <a href="/preferences" class="text-xs text-gray">manage preferences</a>
</div>

<!-- COMPLIANT: Equal prominence for all options -->
<div class="consent-actions">
  <button class="btn btn-secondary">Reject All</button>
  <button class="btn btn-secondary">Customize</button>
  <button class="btn btn-primary">Accept All</button>
</div>
```

**Violations to watch for:**
| Pattern | Why It's Wrong |
|---------|---------------|
| Accept = button, Reject = text link | Unequal visual weight |
| Accept = bright color, Reject = gray | Color manipulation |
| Reject requires 2+ clicks, Accept requires 1 | Friction asymmetry |
| Reject is in a sub-menu or "advanced" section | Hidden option |
| Only "Accept" and "Learn More" shown | No reject option at first layer |

### 2. Pre-Checked Boxes

Consent checkboxes that default to checked state.

```html
<!-- DARK PATTERN: Pre-checked (invalid under GDPR Art. 7) -->
<label>
  <input type="checkbox" name="marketing" checked>
  Send me marketing emails
</label>

<!-- COMPLIANT: Unchecked by default -->
<label>
  <input type="checkbox" name="marketing">
  Send me marketing emails
</label>
```

**Where pre-checked boxes commonly appear:**
- Cookie preference centers (analytics and marketing pre-selected)
- Registration forms (newsletter opt-in)
- Checkout flows (partner marketing)
- Account settings (data sharing)

**The rule:** Consent requires an affirmative act. A pre-checked box is not affirmative because the user has not actively chosen to consent — they have merely failed to opt out.

### 3. Cookie Walls

Blocking access to content unless the user accepts all cookies.

```
DARK PATTERN:
┌────────────────────────────────────────┐
│                                        │
│   Accept cookies to view this content  │
│                                        │
│        [Accept All Cookies]            │
│                                        │
│   The page content is hidden behind    │
│   this overlay. You cannot scroll,     │
│   read, or interact with anything.     │
│                                        │
└────────────────────────────────────────┘

COMPLIANT:
┌────────────────────────────────────────┐
│ We use cookies. [Reject] [Accept All]  │
└────────────────────────────────────────┘
┌────────────────────────────────────────┐
│                                        │
│   Page content is fully visible and    │
│   accessible regardless of cookie      │
│   choice.                              │
│                                        │
└────────────────────────────────────────┘
```

**GDPR position:** Consent is not "freely given" if the alternative is losing access to the service. Cookie walls generally violate Article 7(4).

**CCPA position:** Less restrictive — non-discrimination principle applies but cookie walls are not explicitly prohibited.

### 4. Confirmshaming

Using guilt-inducing or manipulative language to discourage rejection.

| Dark Pattern | Compliant Alternative |
|-------------|----------------------|
| "No thanks, I hate saving money" | "Decline" |
| "I don't care about my privacy" | "Reject All" |
| "Continue with limited experience" | "Continue without cookies" |
| "Maybe later" (implies temporary) | "No" or "Reject" |

**The rule:** Use neutral, factual language for both acceptance and rejection.

### 5. Nagging

Repeatedly showing consent prompts after the user has rejected, hoping they will eventually accept out of fatigue.

**Violations:**
- Re-showing banner on every page after rejection
- "Are you sure?" confirmation when rejecting
- Pop-up reminders about "enhanced experience" after rejection
- Time-based re-prompting (showing banner again after X days despite rejection)

**The rule:** Respect the user's choice. A rejection should be stored and honored until the user actively revisits their preferences.

### 6. Hidden Withdrawal

Making it difficult to change or withdraw consent after it has been given.

**Violations:**
- No preference center link on the site
- Preference center buried in legal pages
- Requiring account login to change cookie preferences
- No way to revoke consent without clearing all cookies manually

**The rule:** Withdrawing consent must be as easy as giving it (GDPR Article 7(3)).

---

## Audit Checklist

Use this checklist to audit your consent implementation for dark patterns:

### Banner/Modal
- [ ] "Reject All" has equal visual prominence to "Accept All"
- [ ] Both options are buttons (not one button and one link)
- [ ] Both options use similar size, color contrast, and positioning
- [ ] Rejecting requires the same number of clicks as accepting
- [ ] Banner does not block page content (no cookie wall)
- [ ] Banner can be dismissed without choosing (defaults to reject)

### Language
- [ ] No guilt-inducing rejection text (no confirmshaming)
- [ ] Options use neutral, descriptive labels
- [ ] No implied consequences for rejection beyond stated functionality loss

### Checkboxes and Defaults
- [ ] All non-essential consent checkboxes default to unchecked
- [ ] Necessary cookies section is clearly marked as non-toggleable
- [ ] No bundled consent (each category is independently selectable)

### Post-Consent
- [ ] No repeated prompts after rejection (no nagging)
- [ ] Preference center is accessible from every page
- [ ] Withdrawing consent is as easy as giving it
- [ ] Consent changes take effect immediately

### Regulatory Alignment
- [ ] Compliant with GDPR Article 7 (freely given, specific, informed, unambiguous)
- [ ] No discrimination against users who reject (CCPA non-discrimination)
- [ ] Privacy policy is linked from all consent UI

---

## Enforcement Examples

| Regulator | Company | Fine | Dark Pattern |
|-----------|---------|------|-------------|
| CNIL (France) | Google | 150M EUR | Reject required more clicks than accept |
| CNIL (France) | Facebook | 60M EUR | No single reject button on first layer |
| ICO (UK) | Guidance | — | Pre-checked boxes invalidate consent |
| EDPB | Guidelines | — | Cookie walls generally not compliant |

These enforcement actions demonstrate that regulators actively look for and penalize dark patterns in consent implementations.

---
