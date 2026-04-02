# Security Domain Module

**Source:** `Domains/Security/`
**Tools:** Semgrep (SAST), OWASP ZAP (DAST), Gitleaks (Secret Scanning), Snyk (SCA)
**Coverage:** OWASP Top 10

## Required Packages

```
wait-on
```

**Note:** Security tools are primarily CLI binaries and GitHub Actions, not npm packages. Semgrep, Gitleaks, and ZAP are installed via their respective GitHub Actions or standalone installers. Snyk requires `SNYK_TOKEN` as a secret.

## Generated Artifacts

### Artifact 1: `.semgrep.yml`

Semgrep SAST configuration targeting OWASP Top 10 with custom rules for common web vulnerabilities.

```yaml
# .semgrep.yml
rules:
  # Use pre-built OWASP Top 10 ruleset
  - id: owasp-top-ten
    # Semgrep registry rulesets
    # Applied via CLI: semgrep --config p/owasp-top-ten

# Custom project rules
  - id: no-hardcoded-secrets
    patterns:
      - pattern: |
          $KEY = "..."
      - metavariable-regex:
          metavariable: $KEY
          regex: (password|secret|api_key|token|private_key)
    message: "Hardcoded secret detected in variable '$KEY'. Use environment variables or a secrets manager."
    severity: ERROR
    languages: [javascript, typescript]

  - id: no-eval
    pattern: eval(...)
    message: "eval() is a security risk — potential code injection (CWE-95). Use safer alternatives."
    severity: ERROR
    languages: [javascript, typescript]

  - id: no-innerhtml
    pattern: $EL.innerHTML = ...
    message: "Direct innerHTML assignment is an XSS risk (CWE-79). Use textContent or a sanitizer."
    severity: WARNING
    languages: [javascript, typescript]

  - id: no-sql-string-concat
    pattern: |
      $QUERY = "..." + $INPUT + "..."
    message: "SQL string concatenation detected — potential SQL injection (CWE-89). Use parameterized queries."
    severity: ERROR
    languages: [javascript, typescript]

  - id: no-unvalidated-redirect
    patterns:
      - pattern: |
          res.redirect($URL)
      - pattern-not: |
          res.redirect("/...")
    message: "Unvalidated redirect detected (CWE-601). Validate redirect URLs against an allowlist."
    severity: WARNING
    languages: [javascript, typescript]
```

### Artifact 2: `zap-config.yaml`

OWASP ZAP DAST configuration for automated scanning of the running application.

```yaml
# zap-config.yaml
env:
  contexts:
    - name: "{{APP_NAME}}"
      urls:
        - "http://localhost:3000"
      includePaths:
        - "http://localhost:3000.*"
      excludePaths:
        - ".*\\.js$"
        - ".*\\.css$"
        - ".*\\.png$"
        - ".*\\.jpg$"
  parameters:
    failOnError: true
    failOnWarning: false
    progressToStdout: true

jobs:
  - type: spider
    parameters:
      context: "{{APP_NAME}}"
      maxDuration: 5
      maxDepth: 5

  - type: spiderAjax
    parameters:
      context: "{{APP_NAME}}"
      maxDuration: 5

  - type: passiveScan-wait
    parameters:
      maxDuration: 10

  - type: activeScan
    parameters:
      context: "{{APP_NAME}}"
      maxRuleDurationInMins: 5
      maxScanDurationInMins: 30

  - type: report
    parameters:
      template: "traditional-html"
      reportDir: "reports/dast"
      reportFile: "zap-report"
    risks:
      - high
      - medium
      - low
```

### Artifact 3: `.gitleaks.toml`

Gitleaks secret scanning configuration with project-specific allowlists.

```toml
# .gitleaks.toml
title = "Gitleaks Configuration"

# Use default rules plus custom patterns
[extend]
useDefault = true

# Custom rules for project-specific patterns
[[rules]]
id = "generic-api-key"
description = "Generic API Key"
regex = '''(?i)(api[_-]?key|apikey)\s*[=:]\s*['"][a-zA-Z0-9]{20,}['"]'''
tags = ["key", "api"]
severity = "high"

[[rules]]
id = "jwt-token"
description = "JWT Token"
regex = '''eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*'''
tags = ["token", "jwt"]
severity = "high"

# Allowlist — paths and patterns that are safe to ignore
[allowlist]
paths = [
  '''\.test\.ts$''',
  '''\.spec\.ts$''',
  '''fixtures/''',
  '''__mocks__/''',
  '''\.example$''',
  '''\.sample$''',
]
regexTarget = "match"
regexes = [
  '''EXAMPLE_''',
  '''placeholder''',
  '''test-secret''',
  '''dummy-key''',
]
```

### Artifact 4: `security-gates.json`

CI gate configuration defining pass/fail criteria per security scan type.

