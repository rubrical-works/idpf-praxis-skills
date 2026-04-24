# Pipeline Architecture Patterns
**Version:** v0.14.0
## Pattern Selection Guide
| Project Type | Recommended Pattern |
|--------------|---------------------|
| Simple app | Linear |
| Microservices | Parallel + Matrix |
| Monorepo | Fan-out/Fan-in |
| Enterprise | Multi-environment |
| Mobile | Matrix (platform) |
## Linear Pipeline
```
┌──────────┐   ┌───────┐   ┌──────────┐   ┌────────┐   ┌────────┐
│ Checkout │ → │ Build │ → │   Test   │ → │ Deploy │ → │ Verify │
└──────────┘   └───────┘   └──────────┘   └────────┘   └────────┘
```
```yaml
# GitHub Actions
jobs:
  pipeline:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Build
        run: npm run build
      - name: Test
        run: npm test
      - name: Deploy
        run: ./deploy.sh
      - name: Verify
        run: ./smoke-test.sh
```
**Pros:** Simple to understand, easy to debug, clear flow
**Cons:** Sequential execution (slow), no parallelization, single failure point
## Parallel Pipeline
```
             ┌─────────────┐
         ┌───│ Unit Tests  │───┐
         │   └─────────────┘   │
         │   ┌─────────────┐   │
┌──────┐ ├───│ Lint        │───┤ ┌────────┐
│Build │─┼───│             │───┼─│ Deploy │
└──────┘ │   └─────────────┘   │ └────────┘
         │   ┌─────────────┐   │
         └───│ Security    │───┘
             └─────────────┘
```
```yaml
# GitHub Actions
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: build
          path: dist/
  unit-tests:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm test
  lint:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm run lint
  security:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm audit
  deploy:
    needs: [unit-tests, lint, security]
    runs-on: ubuntu-latest
    steps:
      - run: ./deploy.sh
```
**Pros:** Faster overall execution, independent failures, better resource use
**Cons:** More complex configuration, harder to debug, may increase costs
## Matrix Pipeline
```
             ┌────────────────────┐
         ┌───│ Node 16 / Ubuntu   │───┐
         │   └────────────────────┘   │
         │   ┌────────────────────┐   │
┌──────┐ ├───│ Node 18 / Ubuntu   │───┤ ┌─────────┐
│Build │─┼───│                    │───┼─│ Combine │
└──────┘ │   └────────────────────┘   │ └─────────┘
         │   ┌────────────────────┐   │
         └───│ Node 20 / Ubuntu   │───┘
             └────────────────────┘
```
```yaml
# GitHub Actions
jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
        node: [16, 18, 20]
      fail-fast: false
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
      - run: npm ci
      - run: npm test
```
**Pros:** Comprehensive coverage, cross-platform testing, identifies compatibility issues
**Cons:** Resource intensive, longer total time, more complex debugging
## Fan-out/Fan-in
```
              ┌──────────────┐
          ┌───│ Frontend     │───┐
          │   └──────────────┘   │
          │   ┌──────────────┐   │   ┌─────────────────┐
┌──────┐  ├───│ Backend      │───┼───│ Integration     │
│Parse │──┤   └──────────────┘   │   │ Tests           │
└──────┘  │   ┌──────────────┐   │   └─────────────────┘
          ├───│ Database     │───┤
          │   └──────────────┘   │
          │   ┌──────────────┐   │
          └───│ Infrastructure│──┘
              └──────────────┘
```
```yaml
# GitHub Actions (Monorepo)
jobs:
  changes:
    runs-on: ubuntu-latest
    outputs:
      frontend: ${{ steps.changes.outputs.frontend }}
      backend: ${{ steps.changes.outputs.backend }}
    steps:
      - uses: dorny/paths-filter@v2
        id: changes
        with:
          filters: |
            frontend:
              - 'frontend/**'
            backend:
              - 'backend/**'
  frontend:
    needs: changes
    if: needs.changes.outputs.frontend == 'true'
    runs-on: ubuntu-latest
    steps:
      - run: cd frontend && npm test
  backend:
    needs: changes
    if: needs.changes.outputs.backend == 'true'
    runs-on: ubuntu-latest
    steps:
      - run: cd backend && npm test
  integration:
    needs: [frontend, backend]
    if: always()
    runs-on: ubuntu-latest
    steps:
      - run: ./integration-tests.sh
```
**Pros:** Efficient for monorepos, selective execution, faster for targeted changes
**Cons:** Complex dependency management, change detection overhead, potential missed dependencies
## Trunk-Based Pipeline
```
Feature Branch:
  ┌──────┐   ┌──────┐
  │Build │ → │ Test │ → PR Review
  └──────┘   └──────┘
Main Branch:
  ┌──────┐   ┌──────┐   ┌─────────┐   ┌────────────┐
  │Build │ → │ Test │ → │ Staging │ → │ Production │
  └──────┘   └──────┘   └─────────┘   └────────────┘
```
```yaml
# GitHub Actions
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm test
  deploy-staging:
    needs: ci
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - run: ./deploy.sh staging
  deploy-production:
    needs: deploy-staging
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - run: ./deploy.sh production
```
## GitFlow Pipeline
```
Feature:     Build → Test
Develop:     Build → Test → Deploy Dev
Release:     Build → Test → Deploy Staging
Hotfix:      Build → Test → Deploy Staging → Prod
Main:        Build → Test → Deploy Production
```
```yaml
# GitHub Actions
on:
  push:
    branches:
      - main
      - develop
      - 'release/**'
      - 'feature/**'
      - 'hotfix/**'
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm test
  deploy-dev:
    needs: ci
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    environment: development
    steps:
      - run: ./deploy.sh dev
  deploy-staging:
    needs: ci
    if: startsWith(github.ref, 'refs/heads/release/') || startsWith(github.ref, 'refs/heads/hotfix/')
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - run: ./deploy.sh staging
  deploy-production:
    needs: ci
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - run: ./deploy.sh production
```
## Performance Optimization
### Caching
```yaml
- uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```
### Selective Execution
```yaml
paths:
  - 'src/**'
  - 'package.json'
paths-ignore:
  - '**.md'
  - 'docs/**'
```
### Concurrency Control
```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```
