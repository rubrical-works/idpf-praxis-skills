---
name: ci-cd-pipeline-design
description: Guide developers through CI/CD pipeline design including architecture patterns, stage design, and security considerations
type: reference
disable-model-invocation: true
version: "1.0.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-03-17"
license: Complete terms in LICENSE.txt
category: devops
relevantTechStack: [github-actions, ci, cd, docker, kubernetes]
copyright: "Rubrical Works (c) 2026"
---
# CI/CD Pipeline Design
## When to Use This Skill
- Setting up CI/CD for a new project
- Optimizing existing pipeline performance
- Adding security scanning to pipelines
- Designing multi-environment deployment
- Choosing between CI/CD platforms
## CI/CD Fundamentals
### Continuous Integration (CI)
Automatically build and test code on every change.
**Goals:** Detect integration issues early, maintain code quality, provide fast feedback
**Key practices:** Frequent commits (at least daily), automated builds, automated tests, fast feedback (under 10 minutes ideal)
### Continuous Delivery (CD)
Automatically prepare releases for deployment.
**Goals:** Always deployable main branch, consistent release process, reduced deployment risk
**Key practices:** Automated deployment to staging, manual approval for production, rollback capability, environment parity
### Continuous Deployment
Automatically deploy every change to production.
**Goals:** Fastest time to market, small incremental changes, immediate user feedback
**Requirements:** High test coverage, feature flags, monitoring and alerting, fast rollback
## Pipeline Architecture
### Linear Pipeline
```
┌───────┐    ┌──────┐    ┌──────────┐    ┌────────┐
│ Build │ →  │ Test │ →  │ Security │ →  │ Deploy │
└───────┘    └──────┘    └──────────┘    └────────┘
```
**Best for:** Simple projects, single deployment target
### Parallel Pipeline
```
              ┌─────────────┐
          ┌───│ Unit Tests  │───┐
          │   └─────────────┘   │
┌───────┐ │   ┌─────────────┐   │   ┌────────┐
│ Build │─┼───│ Lint/Format │───┼───│ Deploy │
└───────┘ │   └─────────────┘   │   └────────┘
          │   ┌─────────────┐   │
          └───│ SAST Scan   │───┘
              └─────────────┘
```
**Best for:** Faster feedback, independent quality gates
### Fan-out/Fan-in
```
              ┌──────────┐
          ┌───│ Test DB1 │───┐
          │   └──────────┘   │
┌───────┐ │   ┌──────────┐   │   ┌─────────────┐
│ Build │─┼───│ Test DB2 │───┼───│ Integration │
└───────┘ │   └──────────┘   │   └─────────────┘
          │   ┌──────────┐   │
          └───│ Test DB3 │───┘
              └──────────┘
```
**Best for:** Matrix testing, multi-platform builds
### Multi-Environment Pipeline
```
┌───────┐    ┌──────┐    ┌─────────┐    ┌─────────┐    ┌────────────┐
│ Build │ →  │ Test │ →  │ Staging │ →  │ Approval│ →  │ Production │
└───────┘    └──────┘    └─────────┘    └─────────┘    └────────────┘
```
**Best for:** Production deployments, compliance requirements
## Stage Design
### Build Stage
**Purpose:** Create deployable artifacts
```yaml
build:
  steps:
    - checkout code
    - install dependencies
    - compile/transpile
    - create artifacts
  outputs:
    - application binary/bundle
    - docker image
    - deployment manifests
```
**Best practices:** Cache dependencies, use multi-stage builds, version artifacts, store build metadata
### Test Stage
**Purpose:** Verify code quality and functionality
```yaml
test:
  parallel:
    unit_tests:
      - run unit tests
      - collect coverage
    integration_tests:
      - start dependencies
      - run integration tests
    e2e_tests:
      - deploy to test environment
      - run end-to-end tests
```
**Test pyramid:**
```
        /\
       /E2E\      Few, slow, expensive
      /─────\
     / Int   \    Some, medium speed
    /─────────\
   /   Unit    \  Many, fast, cheap
  /─────────────\
```
### Security Stage
**Purpose:** Identify security vulnerabilities
```yaml
security:
  parallel:
    sast:
      - static code analysis
    dependency_scan:
      - check for vulnerable dependencies
    secrets_scan:
      - detect hardcoded secrets
    container_scan:
      - scan container images
```
**Tools by category:**
- SAST: SonarQube, Semgrep, CodeQL
- Dependencies: Dependabot, Snyk, OWASP Dependency-Check
- Secrets: GitLeaks, TruffleHog
- Containers: Trivy, Clair, Anchore
### Deploy Stage
**Purpose:** Release to target environment
```yaml
deploy:
  environments:
    staging:
      trigger: automatic
      steps:
        - deploy application
        - run smoke tests
        - notify team
    production:
      trigger: manual_approval
      steps:
        - deploy canary (10%)
        - monitor metrics
        - gradual rollout
        - full deployment
```
## Environment Promotion
### Sequential Promotion
```
Dev → QA → Staging → Production
```
1. Deploy to Dev on every commit
2. Promote to QA after Dev tests pass
3. Promote to Staging after QA approval
4. Promote to Production after final approval
### Blue-Green Deployment
```
┌─────────────────────────┐
│    Load Balancer        │
└───────────┬─────────────┘
            │
     ┌──────┴──────┐
     │             │
┌────▼────┐  ┌─────▼───┐
│  Blue   │  │  Green  │
│(current)│  │  (new)  │
└─────────┘  └─────────┘
```
1. Deploy new version to Green
2. Run tests on Green
3. Switch traffic to Green
4. Keep Blue for rollback
### Canary Deployment
```
Traffic: 100% ──────────────▶
              │ 90%
              └───▶ Stable (v1)
              │ 10%
              └───▶ Canary (v2)
```
1. Deploy new version to subset
2. Monitor errors and performance
3. Gradually increase traffic
4. Full rollout or rollback
### Rolling Deployment
```
Instance 1: v1 → v2
Instance 2: v1 → v1 → v2
Instance 3: v1 → v1 → v1 → v2
```
1. Update instances one at a time
2. Wait for health checks
3. Continue until all updated
4. Rollback by reversing
## Platform-Specific Examples
### GitHub Actions
```yaml
name: CI/CD Pipeline
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build
        run: npm ci && npm run build
      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: build
          path: dist/
  test:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run tests
        run: npm ci && npm test
  security:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run security scan
        uses: github/codeql-action/analyze@v2
  deploy-staging:
    needs: [test, security]
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - name: Deploy to staging
        run: ./deploy.sh staging
  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Deploy to production
        run: ./deploy.sh production
```
## Security Considerations
### Secrets Management
**Never:** Hardcode secrets in code, commit secrets to repository, log secrets
**Do:** Use environment variables, use secret management services, rotate secrets regularly, audit secret access
```yaml
# GitHub Actions secrets
steps:
  - name: Deploy
    env:
      API_KEY: ${{ secrets.API_KEY }}
    run: ./deploy.sh
```
### SAST Integration
```yaml
security_scan:
  steps:
    - name: Run SAST
      run: |
        semgrep --config=auto src/
    - name: Check results
      run: |
        if grep -q "CRITICAL\|HIGH" results.txt; then
          exit 1
        fi
```
### Supply Chain Security
```yaml
dependencies:
  steps:
    - name: Check dependencies
      run: |
        npm audit --audit-level=high
    - name: SBOM generation
      run: |
        syft packages . -o spdx-json > sbom.json
```
### Container Security
```yaml
container:
  steps:
    - name: Build image
      run: docker build -t myapp .
    - name: Scan image
      run: trivy image myapp
    - name: Sign image
      run: cosign sign myapp
```
## Pipeline Best Practices
1. **Fast Feedback** - Keep CI under 10 minutes, run fast tests first, parallelize, cache dependencies
2. **Reliable Pipelines** - Reproducible builds, pin dependency versions, consistent environments, retry logic
3. **Clear Visibility** - Good pipeline naming, clear stage purposes, meaningful error messages, failure notifications
4. **Security First** - Scan early and often, block on security failures, minimal permissions, audit pipeline changes
5. **Environment Parity** - Same configuration patterns, infrastructure as code, consistent deployment process
## GitHub API Best Practices
### Authentication Strategy
- Use fine-scoped PATs or GitHub Apps for automation
- Reuse tokens across test runs -- do not re-authenticate per step
- Store tokens securely in CI/CD secrets
### Rate Limiting
```yaml
retry:
  max_attempts: 3
  initial_interval: 1s
  multiplier: 2
  randomization_factor: 0.5
```
- Add exponential backoff with jitter to API retries
- Stagger concurrent API/workflow calls
- Monitor rate limit headers (`X-RateLimit-Remaining`)
- Cache API responses where appropriate
### Workflow Triggers
- Review workflow triggers to avoid recursive runs
- Use `workflow_dispatch` for manual control
- Limit concurrent workflow runs with `concurrency`
```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```
### Abuse Detection Patterns
**Patterns that trigger temporary lockouts:**
- High volume authentication attempts
- Rapid workflow creation/deletion
- Excessive API calls in short windows
- Concurrent operations without throttling
**Prevention:** Use fine-scoped PATs, implement request throttling, add delays between bulk operations, use GitHub Apps with proper rate limit handling
### Testing Considerations
- Use a dedicated test account/organization
- Mock GitHub API calls in unit tests
- Use recorded responses for integration tests
- Limit live API calls to end-to-end tests only
## Resources
See `resources/` directory for:
- `architecture-patterns.md` - Pipeline architecture patterns
- `stage-design.md` - Detailed stage design guidance
- `platform-examples.md` - Platform-specific configurations
- `security-checklist.md` - Security considerations checklist
## Relationship to Other Skills
**Complements:** `api-versioning` (API deployment strategies), `migration-patterns` (database deployment considerations)
**Independent from:** TDD skills (this skill focuses on deployment, not testing methodology)
## Expected Outcome
- Pipeline architecture designed
- Stages configured appropriately
- Security scanning integrated
- Environment promotion strategy defined
- Platform-specific implementation ready
