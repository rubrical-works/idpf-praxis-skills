# Chaos Domain Module
**Source:** `Domains/Chaos/`
**Tools:** Toxiproxy, stress-ng
**Principle:** Proactively test system resilience by introducing controlled failures.
## Required Packages
```
toxiproxy-node-client
```
## Generated Artifacts
### Artifact 1: `chaos/experiments/latency-injection.json`
```json
{
  "name": "latency-injection-api",
  "hypothesis": {
    "given": "API responds with p99 < 500ms under normal load",
    "when": "500ms latency is injected on upstream dependency",
    "then": "Timeouts trigger graceful degradation; error rate stays below 1%; circuit breaker opens within 10s"
  },
  "steadyState": {
    "p99Latency": "<500ms",
    "errorRate": "<0.1%",
    "throughput": ">100rps"
  },
  "fault": {
    "type": "latency",
    "target": "upstream-service",
    "toxicConfig": {
      "type": "latency",
      "attributes": { "latency": 500, "jitter": 100 }
    },
    "duration": "5m",
    "scope": "single-upstream"
  },
  "blastRadius": {
    "targetScope": "Single upstream proxy",
    "userImpact": "Degraded response time, no data loss",
    "durationLimit": "5 minutes",
    "autoRollback": "Error rate > 5%"
  }
}
```
### Artifact 2: `chaos/experiments/service-unavailable.json`
```json
{
  "name": "service-unavailable-upstream",
  "hypothesis": {
    "given": "System operates normally with all dependencies healthy",
    "when": "Primary upstream dependency becomes completely unavailable",
    "then": "Circuit breaker activates within 10s; cached/fallback responses served; no cascading failure"
  },
  "steadyState": {
    "successRate": ">99.9%",
    "p99Latency": "<500ms",
    "errorRate": "<0.1%"
  },
  "fault": {
    "type": "service_unavailable",
    "target": "upstream-service",
    "toxicConfig": {
      "type": "timeout",
      "attributes": { "timeout": 0 }
    },
    "duration": "3m",
    "scope": "single-dependency"
  },
  "blastRadius": {
    "targetScope": "Single dependency proxy",
    "userImpact": "Fallback responses or degraded feature",
    "durationLimit": "3 minutes",
    "autoRollback": "Error rate > 5% OR data integrity concern"
  }
}
```
### Artifact 3: `chaos/toxiproxy.json`
```json
{
  "proxies": [
    {
      "name": "upstream-service",
      "listen": "127.0.0.1:18080",
      "upstream": "127.0.0.1:8080",
      "enabled": true
    },
    {
      "name": "database",
      "listen": "127.0.0.1:15432",
      "upstream": "127.0.0.1:5432",
      "enabled": true
    },
    {
      "name": "cache",
      "listen": "127.0.0.1:16379",
      "upstream": "127.0.0.1:6379",
      "enabled": true
    }
  ]
}
```
### Artifact 4: `chaos/abort-conditions.md`
```markdown
# Abort Conditions
**Immediately halt any chaos experiment if ANY of these conditions are met.**
## Automatic Abort Thresholds
| Condition | Threshold | Action |
|-----------|-----------|--------|
| Error rate | > 5% | Stop fault injection immediately |
| Latency p99 | > 5000ms | Stop fault injection immediately |
| Data loss | Any detected | Stop fault injection, trigger rollback |
| Cascading failure | Detected in secondary services | Stop fault injection immediately |
| Unresponsive system | No metrics for > 30s | Stop fault injection, verify health |
## Manual Abort Triggers
- Revenue impact detected (e.g., failed transactions)
- Customer complaints received
- On-call escalation triggered
- Participant calls "ABORT" on communication channel
## Post-Abort Actions
1. Remove all fault injections
2. Verify system recovery to steady state
3. Document timeline of events
4. Create incident report if customer impact occurred
5. Review abort conditions for accuracy
```
### Artifact 5: `RUNBOOK.md`
```markdown
# Chaos Experiment Runbook
## Pre-Experiment Checklist
- [ ] Hypothesis documented in experiment JSON
- [ ] Abort conditions reviewed and agreed upon
- [ ] Toxiproxy running and proxies configured
- [ ] Monitoring dashboards open
- [ ] Baseline metrics captured
- [ ] Team notified in communication channel
- [ ] Rollback procedure tested
## Running an Experiment
### 1. Start Toxiproxy
```bash
toxiproxy-server &
toxiproxy-cli create -l 127.0.0.1:18080 -u 127.0.0.1:8080 upstream-service
```
### 2. Verify Steady State
Confirm all metrics are within normal ranges before injecting faults.
### 3. Inject Fault
```bash
# Latency injection
toxiproxy-cli toxic add -t latency -a latency=500 -a jitter=100 upstream-service
# Service unavailable (timeout with 0)
toxiproxy-cli toxic add -t timeout -a timeout=0 upstream-service
```
### 4. Observe and Record
- Monitor dashboards for metric changes
- Record timestamps of key events
- Note any unexpected behavior
### 5. End Experiment
```bash
toxiproxy-cli toxic remove -t latency upstream-service
```
### 6. Verify Recovery
Confirm metrics return to steady state within expected timeframe.
## Emergency: Abort Experiment
```bash
toxiproxy-cli toxic remove -t latency upstream-service
toxiproxy-cli toxic remove -t timeout upstream-service
# Nuclear option: reset all proxies
toxiproxy-cli list | while read proxy; do toxiproxy-cli toxic delete "$proxy" --all; done
```
```
### CI Job: `chaos-test`
```yaml
chaos-test:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - name: Setup Node
      uses: actions/setup-node@v4
      with:
        node-version: '20'
    - name: Install dependencies
      run: {{INSTALL_CMD}}
    - name: Install Toxiproxy
      run: |
        wget -qO- https://github.com/Shopify/toxiproxy/releases/latest/download/toxiproxy-server-linux-amd64 > /usr/local/bin/toxiproxy-server
        wget -qO- https://github.com/Shopify/toxiproxy/releases/latest/download/toxiproxy-cli-linux-amd64 > /usr/local/bin/toxiproxy-cli
        chmod +x /usr/local/bin/toxiproxy-server /usr/local/bin/toxiproxy-cli
    - name: Start Toxiproxy
      run: |
        toxiproxy-server &
        sleep 2
    - name: Configure proxies
      run: |
        toxiproxy-cli create -l 127.0.0.1:18080 -u 127.0.0.1:8080 upstream-service
    - name: Build and start application
      run: |
        npm run build
        npm run start &
      env:
        UPSTREAM_URL: 'http://127.0.0.1:18080'
    - name: Wait for application
      run: npx wait-on http://localhost:3000 --timeout 30000
    - name: Run chaos experiments
      run: npm run test:chaos
    - name: Upload chaos report
      if: always()
      uses: actions/upload-artifact@v4
      with:
        name: chaos-report
        path: chaos/results/
```
## Manual Testing Areas
- **GameDay facilitation** -- Coordinated multi-team chaos exercises requiring planning and real-time decision making
- **Blast radius assessment** -- Evaluating whether experiment scope is safe for the target environment
- **Hypothesis validation** -- Interpreting whether observed behavior matches the hypothesis
- **Rollback verification** -- Confirming full system recovery after experiment completion
- **Runbook accuracy** -- Verifying documented procedures match actual recovery steps
- **Approval gates** -- Production experiments require sign-off from service owners/SRE leads
- **Incident response testing** -- Validating on-call procedures and escalation paths during simulated failures
- **Cross-service impact** -- Observing whether fault injection causes unexpected cascading failures

| Stage | Scope | Environment | Approval |
|-------|-------|-------------|----------|
| 1 | Single instance | Development | Self |
| 2 | Single instance | Staging | Team lead |
| 3 | Multiple instances | Staging | Engineering manager |
| 4 | Single instance | Production (canary) | SRE lead |
| 5 | Multiple instances | Production | VP Engineering |
