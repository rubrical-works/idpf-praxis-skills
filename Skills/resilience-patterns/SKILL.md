---
name: resilience-patterns
description: Fault tolerance patterns for distributed systems — retry, circuit breaker, fallback, bulkhead, and timeout
type: reference
disable-model-invocation: true
version: "1.0.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-04-01"
license: Complete terms in LICENSE.txt
category: code-quality
relevantTechStack: [distributed-systems, microservices, api, node, python, go, java, rust]
copyright: "Rubrical Works (c) 2026"
---
# Resilience Patterns
Fault tolerance for systems with external services, databases, or unreliable dependencies.
## Core Principles
1. Assume failure: external deps will fail--design for it
2. Fail fast: detect failure quickly, don't wait for timeouts
3. Degrade gracefully: reduced functionality over none
4. Recover automatically: self-heal when deps recover
5. Isolate failures: prevent cascading from one dep to others
## Pattern 1: Retry with Exponential Backoff
Retry transient failures (network timeouts, HTTP 429/503, DB connection failures) with increasing delay. Do NOT retry client errors (400/401/403/404), validation errors, or business logic failures.
```python
import time
def with_retry(func, max_attempts=3, backoff_factor=2, retryable=None):
    """Retry with exponential backoff."""
    for attempt in range(max_attempts):
        try:
            return func()
        except Exception as e:
            if retryable and not retryable(e):
                raise
            if attempt >= max_attempts - 1:
                raise
            sleep_time = backoff_factor ** attempt
            time.sleep(sleep_time)
```
```javascript
async function withRetry(fn, { maxAttempts = 3, backoff = 2 } = {}) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt >= maxAttempts - 1) throw err;
      await new Promise(r => setTimeout(r, backoff ** attempt * 1000));
    }
  }
}
```
| Parameter | Default | Description |
|-----------|---------|-------------|
| Max attempts | 3 | Total tries before giving up |
| Backoff factor | 2 | Delay multiplier between retries |
| Max delay | 30s | Cap on backoff |
| Jitter | +/-20% | Prevents thundering herd |
## Pattern 2: Circuit Breaker
Prevent cascading failures by short-circuiting calls to failing deps.
```
CLOSED -> (failures exceed threshold) -> OPEN
OPEN -> (recovery timeout expires) -> HALF-OPEN
HALF-OPEN -> (test succeeds) -> CLOSED / (test fails) -> OPEN
```
```python
import time
class CircuitBreaker:
    def __init__(self, failure_threshold=5, recovery_timeout=60):
        self.failure_count = 0
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.state = 'closed'
        self.last_failure_time = None
    def call(self, func):
        if self.state == 'open':
            if time.time() - self.last_failure_time > self.recovery_timeout:
                self.state = 'half-open'
            else:
                raise CircuitOpenError('Circuit breaker is open')
        try:
            result = func()
            if self.state == 'half-open':
                self.state = 'closed'
                self.failure_count = 0
            return result
        except Exception:
            self.failure_count += 1
            self.last_failure_time = time.time()
            if self.failure_count >= self.failure_threshold:
                self.state = 'open'
            raise
```
Config: failure_threshold=5 (failures before open), recovery_timeout=60s (time before half-open), success_threshold=1 (successes in half-open before close).
## Pattern 3: Fallback
Provide alternative responses when primary source fails.
```python
def get_user_with_fallback(user_id):
    """Try primary, fall back to cache, then default."""
    try:
        return user_service.get_user(user_id)
    except ExternalServiceError:
        cached = cache.get(f'user:{user_id}')
        if cached:
            return cached  # Stale but available
        return User.default(user_id)  # Minimal default
```
Strategies: Cache fallback (stale data acceptable), default value (safe default exists), alternative service (backup available), graceful degradation (feature disabled).
## Pattern 4: Bulkhead
Isolate failure domains so one failing dep doesn't exhaust all resources.
```javascript
class Bulkhead {
  constructor(maxConcurrent) {
    this.maxConcurrent = maxConcurrent;
    this.running = 0;
    this.queue = [];
  }
  async execute(fn) {
    if (this.running >= this.maxConcurrent) {
      await new Promise(resolve => this.queue.push(resolve));
    }
    this.running++;
    try {
      return await fn();
    } finally {
      this.running--;
      if (this.queue.length > 0) this.queue.shift()();
    }
  }
}
const dbBulkhead = new Bulkhead(10);
const apiBulkhead = new Bulkhead(5);
```
## Pattern 5: Timeout
Prevent hanging operations with maximum wait times.
```python
import asyncio
async def with_timeout(coro, timeout_seconds=5):
    try:
        return await asyncio.wait_for(coro, timeout=timeout_seconds)
    except asyncio.TimeoutError:
        raise TimeoutError(f"Operation timed out after {timeout_seconds}s")
```
Guidelines: DB query 5-10s, HTTP API 10-30s, cache lookup 100-500ms, DNS 2-5s.
## Combining Patterns
```
Request -> Timeout -> Retry -> Circuit Breaker -> Bulkhead -> Service Call
```
Retry + Circuit Breaker: retry transient failures, stop when truly down. Timeout + Retry: don't retry if timed out. Bulkhead + Circuit Breaker: isolate and break per dependency. Fallback + Circuit Breaker: use fallback immediately when circuit opens.