```json
{
  "gates": {
    "sast": {
      "failOn": ["critical", "high"],
      "warnOn": ["medium"],
      "allowOn": ["low", "info"],
      "description": "Static analysis must pass with no critical or high findings"
    },
    "sca": {
      "failOn": ["critical"],
      "warnOn": ["high"],
      "allowOn": ["medium", "low"],
      "description": "Dependency scan must pass with no critical vulnerabilities"
    },
    "dast": {
      "failOn": ["critical"],
      "warnOn": ["high", "medium"],
      "allowOn": ["low"],
      "description": "Dynamic scan must pass with no critical findings"
    },
    "secrets": {
      "failOn": ["any"],
      "description": "Any detected secret is a hard failure"
    }
  },
  "remediationSLAs": {
    "critical": { "hours": 24, "description": "CVSS 9.0-10.0" },
    "high": { "days": 7, "description": "CVSS 7.0-8.9" },
    "medium": { "days": 30, "description": "CVSS 4.0-6.9" },
    "low": { "days": 90, "description": "CVSS 0.1-3.9" }
  }
}
```

### CI Job: `sast`

```yaml
sast:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4

    - name: Run Semgrep SAST
      uses: returntocorp/semgrep-action@v1
      with:
        config: >-
          p/owasp-top-ten
          p/typescript
          .semgrep.yml
      env:
        SEMGREP_APP_TOKEN: ${{ secrets.SEMGREP_APP_TOKEN }}

    - name: Upload SAST results
      if: always()
      uses: actions/upload-artifact@v4
      with:
        name: sast-results
        path: semgrep-results.json
```

### CI Job: `sca`

```yaml
sca:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4

    - name: Setup Node
      uses: actions/setup-node@v4
      with:
        node-version: '20'

    - name: Install dependencies
      run: {{INSTALL_CMD}}

    - name: Run Snyk SCA
      uses: snyk/actions/node@master
      env:
        SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
      with:
        args: --severity-threshold=high

    - name: Upload SCA results
      if: always()
      uses: actions/upload-artifact@v4
      with:
        name: sca-results
        path: snyk-results.json
```

### CI Job: `secret-scan`

```yaml
secret-scan:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
      with:
        fetch-depth: 0

    - name: Run Gitleaks
      uses: gitleaks/gitleaks-action@v2
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        GITLEAKS_CONFIG: .gitleaks.toml

    - name: Upload secret scan results
      if: always()
      uses: actions/upload-artifact@v4
      with:
        name: secret-scan-results
        path: gitleaks-report.json
```

### CI Job: `dast`

```yaml
dast:
  runs-on: ubuntu-latest
  needs: [sast, sca, secret-scan]
  steps:
    - uses: actions/checkout@v4

    - name: Setup Node
      uses: actions/setup-node@v4
      with:
        node-version: '20'

    - name: Install dependencies
      run: {{INSTALL_CMD}}

    - name: Build application
      run: npm run build

    - name: Start application
      run: npm run start &

    - name: Wait for application
      run: npx wait-on http://localhost:3000 --timeout 30000

    - name: Run OWASP ZAP DAST
      uses: zaproxy/action-full-scan@v0.10.0
      with:
        target: 'http://localhost:3000'
        allow_issue_writing: false
        cmd_options: '-c zap-config.yaml'

    - name: Upload DAST report
      if: always()
      uses: actions/upload-artifact@v4
      with:
        name: dast-report
        path: reports/dast/
```

## Manual Testing Areas

Automated security scanning catches known vulnerability patterns but cannot replace human analysis:

- **Threat modeling** -- Identifying attack vectors specific to the application's architecture and data flows (OWASP A04: Insecure Design)
- **Business logic vulnerabilities** -- Authorization bypass, privilege escalation, and workflow manipulation that automated tools miss
- **Penetration testing** -- Manual exploitation attempts combining multiple vulnerabilities, required quarterly for PCI-DSS
- **Authentication flow testing** -- OAuth/OIDC edge cases, session management, token rotation, and multi-factor bypass scenarios
- **SAST false positive triage** -- Reviewing findings to separate true positives from false positives (target < 10% false positive rate)
- **Vulnerability risk assessment** -- Evaluating CVSS scores in context of the application's deployment and exposure
- **Security exception management** -- Documenting risk acceptance for known vulnerabilities with time-bounded review dates
- **Compliance mapping** -- Mapping security test coverage to SOC 2, PCI-DSS, HIPAA, or GDPR controls

**Remediation SLAs (from framework):**

| Severity | CVSS Score | Remediation SLA |
|----------|------------|-----------------|
| Critical | 9.0 - 10.0 | 24 hours |
| High | 7.0 - 8.9 | 7 days |
| Medium | 4.0 - 6.9 | 30 days |
| Low | 0.1 - 3.9 | 90 days |

**Pipeline Gate Strategy (from framework):**

| Stage | Tool Type | Gate Criteria |
|-------|-----------|---------------|
| Commit | SAST | No critical/high issues |
| Commit | Secret Scan | No secrets detected |
| PR | SCA | No critical vulnerabilities |
| Pre-Deploy | DAST | No critical findings |
