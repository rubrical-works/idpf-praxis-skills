# Accessibility Domain Module

**Source:** `Domains/Accessibility/`
**Tools:** axe-core, Lighthouse, Pa11y
**Target:** WCAG 2.1 Level AA

## Required Packages

```
@axe-core/playwright
axe-core
lighthouse
wait-on
```

## Generated Artifacts

### Artifact 1: `axe.config.js`

axe-core configuration targeting WCAG 2.1 AA with severity-based reporting.

```javascript
// axe.config.js
module.exports = {
  rules: {
    // WCAG 2.1 Level AA ruleset
    'color-contrast': { enabled: true },        // SC 1.4.3
    'non-text-contrast': { enabled: true },     // SC 1.4.11
    'image-alt': { enabled: true },             // SC 1.1.1
    'label': { enabled: true },                 // SC 3.3.2
    'link-name': { enabled: true },             // SC 2.4.4
    'heading-order': { enabled: true },         // SC 2.4.6
    'page-has-heading-one': { enabled: true },  // SC 2.4.6
    'document-title': { enabled: true },        // SC 2.4.2
    'html-has-lang': { enabled: true },         // SC 3.1.1
    'valid-lang': { enabled: true },            // SC 3.1.1
    'bypass': { enabled: true },                // SC 2.4.1
    'focus-order-semantics': { enabled: true }, // SC 2.4.3
    'region': { enabled: true },
    'aria-allowed-attr': { enabled: true },     // SC 4.1.2
    'aria-required-attr': { enabled: true },    // SC 4.1.2
    'aria-valid-attr': { enabled: true },       // SC 4.1.2
    'aria-valid-attr-value': { enabled: true }, // SC 4.1.2
  },
  tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
  resultTypes: ['violations', 'incomplete'],
  reporter: 'v2',
};
```

### Artifact 2: `tests/a11y/a11y.spec.ts`

Playwright-based accessibility test spec that scans discovered routes with axe-core.

```typescript
// tests/a11y/a11y.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Discovered routes — replace or extend with actual routes
const routes = [
  { path: '/', name: 'Homepage' },
  { path: '/login', name: 'Login' },
  // {{DISCOVERED_ROUTES}}
];

test.describe('Accessibility - WCAG 2.1 AA', () => {
  for (const route of routes) {
    test(`${route.name} (${route.path}) has no a11y violations`, async ({ page }) => {
      await page.goto(route.path);

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();

      const violations = results.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious'
      );

      expect(violations, `${violations.length} a11y violation(s) found on ${route.path}`).toHaveLength(0);
    });
  }

  test('keyboard navigation — no focus traps on main flow', async ({ page }) => {
    await page.goto('/');
    // Tab through interactive elements and verify focus is never trapped
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(() => document.activeElement?.tagName);
      expect(focused).not.toBe('BODY'); // Focus should move, not reset
    }
  });
});
```

### Artifact 3: `lighthouse-budget.json`

Lighthouse performance budget with accessibility score gate.

```json
[
  {
    "path": "/*",
    "resourceSizes": [
      { "resourceType": "total", "budget": 500 }
    ],
    "timings": [
      { "metric": "first-contentful-paint", "budget": 2000 },
      { "metric": "interactive", "budget": 5000 }
    ]
  }
]
```

**Note:** Lighthouse accessibility score gate (> 90) is enforced in the CI job via the `--assert` flag or `lhci` configuration, not in the budget file. The budget file covers resource and timing budgets only.

### CI Job: `axe-scan`

```yaml
axe-scan:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4

    - name: Setup Node
      uses: actions/setup-node@v4
      with:
        node-version: '20'

    - name: Install dependencies
      run: {{INSTALL_CMD}}

    - name: Install Playwright browsers
      run: npx playwright install chromium --with-deps

    - name: Build application
      run: npm run build

    - name: Start server
      run: npm run start &

    - name: Wait for server
      run: npx wait-on http://localhost:3000 --timeout 30000

    - name: Run axe accessibility tests
      run: npx playwright test tests/a11y/ --project=chromium

    - name: Upload a11y report
      if: always()
      uses: actions/upload-artifact@v4
      with:
        name: a11y-report
        path: playwright-report/
```

## Manual Testing Areas

Automated scanning covers roughly 30-40% of accessibility issues. The following require manual verification:

- **Keyboard navigation** -- Tab order, focus visibility (SC 2.1.1, 2.4.3, 2.4.7), no keyboard traps (SC 2.1.2)
- **Screen reader testing** -- Content announced correctly with NVDA (Windows) or VoiceOver (macOS/iOS)
- **Cognitive accessibility** -- Readability, clear error messages (SC 3.3.1), consistent navigation (SC 3.2.3)
- **Color-only information** -- Meaning not conveyed by color alone (SC 1.4.1)
- **Text resize** -- Content remains usable at 200% zoom (SC 1.4.4)
- **Focus management** -- Focus moves logically after modal dialogs, route changes, and dynamic content updates
- **Status messages** -- Live regions announce status changes to assistive technology (SC 4.1.3)
- **Mobile touch targets** -- Minimum 44x44 CSS pixels for interactive elements (SC 2.5.5)

**Severity SLAs (from framework):**

| Severity | Impact | SLA |
|----------|--------|-----|
| Critical | Blocker for AT users | Before release |
| Serious | Major barrier | 30 days |
| Moderate | Degraded experience | 60 days |
| Minor | Inconvenience | 90 days |
