# CI/CD Security Checklist
**Version:** v0.5.0

Comprehensive security considerations for CI/CD pipelines.

## Pipeline Security

### Authentication & Authorization

- [ ] **Pipeline triggers secured**
  - Branch protection rules enabled
  - Required reviewers configured
  - Status checks required before merge

- [ ] **Access control configured**
  - Least privilege principle
  - Role-based access control
  - Audit logging enabled

- [ ] **Token security**
  - Short-lived tokens preferred
  - Token rotation configured
  - No long-lived personal tokens

### Secrets Management

- [ ] **Secrets stored securely**
  - Native secret management (GitHub Secrets, GitLab CI Variables)
  - External vault (HashiCorp Vault, AWS Secrets Manager)
  - Never in repository

- [ ] **Secret access restricted**
  - Environment-scoped secrets
  - Branch-restricted secrets
  - Minimal secret exposure

- [ ] **Secret usage audited**
  - Access logs enabled
  - Alert on unusual access
  - Regular secret rotation

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

- [ ] **SAST tool configured**
  - CodeQL, Semgrep, or SonarQube
  - Custom rules for your stack
  - Regular rule updates

- [ ] **Findings triaged**
  - Critical/High block pipeline
  - Medium tracked in issues
  - False positives documented

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

- [ ] **Pre-commit hooks**
  - GitLeaks or TruffleHog
  - Block commits with secrets
  - Developer education

- [ ] **Pipeline scanning**
  - Scan on every push
  - Historical commit scanning
  - Alert security team

### Example Configuration

```yaml
secret-scan:
  steps:
    - uses: gitleaks/gitleaks-action@v2
      with:
        fail: true

    # Custom patterns
    - name: Custom secret scan
      run: |
        grep -r "AKIA[A-Z0-9]{16}" . && exit 1 || true  # AWS keys
        grep -r "sk-[a-zA-Z0-9]{48}" . && exit 1 || true  # OpenAI keys
```

## Dependency Security

### Vulnerability Scanning

- [ ] **Automated scanning**
  - npm audit / pip-audit / cargo audit
  - Snyk or Dependabot
  - Scheduled scans (not just on commit)

- [ ] **Policy enforcement**
  - Block critical vulnerabilities
  - Track medium/low in issues
  - Waiver process documented

### Example Configuration

```yaml
dependency-scan:
  steps:
    - name: Check dependencies
      run: |
        # Fail on high or critical
        npm audit --audit-level=high

        # Alternative: Snyk
        snyk test --severity-threshold=high

    - name: Generate SBOM
      run: |
        syft packages . -o spdx-json > sbom.json
```

### Update Strategy

- [ ] **Automated updates**
  - Dependabot or Renovate configured
  - Auto-merge for patches
  - Required review for major updates

- [ ] **Update verification**
  - Full test suite on dependency updates
  - Canary deployment for updates
  - Rollback plan

## Container Security

### Image Building

- [ ] **Base image security**
  - Official images only
  - Pinned image tags (not :latest)
  - Minimal base images

- [ ] **Build security**
  - Multi-stage builds
  - No secrets in images
  - Non-root user

### Example Dockerfile

```dockerfile
# Use specific version
FROM node:20.10.0-alpine AS build

# Build as non-root
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Production stage
FROM node:20.10.0-alpine
RUN adduser -D appuser
USER appuser
WORKDIR /app
COPY --from=build --chown=appuser /app/node_modules ./node_modules
COPY --chown=appuser . .
CMD ["node", "index.js"]
```

### Image Scanning

- [ ] **Container scanning enabled**
  - Trivy, Clair, or Anchore
  - Scan before push
  - Block on critical vulnerabilities

- [ ] **Runtime security**
  - Read-only filesystem
  - Dropped capabilities
  - Security contexts

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

- [ ] **Self-hosted runner hardening**
  - Ephemeral runners preferred
  - Isolated networks
  - Regular patching

- [ ] **Runner permissions**
  - Minimal IAM permissions
  - No long-lived credentials
  - Network segmentation

### Environment Isolation

- [ ] **Environment separation**
  - Separate credentials per environment
  - Network isolation
  - Access controls

- [ ] **Production protection**
  - Required approvals
  - Deployment windows
  - Change tracking

## Audit & Compliance

### Logging

- [ ] **Pipeline audit logs**
  - All executions logged
  - Secret access logged
  - Retention policy defined

- [ ] **Deployment tracking**
  - What was deployed
  - Who approved
  - When deployed

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

- [ ] **Change management**
  - All changes through pipeline
  - No manual deployments
  - Documentation complete

- [ ] **Separation of duties**
  - Developers can't deploy to production alone
  - Security team can audit
  - Operations can rollback

## Incident Response

### Rollback Capability

- [ ] **Automated rollback**
  - Health check failures trigger rollback
  - Previous version preserved
  - Rollback tested regularly

- [ ] **Manual rollback**
  - Clear procedure documented
  - Accessible to on-call
  - Tested regularly

### Security Incident

- [ ] **Compromise response**
  - Rotate all secrets immediately
  - Audit recent deployments
  - Review access logs

- [ ] **Pipeline breach**
  - Disable affected pipelines
  - Review recent changes
  - Rotate credentials

## Security Review Cadence

| Review | Frequency |
|--------|-----------|
| Secret rotation | Monthly |
| Access review | Quarterly |
| Pipeline audit | Quarterly |
| Security scan rules | Monthly |
| Incident response drill | Annually |

---

**See SKILL.md for complete CI/CD pipeline guidance**
