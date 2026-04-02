# NFR Detection Guide
**Version:** v0.5.0

**Purpose:** Patterns for inferring Non-Functional Requirements from code

---

## Overview

Code patterns reveal implemented NFRs even when not explicitly documented. This guide catalogs patterns that indicate specific quality attributes.

---

## Security (SEC)

### SEC-001: Password Hashing

**Patterns:**
```python
# Python
bcrypt.hashpw(password, salt)
argon2.hash(password)
hashlib.pbkdf2_hmac('sha256', password, salt, iterations)
```

```javascript
// JavaScript
bcrypt.hash(password, saltRounds)
argon2.hash(password)
crypto.pbkdf2(password, salt, iterations, keylen, 'sha512')
```

```java
// Java
BCrypt.hashpw(password, BCrypt.gensalt())
Argon2Factory.create().hash(iterations, memory, parallelism, password)
```

**Inferred NFR:**
> SEC-001: User passwords must be hashed using industry-standard algorithms (bcrypt, argon2, or PBKDF2) before storage.

---

### SEC-002: Authentication Required

**Patterns:**
```python
@login_required
@authenticated
@jwt_required
def protected_route(): ...
```

```javascript
app.use('/api', authMiddleware)
router.get('/profile', authenticate, handler)
@UseGuards(AuthGuard)
```

```java
@PreAuthorize("isAuthenticated()")
@Secured("ROLE_USER")
.authenticated()
```

**Inferred NFR:**
> SEC-002: Protected resources require valid authentication before access.

---

### SEC-003: Authorization Controls

**Patterns:**
```python
@requires_permission('admin')
@roles_required(['admin', 'manager'])
if user.has_role('admin'):
```

```javascript
@Roles('admin')
checkPermission(user, 'write')
authorize(['admin', 'editor'])
```

**Inferred NFR:**
> SEC-003: Role-based access control (RBAC) enforced for sensitive operations.

---

### SEC-004: CSRF Protection

**Patterns:**
```python
csrf_token()
@csrf_protect
CSRFProtect(app)
```

```javascript
app.use(csrf())
csrfToken: req.csrfToken()
<input type="hidden" name="_csrf" value="{{csrfToken}}">
```

**Inferred NFR:**
> SEC-004: Cross-Site Request Forgery (CSRF) protection implemented for state-changing requests.

---

### SEC-005: Security Headers

**Patterns:**
```javascript
app.use(helmet())
res.setHeader('X-Frame-Options', 'DENY')
res.setHeader('Content-Security-Policy', '...')
res.setHeader('X-XSS-Protection', '1; mode=block')
```

```python
response.headers['Strict-Transport-Security'] = 'max-age=...'
SECURE_BROWSER_XSS_FILTER = True
```

**Inferred NFR:**
> SEC-005: Security headers (HSTS, CSP, X-Frame-Options, etc.) configured per OWASP recommendations.

---

### SEC-006: Input Validation

**Patterns:**
```python
validate(data, schema)
cleaned_data = sanitize(user_input)
escape_html(content)
```

```javascript
joi.validate(input, schema)
validator.escape(input)
sanitizeHtml(content)
```

```java
@Valid @RequestBody UserDto user
Jsoup.clean(html, Whitelist.basic())
```

**Inferred NFR:**
> SEC-006: All user input validated and sanitized before processing.

---

### SEC-007: Data Encryption

**Patterns:**
```python
cipher.encrypt(data)
Fernet(key).encrypt(message)
AES.new(key, AES.MODE_GCM)
```

```javascript
crypto.createCipheriv('aes-256-gcm', key, iv)
encryptedData = cipher.update(data)
```

**Inferred NFR:**
> SEC-007: Sensitive data encrypted at rest using AES-256 or equivalent.

---

### SEC-008: Rate Limiting

**Patterns:**
```python
@ratelimit(limit=100, per=60)
limiter = Limiter(key_func=get_remote_address)
```

```javascript
rateLimit({ windowMs: 60000, max: 100 })
@Throttle(100, 60)
```

**Inferred NFR:**
> SEC-008: API rate limiting implemented to prevent abuse (100 requests/minute detected).

---

## Performance (PERF)

### PERF-001: Caching

**Patterns:**
```python
@cache.cached(timeout=300)
redis.get(key) or compute_and_cache()
@lru_cache(maxsize=128)
```

```javascript
cache.get(key) || await fetchAndCache()
@Cacheable({ ttl: 300 })
redis.setex(key, 300, value)
```

**Inferred NFR:**
> PERF-001: Frequently accessed data cached with [TTL] second expiry.

---

### PERF-002: Async Processing

**Patterns:**
```python
async def handler():
    await database.query()
asyncio.gather(*tasks)
```

```javascript
async function handler() {
    await Promise.all(operations)
}
```

**Inferred NFR:**
> PERF-002: Non-blocking async processing for I/O operations.

---

### PERF-003: Connection Pooling

