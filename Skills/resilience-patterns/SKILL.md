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

Fault tolerance for systems calling external services, DBs, or unreliable dependencies.

## When to Use
External APIs, DB resilience, microservice comms, transient failures (timeouts, rate limits), graceful degradation.

## Core Principles
1. **Assume failure** — design for it
2. **Fail fast** — detect quickly
3. **Degrade gracefully** — reduced > no functionality
4. **Recover automatically** — self-heal
5. **Isolate failures** — prevent cascading

---

## Pattern 1: Retry with Exponential Backoff

Auto-retry transient failures with increasing delay.

**Use for:** network timeouts, HTTP 429/503, DB connection failures, transient errors.
**Do NOT use for:** HTTP 400/401/403/404, validation errors, business logic failures.

```python
# Python
import time
def with_retry(func, max_attempts=3, backoff_factor=2, retryable=None):
    for attempt in range(max_attempts):
        try:
            return func()
        except Exception as e:
            if retryable and not retryable(e):
                raise
            if attempt >= max_attempts - 1:
                raise
            time.sleep(backoff_factor ** attempt)
```

```javascript
// JavaScript
async function withRetry(fn, { maxAttempts = 3, backoff = 2 } = {}) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try { return await fn(); }
    catch (err) {
      if (attempt >= maxAttempts - 1) throw err;
      await new Promise(r => setTimeout(r, backoff ** attempt * 1000));
    }
  }
}
```

```go
// Go
func withRetry(fn func() error, maxAttempts int) error {
    var lastErr error
    for i := 0; i < maxAttempts; i++ {
        if err := fn(); err != nil {
            lastErr = err
            time.Sleep(time.Duration(math.Pow(2, float64(i))) * time.Second)
            continue
        }
        return nil
    }
    return fmt.Errorf("failed after %d attempts: %w", maxAttempts, lastErr)
}
```

| Parameter | Default | Description |
|-----------|---------|-------------|
| Max attempts | 3 | Total tries |
| Backoff factor | 2 | Delay multiplier |
| Max delay | 30s | Backoff cap |
| Jitter | ±20% | Prevents thundering herd |

---

## Pattern 2: Circuit Breaker

Prevent cascading failures by short-circuiting calls to failing dependencies.

**States:**
```
CLOSED → (failures exceed threshold) → OPEN
OPEN → (recovery timeout expires) → HALF-OPEN
HALF-OPEN → (test call succeeds) → CLOSED
HALF-OPEN → (test call fails) → OPEN
```

```python
# Python
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

| Parameter | Default | Description |
|-----------|---------|-------------|
| Failure threshold | 5 | Failures before opening |
| Recovery timeout | 60s | Time before half-open |
| Success threshold | 1 | Successes in half-open before closing |

---

## Pattern 3: Fallback

Alternative responses when primary fails.

```python
# Python
def get_user_with_fallback(user_id):
    try:
        return user_service.get_user(user_id)
    except ExternalServiceError:
        cached = cache.get(f'user:{user_id}')
        if cached:
            return cached
        return User.default(user_id)
```

| Strategy | Use When | Trade-off |
|----------|----------|-----------|
| Cache fallback | Stale data ok | Outdated |
| Default value | Safe default exists | Reduced functionality |
| Alternative service | Backup available | Extra infra |
| Graceful degradation | Feature disable-able | Missing functionality |

---

## Pattern 4: Bulkhead

Isolate failure domains so one failing dependency doesn't exhaust all resources.

```javascript
// JavaScript — Semaphore bulkhead
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
    try { return await fn(); }
    finally {
      this.running--;
      if (this.queue.length > 0) this.queue.shift()();
    }
  }
}
const dbBulkhead = new Bulkhead(10);
const apiBulkhead = new Bulkhead(5);
```

---

## Pattern 5: Timeout

Enforce maximum wait times.

```python
# Python
import asyncio
async def with_timeout(coro, timeout_seconds=5):
    try:
        return await asyncio.wait_for(coro, timeout=timeout_seconds)
    except asyncio.TimeoutError:
        raise TimeoutError(f"Operation timed out after {timeout_seconds}s")
```

```go
// Go — context timeout
func getUserWithTimeout(ctx context.Context, id string) (*User, error) {
    ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
    defer cancel()
    return db.FindUserContext(ctx, id)
}
```

| Operation | Typical Timeout | Notes |
|-----------|----------------|-------|
| Database query | 5-10s | Longer for complex reports |
| HTTP API call | 10-30s | Depends on SLA |
| Cache lookup | 100-500ms | Fast |
| DNS resolution | 2-5s | Usually <1s |

---

## Combining Patterns

```
Request → Timeout → Retry → Circuit Breaker → Bulkhead → Service Call
```

- **Retry + Circuit Breaker:** retry transient, stop when truly down
- **Timeout + Retry:** don't retry if already timed out
- **Bulkhead + Circuit Breaker:** isolate and break per dependency
- **Fallback + Circuit Breaker:** when circuit opens, fallback immediately

---

## Resources
- `resources/pattern-selection-guide.md` — decision tree
- `resources/combined-patterns.md` — multi-pattern examples

**Complements:** `error-handling-patterns`, `anti-pattern-analysis`
