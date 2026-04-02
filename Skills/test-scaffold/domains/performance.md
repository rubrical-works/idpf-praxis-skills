# Performance Domain Module
**Source:** `Domains/Performance/`
**Tools:** k6
**Test Types:** Load, Stress, Spike, Soak/Endurance
## Required Packages
```
k6
wait-on
```
k6 is a standalone binary, not an npm package. Install via `brew install k6`, `choco install k6`, or download from [k6.io](https://k6.io/docs/get-started/installation/). `wait-on` is used for CI server readiness checks.
## Generated Artifacts
### Artifact 1: `tests/perf/load-test.js`
```javascript
// tests/perf/load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');

export const options = {
  stages: [
    { duration: '2m', target: 50 },
    { duration: '5m', target: 50 },
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500', 'p(99)<1000'],
    'http_req_failed': ['rate<0.01'],
    'http_reqs': ['rate>100'],
    'errors': ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

const routes = [
  { path: '/', name: 'homepage' },
  { path: '/api/health', name: 'health' },
  // {{DISCOVERED_ROUTES}}
];

export default function () {
  for (const route of routes) {
    const res = http.get(`${BASE_URL}${route.path}`, {
      tags: { name: route.name },
    });

    check(res, {
      [`${route.name} status 200`]: (r) => r.status === 200,
      [`${route.name} duration < 500ms`]: (r) => r.timings.duration < 500,
    });

    errorRate.add(res.status !== 200);
    responseTime.add(res.timings.duration);
  }

  sleep(1);
}

export function handleSummary(data) {
  return {
    'results/load-test-summary.json': JSON.stringify(data, null, 2),
  };
}
```
### Artifact 2: `tests/perf/soak-test.js`
```javascript
// tests/perf/soak-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '5m', target: 100 },
    { duration: '4h', target: 100 },
    { duration: '5m', target: 0 },
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500', 'p(99)<1500'],
    'http_req_failed': ['rate<0.01'],
    'errors': ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  const res = http.get(`${BASE_URL}/api/health`);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  errorRate.add(res.status !== 200);
  sleep(1);
}

export function handleSummary(data) {
  return {
    'results/soak-test-summary.json': JSON.stringify(data, null, 2),
  };
}
```
### Artifact 3: `tests/perf/thresholds.json`
```json
{
  "load": {
    "http_req_duration_p95": 500,
    "http_req_duration_p99": 1000,
    "http_req_failed_rate": 0.01,
    "http_reqs_rate": 100,
    "description": "Standard load test thresholds for expected traffic"
  },
  "stress": {
    "http_req_duration_p95": 1000,
    "http_req_duration_p99": 2000,
    "http_req_failed_rate": 0.05,
    "http_reqs_rate": 50,
    "description": "Relaxed thresholds for stress testing beyond capacity"
  },
  "soak": {
    "http_req_duration_p95": 500,
    "http_req_duration_p99": 1500,
    "http_req_failed_rate": 0.01,
    "http_reqs_rate": 100,
    "description": "Endurance thresholds — same as load but over 4+ hours"
  },
  "spike": {
    "http_req_duration_p95": 2000,
    "http_req_duration_p99": 5000,
    "http_req_failed_rate": 0.05,
    "http_reqs_rate": 50,
    "description": "Spike thresholds — tolerant of brief latency spikes"
  }
}
```
### CI Job: `load-test`
```yaml
load-test:
  runs-on: ubuntu-latest
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
    - name: Start server
      run: npm run start &
    - name: Wait for server
      run: npx wait-on http://localhost:3000 --timeout 30000
    - name: Run k6 load test
      uses: grafana/k6-action@v0.3.1
      with:
        filename: tests/perf/load-test.js
        flags: --env BASE_URL=http://localhost:3000
    - name: Upload results
      if: always()
      uses: actions/upload-artifact@v4
      with:
        name: load-test-results
        path: results/
```
### CI Job: `soak-test`
```yaml
soak-test:
  runs-on: ubuntu-latest
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
    - name: Start server
      run: npm run start &
    - name: Wait for server
      run: npx wait-on http://localhost:3000 --timeout 30000
    - name: Run k6 soak test
      uses: grafana/k6-action@v0.3.1
      with:
        filename: tests/perf/soak-test.js
        flags: --env BASE_URL=http://localhost:3000
      env:
        K6_DURATION: '4h'
        K6_VUS: '100'
    - name: Upload results
      if: always()
      uses: actions/upload-artifact@v4
      with:
        name: soak-test-results
        path: results/
```
## Manual Testing Areas
- **Workload modeling** -- Defining realistic load profiles based on production traffic patterns and growth projections
- **Baseline establishment** -- Capturing and documenting initial performance baselines
- **SLA/SLO definition** -- Working with stakeholders to define acceptable response times, throughput, and error rates
- **Test data preparation** -- Creating realistic test datasets for parameterized tests
- **Results analysis** -- Interpreting percentile distributions, identifying bottlenecks, correlating with infrastructure metrics
- **Capacity planning** -- Extrapolating load test results to determine scaling requirements
- **Environment parity** -- Ensuring test environment sufficiently represents production
- **Regression comparison** -- Comparing results against historical baselines to detect degradation

| Metric | Description | Target |
|--------|-------------|--------|
| Response Time (p50) | Median response time | < 200ms |
| Response Time (p95) | 95th percentile | < 500ms |
| Response Time (p99) | 99th percentile | < 1000ms |
| Error Rate | Failed requests / total | < 0.1% |
| Apdex | Application Performance Index | > 0.9 |
