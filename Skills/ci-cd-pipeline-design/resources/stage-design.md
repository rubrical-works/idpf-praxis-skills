# Stage Design Guide
**Version:** v0.5.0

Detailed guidance for designing effective CI/CD pipeline stages.

## Build Stage

### Purpose
Transform source code into deployable artifacts.

### Key Steps

```yaml
build:
  steps:
    # 1. Setup environment
    - setup_runtime:
        version: pinned

    # 2. Install dependencies
    - install_dependencies:
        cache: true
        lock_file: true

    # 3. Compile/Transpile
    - compile:
        production: true
        source_maps: conditional

    # 4. Create artifacts
    - package:
        format: determined_by_target
        versioned: true

    # 5. Store artifacts
    - upload:
        retention: appropriate
```

### Best Practices

**Reproducibility:**
```yaml
# Pin versions
node-version: '20.10.0'  # Not 'latest' or '20.x'

# Use lock files
npm ci  # Not 'npm install'

# Pin action versions
uses: actions/checkout@v4.1.0  # Not @v4 or @main
```

**Caching:**
```yaml
# Cache dependencies
- uses: actions/cache@v3
  with:
    path: |
      ~/.npm
      node_modules
    key: deps-${{ hashFiles('package-lock.json') }}
```

**Multi-stage Docker:**
```dockerfile
# Build stage
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-slim
COPY --from=build /app/dist ./dist
CMD ["node", "dist/index.js"]
```

### Artifacts

**What to store:**
- Compiled application
- Docker images (push to registry)
- Build metadata (git SHA, timestamp)
- Test reports (for later stages)

**Artifact naming:**
```
myapp-{version}-{git-sha-short}.{format}
myapp-1.2.3-abc1234.tar.gz
myapp-1.2.3-abc1234.docker
```

## Test Stage

### Test Types and Order

```
Speed: Fast ──────────────────────────────────▶ Slow
Scope: Unit ──────────────────────────────────▶ E2E

┌──────────┐   ┌─────────────┐   ┌───────────┐   ┌─────┐
│   Unit   │ → │ Integration │ → │ Component │ → │ E2E │
└──────────┘   └─────────────┘   └───────────┘   └─────┘
     │               │                 │            │
 Thousands       Hundreds            Tens         Few
```

### Unit Tests

```yaml
unit_tests:
  parallel: true
  coverage:
    minimum: 80%
    fail_below: true
  steps:
    - run: npm test -- --coverage
    - upload: coverage-report
```

### Integration Tests

```yaml
integration_tests:
  services:
    - postgres:14
    - redis:7
  steps:
    - run: npm run test:integration
  timeout: 10m
```

### E2E Tests

```yaml
e2e_tests:
  environment: test
  browser_matrix:
    - chrome
    - firefox
  steps:
    - deploy: test_environment
    - run: npm run test:e2e
    - upload: screenshots_on_failure
```

### Test Parallelization

```yaml
# Split tests across runners
test:
  strategy:
    matrix:
      shard: [1, 2, 3, 4]
  steps:
    - run: npm test -- --shard=${{ matrix.shard }}/4
```

### Coverage Gates

```yaml
- name: Check coverage
  run: |
    COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
    if (( $(echo "$COVERAGE < 80" | bc -l) )); then
      echo "Coverage $COVERAGE% below 80% threshold"
      exit 1
    fi
```

## Security Stage

### SAST (Static Analysis)

```yaml
sast:
  tools:
    - semgrep
    - sonarqube
    - codeql
  rules:
    - security
    - quality
  fail_on:
    - critical
    - high
```

### Dependency Scanning

```yaml
dependency_scan:
  tools:
    - npm audit
    - snyk
    - dependabot
  steps:
    - run: npm audit --audit-level=high
    - run: snyk test --severity-threshold=high
```

### Secret Detection

```yaml
secret_scan:
  tools:
    - gitleaks
    - trufflehog
  scope:
    - commits
    - files
  block_on_detection: true
```

### Container Scanning

```yaml
container_scan:
  steps:
    - name: Scan image
      run: trivy image myapp:${{ github.sha }}

    - name: Check results
      run: |
        if grep -q "CRITICAL\|HIGH" trivy-results.txt; then
          exit 1
        fi
```

### Security Stage Order

```
┌────────────┐   ┌────────────┐   ┌───────────────┐   ┌────────────┐
│   SAST     │   │  Secrets   │   │ Dependencies  │   │ Container  │
│            │ → │ Detection  │ → │    Scan       │ → │   Scan     │
└────────────┘   └────────────┘   └───────────────┘   └────────────┘
```

## Deploy Stage

### Pre-deployment Checks

```yaml
pre_deploy:
  steps:
    - verify_artifacts_exist
    - check_environment_health
    - validate_configuration
    - confirm_approvals
```

### Deployment Strategies

**Direct deployment:**
```yaml
deploy:
  steps:
    - stop_old_version
    - deploy_new_version
    - start_new_version
    - health_check
```

**Blue-Green:**
```yaml
deploy:
  steps:
    - deploy_to_green
    - health_check_green
    - switch_traffic_to_green
    - monitor
    - cleanup_blue  # or keep for rollback
```

**Canary:**
```yaml
deploy:
  steps:
    - deploy_canary
    - route_10_percent
    - monitor_15_minutes
    - route_50_percent
    - monitor_15_minutes
    - route_100_percent
```

**Rolling:**
```yaml
deploy:
  steps:
    - for_each_instance:
        - drain_traffic
        - deploy
        - health_check
        - restore_traffic
```

### Post-deployment Verification

```yaml
post_deploy:
  steps:
    - smoke_tests:
        endpoints:
          - GET /health
          - GET /api/status
        expected: 200

    - synthetic_monitoring:
        duration: 15m
        alert_threshold: error_rate > 1%

    - notify:
        channel: deployments
        include: version, environment, status
```

### Rollback Procedure

```yaml
rollback:
  trigger:
    - manual
    - auto_on_failure
  steps:
    - identify_previous_version
    - deploy_previous_version
    - verify_rollback
    - notify_team
    - create_incident
```

## Quality Gates

### Gate Configuration

```yaml
quality_gates:
  unit_tests:
    required: true
    coverage_minimum: 80%

  integration_tests:
    required: true
    pass_rate: 100%

  security_scan:
    required: true
    allowed_vulnerabilities:
      critical: 0
      high: 0
      medium: 10

  performance:
    required: false  # warning only
    response_time_p99: 500ms
```

### Gate Enforcement

```yaml
# Block deployment if gates fail
deploy:
  needs: [tests, security]
  if: |
    needs.tests.result == 'success' &&
    needs.security.result == 'success'
```

## Stage Timeouts

| Stage | Typical Timeout | Maximum |
|-------|-----------------|---------|
| Build | 5-10 min | 30 min |
| Unit Tests | 5-10 min | 30 min |
| Integration | 10-20 min | 60 min |
| E2E Tests | 15-30 min | 60 min |
| Security | 10-20 min | 60 min |
| Deploy | 5-15 min | 30 min |

```yaml
# Set timeouts
jobs:
  build:
    timeout-minutes: 15

  test:
    timeout-minutes: 30
```

---

**See SKILL.md for complete CI/CD pipeline guidance**