**Patterns:**
```python
pool = create_pool(min_size=5, max_size=20)
engine = create_engine(url, pool_size=10)
```

```javascript
const pool = new Pool({ max: 20 })
connectionPool: { min: 5, max: 20 }
```

**Inferred NFR:**
> PERF-003: Database connection pooling configured (pool size: [N]).

---

### PERF-004: Database Indexing

**Patterns:**
```python
Index('idx_user_email', User.email)
db.users.create_index('email')
```

```sql
CREATE INDEX idx_user_email ON users(email);
```

**Inferred NFR:**
> PERF-004: Database indexes defined for frequently queried columns.

---

### PERF-005: Pagination

**Patterns:**
```python
query.limit(limit).offset(offset)
Paginator(queryset, per_page=20)
```

```javascript
.skip(offset).limit(limit)
{ page: 1, pageSize: 20 }
```

**Inferred NFR:**
> PERF-005: List endpoints support pagination (default page size: [N]).

---

### PERF-006: Response Compression

**Patterns:**
```python
app = Flask(__name__)
Compress(app)
```

```javascript
app.use(compression())
res.setHeader('Content-Encoding', 'gzip')
```

**Inferred NFR:**
> PERF-006: HTTP responses compressed (gzip/brotli).

---

## Reliability (REL)

### REL-001: Retry Logic

**Patterns:**
```python
@retry(max_attempts=3, backoff=2)
tenacity.retry(stop=stop_after_attempt(3))
```

```javascript
axios.interceptors.response.use(null, retryHandler)
retry(operation, { retries: 3 })
```

**Inferred NFR:**
> REL-001: Transient failures handled with retry logic (max [N] attempts).

---

### REL-002: Circuit Breaker

**Patterns:**
```python
@circuit(failure_threshold=5, recovery_timeout=30)
CircuitBreaker(fail_max=5, reset_timeout=30)
```

```javascript
const breaker = new CircuitBreaker(asyncFunc, options)
opossum.fire()
```

**Inferred NFR:**
> REL-002: Circuit breaker pattern prevents cascade failures.

---

### REL-003: Timeout Handling

**Patterns:**
```python
requests.get(url, timeout=30)
asyncio.wait_for(coro, timeout=10)
```

```javascript
axios.get(url, { timeout: 30000 })
AbortController with setTimeout
```

**Inferred NFR:**
> REL-003: External calls have timeout limits ([N] seconds).

---

### REL-004: Fallback Behavior

**Patterns:**
```python
try:
    result = external_call()
except Exception:
    result = fallback_value
```

```javascript
.catch(() => fallbackValue)
getOrDefault(key, defaultValue)
```

**Inferred NFR:**
> REL-004: Graceful degradation with fallback behavior for failures.

---

### REL-005: Transaction Support

**Patterns:**
```python
with db.begin():
    # operations
db.session.commit()
```

```javascript
await prisma.$transaction([...])
connection.beginTransaction()
```

```java
@Transactional
public void transferFunds() { }
```

**Inferred NFR:**
> REL-005: Data operations wrapped in transactions for consistency.

---

### REL-007: Health Checks

**Patterns:**
```python
@app.route('/health')
def health(): return {'status': 'ok'}
```

```javascript
app.get('/health', (req, res) => res.json({ status: 'ok' }))
livenessProbe, readinessProbe (Kubernetes)
```

**Inferred NFR:**
> REL-007: Health check endpoint available for monitoring.

---

## Observability (OBS)

### OBS-001: Logging

**Patterns:**
```python
logger.info('User created', extra={'user_id': id})
logging.getLogger(__name__)
```

```javascript
logger.info('Request received', { path, method })
winston.createLogger()
```

**Inferred NFR:**
> OBS-001: Structured logging implemented for observability.

---

### OBS-002: Metrics

**Patterns:**
```python
prometheus_client.Counter('requests_total')
statsd.increment('api.requests')
```

```javascript
metrics.counter('requests_total').inc()
promClient.register.metrics()
```

**Inferred NFR:**
> OBS-002: Application metrics collected for monitoring.

---

### OBS-003: Distributed Tracing

**Patterns:**
```python
from opentelemetry import trace
tracer.start_span('operation')
```

```javascript
const span = tracer.startSpan('operation')
require('@opentelemetry/api')
```

**Inferred NFR:**
> OBS-003: Distributed tracing enabled for request tracking.

---

### OBS-004: Audit Logging

**Patterns:**
```python
audit_log.record(action='update', user=user, resource=resource)
AuditLog.create(event_type='login', user_id=id)
```

**Inferred NFR:**
> OBS-004: Security-relevant actions recorded in audit log.

---

## Confidence Scoring

| Evidence Type | Confidence |
|---------------|------------|
| Explicit decorator/annotation | High |
| Library import + usage | High |
| Configuration value | Medium |
| Pattern in single location | Medium |
| Comment/docstring mention | Low |
| Naming convention only | Low |

---

**End of Guide**
