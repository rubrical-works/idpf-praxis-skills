# Cookie Compliance Reference

Quick-reference for classifying, managing, and auditing cookies to meet privacy regulation requirements.

---

## Cookie Classification

### The Four Categories

Every cookie your site sets — whether first-party or third-party — must be classified into one of these categories:

| Category | Consent Required | Description | Examples |
|----------|:---------------:|-------------|----------|
| **Strictly Necessary** | No | Essential for site function; site breaks without them | Session ID, CSRF token, load balancer, auth token, consent cookie |
| **Functional** | Yes | Enhanced features; site works without them but with reduced functionality | Language preference, theme, remembered login, font size |
| **Analytics** | Yes | Usage measurement to improve the site | Google Analytics `_ga`, Hotjar `_hj*`, page view counters |
| **Marketing** | Yes | Advertising, retargeting, cross-site tracking | Ad network cookies (`_fbp`, `_gcl_*`), retargeting pixels |

### Classification Decision Tree

```
Is the cookie essential for the page to function?
├── YES → Strictly Necessary (no consent needed)
│         Examples: session ID, CSRF, auth, cart
└── NO → Does it enable a feature the user explicitly requested?
    ├── YES → Functional (consent required)
    │         Examples: language, theme, "remember me"
    └── NO → Does it measure site usage for improvement?
        ├── YES → Analytics (consent required)
        │         Examples: page views, click maps
        └── NO → Marketing (consent required)
                  Examples: ad targeting, retargeting
```

### Common Classification Mistakes

| Cookie | Often Misclassified As | Actually Is | Why |
|--------|----------------------|-------------|-----|
| `_ga` (Google Analytics) | Necessary | Analytics | Site works without analytics |
| Language preference | Necessary | Functional | Site works with default language |
| "Remember me" login | Necessary | Functional | User can re-login manually |
| Consent cookie itself | Analytics | Necessary | Required to remember consent |
| CSRF token | Functional | Necessary | Security requirement |
| Social media login | Necessary | Functional | Alternative login methods exist |

---

## Cookie Banner Implementation

### Banner Requirements

| Requirement | Details |
|-------------|---------|
| **Timing** | Must appear before any non-essential cookies are set |
| **Reject parity** | "Reject All" must be as prominent as "Accept All" |
| **Non-blocking** | Must not block page content (no cookie walls under GDPR) |
| **Privacy link** | Must link to full privacy/cookie policy |
| **Accessible** | ARIA roles, keyboard navigable, screen reader compatible |
| **Persistent choice** | User's choice must be remembered (don't re-prompt) |

### HTML Structure

```html
<div id="cookie-banner"
     role="dialog"
     aria-label="Cookie consent"
     aria-describedby="cookie-description">

  <p id="cookie-description">
    We use cookies to improve your experience. Strictly necessary cookies
    are always active. You can choose which other categories to allow.
    <a href="/cookie-policy">Cookie Policy</a>
  </p>

  <div class="cookie-actions">
    <!-- All three buttons have equal visual weight -->
    <button id="cookie-reject"
            class="cookie-btn cookie-btn-secondary"
            aria-label="Reject all non-essential cookies">
      Reject All
    </button>
    <button id="cookie-customize"
            class="cookie-btn cookie-btn-secondary"
            aria-label="Customize cookie preferences">
      Customize
    </button>
    <button id="cookie-accept"
            class="cookie-btn cookie-btn-primary"
            aria-label="Accept all cookies">
      Accept All
    </button>
  </div>
</div>
```

### JavaScript Implementation

```javascript
class CookieBanner {
  constructor() {
    this.banner = document.getElementById('cookie-banner');
    this.bindEvents();
  }

  bindEvents() {
    document.getElementById('cookie-accept')
      .addEventListener('click', () => this.setConsent('all'));
    document.getElementById('cookie-reject')
      .addEventListener('click', () => this.setConsent('none'));
    document.getElementById('cookie-customize')
      .addEventListener('click', () => this.showPreferences());
  }

  setConsent(level) {
    const categories = {
      necessary: true,
      functional: level === 'all',
      analytics: level === 'all',
      marketing: level === 'all'
    };

    this.saveConsent(categories);
    this.enforceConsent(categories);
    this.hideBanner();
  }

  saveConsent(categories) {
    const consent = {
      version: 1,
      timestamp: new Date().toISOString(),
      categories
    };
    document.cookie =
      `privacy-consent=${encodeURIComponent(JSON.stringify(consent))}` +
      '; path=/; max-age=15552000; secure; samesite=lax';
  }

  enforceConsent(categories) {
    // Fire custom event for script loaders to listen to
    document.dispatchEvent(new CustomEvent('consent-updated', {
      detail: categories
    }));
  }

  hideBanner() {
    this.banner.setAttribute('aria-hidden', 'true');
    this.banner.style.display = 'none';
  }

  showPreferences() {
    // Navigate to or open preference center
    window.location.href = '/privacy-preferences';
  }
}

// Initialize only if no consent stored
if (!document.cookie.includes('privacy-consent=')) {
  new CookieBanner();
}
```

---

## Cookie Auditing

### Why Audit

Cookie auditing identifies every cookie your site sets, classifies them, and verifies that consent enforcement is working. Regulations require you to know what data you're collecting.

### Audit Process

#### 1. Inventory

Open your site in an incognito browser window with DevTools open:

```
Browser DevTools → Application tab → Cookies → [your domain]
```

Record every cookie: name, domain, path, expiration, secure flag, SameSite value.

#### 2. Classify

Map each cookie to a category using the decision tree above. Create a cookie register:

| Cookie Name | Domain | Category | Purpose | Expiration | Third-Party? |
|-------------|--------|----------|---------|------------|:------------:|
| `session_id` | `.example.com` | Necessary | Session management | Session | No |
| `_ga` | `.example.com` | Analytics | Google Analytics user ID | 2 years | Yes (set by GA) |
| `_fbp` | `.example.com` | Marketing | Facebook pixel | 3 months | Yes (set by FB) |

#### 3. Verify Enforcement

Test consent enforcement by:

1. **Reject all** → Verify only strictly necessary cookies are set
2. **Accept analytics only** → Verify analytics cookies appear, marketing does not
3. **Accept all** → Verify all cookies set
4. **Revoke analytics** → Verify analytics cookies are removed

#### 4. Document

Maintain the cookie register as a living document. Update when:
- New third-party scripts are added
- Cookie purposes change
- New cookies are discovered in audits

### Cookie Attributes Reference

| Attribute | Recommended Setting | Why |
|-----------|-------------------|-----|
| `Secure` | Always set | Prevents transmission over HTTP |
| `HttpOnly` | Set for server-read cookies | Prevents XSS access |
| `SameSite` | `Lax` (default) or `Strict` | Prevents CSRF; `None` only for cross-site |
| `Path` | `/` or most restrictive applicable | Limits cookie scope |
| `Max-Age` | Shortest practical duration | Data minimization |
| `Domain` | Omit (defaults to exact host) | Prevents subdomain leakage |

---

## Cookie Policy Requirements

A cookie policy should include:

| Section | Content |
|---------|---------|
| What cookies are | Brief explanation for non-technical users |
| Categories used | List the four categories with descriptions |
| Cookie register | Table of all cookies (name, purpose, duration, party) |
| How to manage | Link to preference center and browser settings |
| Contact | Data protection officer or privacy contact |
| Last updated | Date of last policy review |

---
