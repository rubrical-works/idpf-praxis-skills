# Multi-Domain Scaffolding Example
Example output when scaffolding accessibility + security + QA for a React/Next.js project.
## Detected Project Context
```
Framework: Next.js (detected from next in package.json)
Package manager: npm (detected from package-lock.json)
Existing setup: Playwright configured (playwright.config.ts found)
Routes discovered: /, /about, /dashboard, /settings (from app/ directory)
Existing scaffolding: None detected
```
## Generated Artifacts
### Accessibility
- `axe.config.js` — WCAG 2.1 AA rules
- `tests/a11y/a11y.spec.ts` — Route-based axe scans for /, /about, /dashboard, /settings
- `lighthouse-budget.json` — Performance > 90 threshold
### Security
- `.semgrep.yml` — OWASP Top 10 rules for JavaScript/TypeScript
- `zap-config.yaml` — DAST scanning targets: /, /about, /dashboard, /settings
- `.gitleaks.toml` — Secret scanning with Next.js .env allowlist
- `security-gates.json` — Critical: 0 days, High: 7 days SLA
### QA Automation
- `tests/e2e/pages/home.page.ts` — Page Object for /
- `tests/e2e/pages/about.page.ts` — Page Object for /about
- `tests/e2e/pages/dashboard.page.ts` — Page Object for /dashboard
- `tests/e2e/pages/settings.page.ts` — Page Object for /settings
- `tests/e2e/fixtures/test-data.ts` — Test data fixtures
- `tests/e2e/smoke.spec.ts` — Smoke tests for all routes
- `tests/e2e/regression.spec.ts` — Regression test template
## Deduplicated Install Command
```bash
npm install -D @axe-core/playwright axe-core lighthouse wait-on
```
Note: `@axe-core/playwright` is shared by accessibility and QA — listed once.
## Merged CI Workflow (testing.yml)
```yaml
name: Testing
on: [push, pull_request]
jobs:
  axe-scan:
    # ... accessibility CI job
  sast:
    # ... security SAST job
  secret-scan:
    # ... security secret scanning job
  dast:
    needs: [sast]
    # ... security DAST job (after SAST)
  smoke:
    # ... QA smoke tests
  regression:
    needs: [smoke]
    # ... QA regression tests
```
## Next Steps (Manual)
**Accessibility:**
- Test with screen readers (NVDA, VoiceOver)
- Verify keyboard navigation for all interactive elements
- Check color contrast ratios
**Security:**
- Conduct threat modeling for /dashboard and /settings
- Review authentication flow for vulnerabilities
- Validate CORS and CSP headers
**QA:**
- Set up visual regression baseline
- Identify exploratory testing scenarios
- Configure flaky test retry strategy
