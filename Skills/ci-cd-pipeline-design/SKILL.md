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
- Detect integration issues early, maintain code quality, fast feedback (<10 min ideal)
- Frequent commits, automated builds, automated tests
### Continuous Delivery (CD)
Automatically prepare releases for deployment.
- Always deployable main branch, consistent release process, reduced deployment risk
- Automated deployment to staging, manual approval for production, rollback capability
### Continuous Deployment
Automatically deploy every change to production.
- Requires high test coverage, feature flags, monitoring/alerting, fast rollback
## Pipeline Architecture
### Linear Pipeline
```
Build -> Test -> Security -> Deploy
```
Best for simple projects, single deployment target.
### Parallel Pipeline
```
              ┌─ Unit Tests  ─┐
Build ────────┼─ Lint/Format  ─┼──── Deploy
              └─ SAST Scan   ─┘
```
Best for faster feedback, independent quality gates.
### Fan-out/Fan-in
```
              ┌─ Test DB1 ─┐
Build ────────┼─ Test DB2 ─┼──── Integration
              └─ Test DB3 ─┘
```
Best for matrix testing, multi-platform builds.
### Multi-Environment Pipeline
```
Build -> Test -> Staging -> Approval -> Production
```
Best for production deployments, compliance requirements.
## Stage Design
### Build Stage
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
Best practices: Cache dependencies, multi-stage builds, version artifacts, store build metadata.
### Test Stage
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
**Test pyramid:** Many fast unit tests, some integration tests, few slow E2E tests.
### Security Stage
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
Dev -> QA -> Staging -> Production
```
1. Deploy to Dev on every commit
2. Promote to QA after Dev tests pass
3. Promote to Staging after QA approval
4. Promote to Production after final approval
### Blue-Green Deployment
1. Deploy new version to Green
2. Run tests on Green
3. Switch traffic to Green
4. Keep Blue for rollback
### Canary Deployment
1. Deploy new version to subset (e.g., 10%)
2. Monitor errors and performance
3. Gradually increase traffic
4. Full rollout or rollback
### Rolling Deployment
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
### GitLab CI
```yaml
stages:
  - build
  - test
  - security
  - deploy
build:
  stage: build
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/
test:
  stage: test
  script:
    - npm ci
    - npm test
  coverage: '/Coverage: \d+\.\d+%/'
sast:
  stage: security
  template: Security/SAST.gitlab-ci.yml
deploy_staging:
  stage: deploy
  script:
    - ./deploy.sh staging
  environment:
    name: staging
  only:
    - main
deploy_production:
  stage: deploy
  script:
    - ./deploy.sh production
  environment:
    name: production
  when: manual
  only:
    - main
```
## Security Considerations
### Secrets Management
**Never:** Hardcode secrets in code, commit to repo, log secrets.
**Do:** Use environment variables, secret management services, rotate regularly, audit access.
```yaml
steps:
  - name: Deploy
    env:
      API_KEY: ${{ secrets.API_KEY }}
    run: ./deploy.sh
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
1. **Fast Feedback:** Keep CI under 10 minutes, run fast tests first, parallelize, cache dependencies
2. **Reliable Pipelines:** Reproducible builds, pin dependency versions, consistent environments, retry logic
3. **Clear Visibility:** Good naming, clear stage purposes, meaningful error messages, failure notifications
4. **Security First:** Scan early and often, block on security failures, minimal permissions, audit changes
5. **Environment Parity:** Same configuration patterns, infrastructure as code, consistent deployment process
## GitHub API Best Practices
### Authentication Strategy
- Fine-scoped PATs for specific permissions
- GitHub Apps for organization-level automation
- Reuse tokens across test runs; avoid rapidly creating/deleting tokens
### Rate Limiting
```yaml
retry:
  max_attempts: 3
  initial_interval: 1s
  multiplier: 2
  randomization_factor: 0.5
```
- Add exponential backoff with jitter, stagger concurrent calls, monitor `X-RateLimit-Remaining`, cache API responses
### Workflow Triggers
```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```
- Review triggers to avoid recursive runs, use `workflow_dispatch` for manual control
### Abuse Detection Prevention
- Use fine-scoped PATs instead of interactive auth
- Implement request throttling in automation scripts
- Add delays between bulk operations
- Use GitHub Apps with proper rate limit handling
## Resources
See `resources/` directory for:
- `architecture-patterns.md` - Pipeline architecture patterns
- `stage-design.md` - Detailed stage design guidance
- `platform-examples.md` - Platform-specific configurations
- `security-checklist.md` - Security considerations checklist
## Relationship to Other Skills
**Complements:** `api-versioning`, `migration-patterns`
