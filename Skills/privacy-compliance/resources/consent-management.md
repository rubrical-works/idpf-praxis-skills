# Consent Management Reference

Quick-reference for implementing consent collection, storage, and enforcement patterns that comply with privacy regulations.

---

## The Core Principle

**Nothing loads before consent.** Every non-essential script, cookie, pixel, or tracker must wait until the user has made an affirmative choice. Silence or inaction is not consent.

---

## Consent-Before-Load Patterns

### Script Loading Gate

```javascript
// Consent-gated script loader
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Only load analytics after explicit consent
function initAnalytics() {
  const consent = getConsentState();
  if (consent.categories.analytics) {
    loadScript('https://analytics.example.com/tracker.js');
  }
}

// Listen for consent changes
document.addEventListener('consent-updated', (e) => {
  if (e.detail.analytics) {
    initAnalytics();
  }
});
```

### Tag Manager Integration

```javascript
// Google Tag Manager with consent mode
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }

// Default: deny everything
gtag('consent', 'default', {
  'analytics_storage': 'denied',
  'ad_storage': 'denied',
  'functionality_storage': 'denied',
  'personalization_storage': 'denied',
  'security_storage': 'granted'    // Always allowed
});

// After user gives consent
function updateConsent(categories) {
  gtag('consent', 'update', {
    'analytics_storage': categories.analytics ? 'granted' : 'denied',
    'ad_storage': categories.marketing ? 'granted' : 'denied',
    'functionality_storage': categories.functional ? 'granted' : 'denied',
    'personalization_storage': categories.functional ? 'granted' : 'denied'
  });
}
```

### Server-Side Enforcement

```javascript
// Express.js middleware example
function consentMiddleware(req, res, next) {
  const consentCookie = req.cookies['privacy-consent'];
  if (!consentCookie) {
    // No consent — only set essential cookies
    res.locals.consent = { necessary: true };
    return next();
  }

  try {
    res.locals.consent = JSON.parse(consentCookie);
  } catch {
    res.locals.consent = { necessary: true };
  }
  next();
}

// Use in route handlers
app.get('/page', consentMiddleware, (req, res) => {
  const includeAnalytics = res.locals.consent.categories?.analytics === true;
  res.render('page', { includeAnalytics });
});
```

---

## Consent Storage

### Cookie-Based Storage (Recommended)

```javascript
// Set consent cookie
function saveConsent(categories) {
  const consent = {
    version: 2,
    timestamp: new Date().toISOString(),
    categories: {
      necessary: true,        // Always true
      functional: categories.functional || false,
      analytics: categories.analytics || false,
      marketing: categories.marketing || false
    }
  };

  document.cookie = `privacy-consent=${encodeURIComponent(JSON.stringify(consent))}` +
    '; path=/' +
    '; max-age=15552000' +   // 180 days
    '; secure' +
    '; samesite=lax';
}
```

### Why Cookies Over localStorage

| Factor | Cookie | localStorage |
|--------|--------|-------------|
| Server-side access | Yes — travels with requests | No — client only |
| Expiration control | Built-in (`max-age`, `expires`) | Manual cleanup required |
| Cross-subdomain | Yes (with `domain` attribute) | No — same origin only |
| GDPR compliance | Consent cookie is "strictly necessary" | Also allowed, but less practical |

### Consent Versioning

When consent requirements change (new categories, new vendors), increment the consent version:

```javascript
const CURRENT_CONSENT_VERSION = 2;

function isConsentCurrent(consent) {
  return consent.version === CURRENT_CONSENT_VERSION;
}

// Re-prompt if consent schema has changed
if (!isConsentCurrent(storedConsent)) {
  showConsentBanner();
}
```

---

## Preference Centers

### Requirements

| Requirement | Details |
|-------------|---------|
| Accessibility | Linked from every page (footer is standard location) |
| Current state | Shows the user's actual consent, not defaults |
| Immediate effect | Revoking consent stops processing immediately |
| Granularity | At minimum per-category; ideally per-vendor |
| Idempotent | Opening and closing without changes preserves state |

### UI Structure

```html
<div class="preference-center" role="dialog" aria-label="Privacy preferences">
  <h2>Privacy Preferences</h2>
  <p>Manage how we use cookies and data on this site.</p>

  <!-- Strictly Necessary — always on, not toggleable -->
  <fieldset>
    <legend>Strictly Necessary</legend>
    <p>Required for the site to function. Cannot be disabled.</p>
    <input type="checkbox" checked disabled aria-label="Strictly necessary cookies">
  </fieldset>

  <!-- Functional — toggleable -->
  <fieldset>
    <legend>Functional</legend>
    <p>Remember your preferences like language and theme.</p>
    <input type="checkbox" id="pref-functional" aria-label="Functional cookies">
    <!-- Show specific cookies/vendors in this category -->
    <details>
      <summary>See cookies in this category</summary>
      <table>
        <tr><td>lang_pref</td><td>Language preference</td><td>1 year</td></tr>
        <tr><td>theme</td><td>UI theme selection</td><td>1 year</td></tr>
      </table>
    </details>
  </fieldset>

  <!-- Analytics — toggleable -->
  <fieldset>
    <legend>Analytics</legend>
    <p>Help us understand how visitors use the site.</p>
    <input type="checkbox" id="pref-analytics" aria-label="Analytics cookies">
  </fieldset>

  <!-- Marketing — toggleable -->
  <fieldset>
    <legend>Marketing</legend>
    <p>Used for advertising and cross-site tracking.</p>
    <input type="checkbox" id="pref-marketing" aria-label="Marketing cookies">
  </fieldset>

  <div class="preference-actions">
    <button id="save-preferences">Save Preferences</button>
  </div>
</div>
```

---

## Consent-as-a-Service vs Self-Hosted (CMP Comparison)

### Consent Management Platforms (CMP)

A CMP is a third-party service that manages consent collection, storage, and enforcement.

| CMP Approach | When to Use |
|--------------|-------------|
| **Use a CMP** | Many third-party integrations, EU-focused audience, need compliance reporting, resource-constrained team |
| **Self-host** | Simple sites, few trackers, strong privacy stance, no budget for SaaS |

### CMP Selection Criteria

| Criterion | Questions |
|-----------|-----------|
| TCF compliance | Does it support IAB Transparency & Consent Framework? |
| Regulation coverage | Does it handle GDPR, CCPA, LGPD, ePrivacy? |
| Integration | Does it work with your tag manager and analytics? |
| Data residency | Where does the CMP store consent records? |
| Customization | Can you match your site's branding? |
| Performance | What is the script size and load impact? |

### Self-Hosted Implementation Checklist

- [ ] Consent banner UI with accept/reject/customize
- [ ] Preference center with per-category toggles
- [ ] Cookie for storing consent state (first-party, secure, SameSite)
- [ ] Script loading gate (nothing loads before consent)
- [ ] Consent versioning for requirement changes
- [ ] Server-side enforcement middleware
- [ ] Consent audit log (who consented to what, when)
- [ ] Link to privacy policy from all consent UI
- [ ] Accessible and keyboard-navigable
- [ ] Mobile-responsive

---

## Common Mistakes

| Mistake | Why It's Wrong |
|---------|---------------|
| Loading analytics before consent | Processes data without lawful basis |
| Storing consent in localStorage only | Cannot enforce server-side; no expiration |
| No consent versioning | Cannot re-prompt when requirements change |
| Preference center shows defaults, not actual state | Misleads users about current settings |
| "Accept" dismisses banner, "Reject" does nothing | Dark pattern — reject must actively save rejection |
| No server-side enforcement | Client-side only consent can be bypassed |

---
