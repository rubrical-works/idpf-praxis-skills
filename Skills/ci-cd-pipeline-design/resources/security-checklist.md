# CI/CD Security Checklist
**Version:** v0.7.0
## Pipeline Security
### Authentication & Authorization
- [ ] **Pipeline triggers secured** - Branch protection rules enabled, required reviewers configured, status checks required before merge
- [ ] **Access control configured** - Least privilege principle, role-based access control, audit logging enabled
- [ ] **Token security** - Short-lived tokens preferred, token rotation configured, no long-lived personal tokens
### Secrets Management
- [ ] **Secrets stored securely** - Native secret management (GitHub Secrets, GitLab CI Variables), external vault (HashiCorp Vault, AWS Secrets Manager), never in repository
- [ ] **Secret access restricted** - Environment-scoped secrets, branch-restricted secrets, minimal secret exposure
- [ ] **Secret usage audited** - Access logs enabled, alert on unusual access, regular secret rotation
### Configuration Example
```yaml
# GitHub Actions - Environment secrets
deploy:
  environment: production  # Requires approval, uses env-specific secrets
  steps:
    - name: Deploy
      env:
        API_KEY: ${{ secrets.PRODUCTION_API_KEY }}  # Not ${{ secrets.API_KEY }}
```
## Code Security
### Static Analysis (SAST)
- [ ] **SAST tool configured** - CodeQL, Semgrep, or SonarQube; custom rules for your stack; regular rule updates
- [ ] **Findings triaged** - Critical/High block pipeline, Medium tracked in issues, false positives documented
### Example SAST Configuration
```yaml
security:
  steps:
    - name: Run SAST
      run: |
        semgrep --config=auto \
                --config=p/security-audit \
                --config=p/secrets \
                --error \
                --severity ERROR
    - name: Quality Gate
      run: |
        if grep -q "CRITICAL\|HIGH" semgrep-results.sarif; then
          echo "Critical/High findings detected"
          exit 1
        fi
```
### Secret Detection
- [ ] **Pre-commit hooks** - GitLeaks or TruffleHog, block commits with secrets, developer education
- [ ] **Pipeline scanning** - Scan on every push, historical commit scanning, alert security team
### Example Configuration
```yaml
secret-scan:
  steps:
    - uses: gitleaks/gitleaks-action@v2
      with:
        fail: true
    - name: Custom secret scan
      run: |
        grep -r "AKIA[A-Z0-9]{16}" . && exit 1 || true  # AWS keys
        grep -r "sk-[a-zA-Z0-9]{48}" . && exit 1 || true  # OpenAI keys
```
## Dependency Security
### Vulnerability Scanning
- [ ] **Automated scanning** - npm audit / pip-audit / cargo audit, Snyk or Dependabot, scheduled scans (not just on commit)
- [ ] **Policy enforcement** - Block critical vulnerabilities, track medium/low in issues, waiver process documented
### Example Configuration
```yaml
dependency-scan:
  steps:
    - name: Check dependencies
      run: |
        npm audit --audit-level=high
        snyk test --severity-threshold=high
    - name: Generate SBOM
      run: |
        syft packages . -o spdx-json > sbom.json
```
### Update Strategy
- [ ] **Automated updates** - Dependabot or Renovate configured, auto-merge for patches, required review for major updates
- [ ] **Update verification** - Full test suite on dependency updates, canary deployment for updates, rollback plan
## Container Security
### Image Building
- [ ] **Base image security** - Official images only, pinned image tags (not :latest), minimal base images
- [ ] **Build security** - Multi-stage builds, no secrets in images, non-root user
### Example Dockerfile
```dockerfile
FROM node:20.10.0-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
FROM node:20.10.0-alpine
RUN adduser -D appuser
USER appuser
WORKDIR /app
COPY --from=build --chown=appuser /app/node_modules ./node_modules
COPY --chown=appuser . .
CMD ["node", "index.js"]
```
### Image Scanning
- [ ] **Container scanning enabled** - Trivy, Clair, or Anchore; scan before push; block on critical vulnerabilities
- [ ] **Runtime security** - Read-only filesystem, dropped capabilities, security contexts
### Example Configuration
```yaml
container-security:
  steps:
    - name: Build image
      run: docker build -t myapp:${{ github.sha }} .
    - name: Scan image
      run: |
        trivy image \
          --exit-code 1 \
          --severity CRITICAL,HIGH \
          myapp:${{ github.sha }}
    - name: Sign image
      run: |
        cosign sign --key env://COSIGN_KEY myapp:${{ github.sha }}
```
## Infrastructure Security
### Runner Security
- [ ] **Self-hosted runner hardening** - Ephemeral runners preferred, isolated networks, regular patching
- [ ] **Runner permissions** - Minimal IAM permissions, no long-lived credentials, network segmentation
### Environment Isolation
- [ ] **Environment separation** - Separate credentials per environment, network isolation, access controls
- [ ] **Production protection** - Required approvals, deployment windows, change tracking
## Audit & Compliance
### Logging
- [ ] **Pipeline audit logs** - All executions logged, secret access logged, retention policy defined
- [ ] **Deployment tracking** - What was deployed, who approved, when deployed
### Example Audit Entry
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "event": "deployment",
  "environment": "production",
  "version": "1.2.3",
  "commit": "abc1234",
  "actor": "deploy-bot",
  "approver": "user@example.com",
  "pipeline_id": "12345",
  "status": "success"
}
```
### Compliance
- [ ] **Change management** - All changes through pipeline, no manual deployments, documentation complete
- [ ] **Separation of duties** - Developers can't deploy to production alone, security team can audit, operations can rollback
## Incident Response
### Rollback Capability
- [ ] **Automated rollback** - Health check failures trigger rollback, previous version preserved, rollback tested regularly
- [ ] **Manual rollback** - Clear procedure documented, accessible to on-call, tested regularly
### Security Incident
- [ ] **Compromise response** - Rotate all secrets immediately, audit recent deployments, review access logs
- [ ] **Pipeline breach** - Disable affected pipelines, review recent changes, rotate credentials
## Security Review Cadence
| Review | Frequency |
|--------|-----------|
| Secret rotation | Monthly |
| Access review | Quarterly |
| Pipeline audit | Quarterly |
| Security scan rules | Monthly |
| Incident response drill | Annually |
