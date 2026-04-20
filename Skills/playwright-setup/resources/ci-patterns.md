# CI/CD Patterns for Playwright
**Version:** v0.12.1
## GitHub Actions
### Basic Configuration
```yaml
name: Playwright Tests
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      - name: Run Playwright tests
        run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```
### With Browser Caching
```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - name: Get Playwright version
        id: playwright-version
        run: echo "version=$(npm ls @playwright/test --json | jq -r '.dependencies["@playwright/test"].version')" >> $GITHUB_OUTPUT
      - name: Cache Playwright browsers
        uses: actions/cache@v4
        id: playwright-cache
        with:
          path: ~/.cache/ms-playwright
          key: playwright-${{ runner.os }}-${{ steps.playwright-version.outputs.version }}
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright browsers
        if: steps.playwright-cache.outputs.cache-hit != 'true'
        run: npx playwright install --with-deps
      - name: Install system dependencies only
        if: steps.playwright-cache.outputs.cache-hit == 'true'
        run: npx playwright install-deps
      - name: Run tests
        run: npx playwright test
```
### Sharded Tests (Parallel)
```yaml
jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        shard: [1/4, 2/4, 3/4, 4/4]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - name: Run Playwright tests
        run: npx playwright test --shard=${{ matrix.shard }}
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report-${{ strategy.job-index }}
          path: playwright-report/
```
## GitLab CI
### Basic Configuration
```yaml
stages:
  - test
playwright:
  stage: test
  image: mcr.microsoft.com/playwright:v1.40.0-jammy
  script:
    - npm ci
    - npx playwright test
  artifacts:
    when: always
    paths:
      - playwright-report/
    expire_in: 1 week
```
### With Caching
```yaml
playwright:
  stage: test
  image: mcr.microsoft.com/playwright:v1.40.0-jammy
  cache:
    key: ${CI_COMMIT_REF_SLUG}
    paths:
      - node_modules/
  script:
    - npm ci --cache .npm --prefer-offline
    - npx playwright test
  artifacts:
    when: always
    paths:
      - playwright-report/
    expire_in: 1 week
```
### Parallel Shards
```yaml
playwright:
  stage: test
  image: mcr.microsoft.com/playwright:v1.40.0-jammy
  parallel: 4
  script:
    - npm ci
    - npx playwright test --shard=$CI_NODE_INDEX/$CI_NODE_TOTAL
  artifacts:
    when: always
    paths:
      - playwright-report/
```
## Jenkins
### Declarative Pipeline
```groovy
pipeline {
    agent {
        docker {
            image 'mcr.microsoft.com/playwright:v1.40.0-jammy'
        }
    }
    stages {
        stage('Install') {
            steps {
                sh 'npm ci'
            }
        }
        stage('Test') {
            steps {
                sh 'npx playwright test'
            }
        }
    }
    post {
        always {
            publishHTML(target: [
                allowMissing: false,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                reportName: 'Playwright Report'
            ])
        }
    }
}
```
### Without Docker
```groovy
pipeline {
    agent { label 'playwright' }
    stages {
        stage('Install') {
            steps {
                sh 'npm ci'
                sh 'npx playwright install --with-deps'
            }
        }
        stage('Test') {
            steps {
                sh 'npx playwright test'
            }
        }
    }
}
```
## CircleCI
```yaml
version: 2.1
orbs:
  playwright: playwright/playwright@1.0.0
jobs:
  test:
    docker:
      - image: mcr.microsoft.com/playwright:v1.40.0-jammy
    steps:
      - checkout
      - run: npm ci
      - run: npx playwright test
      - store_artifacts:
          path: playwright-report
workflows:
  test:
    jobs:
      - test
```
## Azure DevOps
```yaml
trigger:
  - main
pool:
  vmImage: 'ubuntu-latest'
steps:
  - task: NodeTool@0
    inputs:
      versionSpec: '20.x'
  - script: npm ci
    displayName: 'Install dependencies'
  - script: npx playwright install --with-deps
    displayName: 'Install Playwright browsers'
  - script: npx playwright test
    displayName: 'Run Playwright tests'
  - task: PublishTestResults@2
    condition: always()
    inputs:
      testResultsFormat: 'JUnit'
      testResultsFiles: 'test-results/junit.xml'
  - task: PublishPipelineArtifact@1
    condition: always()
    inputs:
      targetPath: 'playwright-report'
      artifact: 'playwright-report'
```
## Docker Compose (Local CI Simulation)
```yaml
version: '3.8'
services:
  playwright:
    image: mcr.microsoft.com/playwright:v1.40.0-jammy
    working_dir: /app
    volumes:
      - .:/app
      - node_modules:/app/node_modules
    command: sh -c "npm ci && npx playwright test"
volumes:
  node_modules:
```
```bash
docker-compose -f docker-compose.test.yml up --abort-on-container-exit
```
## Environment Variables
| Variable | Purpose | Example |
|----------|---------|---------|
| `CI` | Detect CI environment | `true` (auto-set by most CI) |
| `PLAYWRIGHT_BROWSERS_PATH` | Custom browser location | `/opt/pw-browsers` |
| `DEBUG` | Enable debug logging | `pw:api` |
| `PWDEBUG` | Enable Playwright Inspector | `1` |
```yaml
# GitHub Actions
env:
  PLAYWRIGHT_BROWSERS_PATH: ${{ github.workspace }}/pw-browsers
# GitLab CI
variables:
  PLAYWRIGHT_BROWSERS_PATH: ${CI_PROJECT_DIR}/pw-browsers
```
## Troubleshooting CI Failures
| Issue | Cause | Solution |
|-------|-------|----------|
| "Executable doesn't exist" | Browsers not in CI | Add `npx playwright install` step |
| Tests timeout | Slow CI runners | Increase timeout in config |
| Random failures | Flaky tests | Add retries: `retries: 2` in config |
| Screenshots blank | Page not loaded | Wait for `networkidle` |
| OOM errors | Memory limits | Run fewer parallel workers |
### Debug Mode in CI
```yaml
- name: Run Playwright tests
  run: npx playwright test
  env:
    DEBUG: pw:api
```
