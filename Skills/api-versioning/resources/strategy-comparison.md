# API Versioning Strategy Comparison
**Version:** v0.5.0

Detailed analysis of versioning strategies to help choose the right approach.

## Strategy Deep Dives

### URL Path Versioning

**Implementation:**
```
https://api.example.com/v1/users
https://api.example.com/v2/users
```

**Server routing (Express.js):**
```javascript
const v1Router = require('./routes/v1');
const v2Router = require('./routes/v2');

app.use('/v1', v1Router);
app.use('/v2', v2Router);
```

**Server routing (Python Flask):**
```python
from flask import Blueprint

v1_bp = Blueprint('v1', __name__, url_prefix='/v1')
v2_bp = Blueprint('v2', __name__, url_prefix='/v2')

app.register_blueprint(v1_bp)
app.register_blueprint(v2_bp)
```

**Considerations:**
- Clear folder/module separation
- Easy CDN caching
- Explicit in documentation
- URL changes required for version upgrades

### Query Parameter Versioning

**Implementation:**
```
https://api.example.com/users?version=1
https://api.example.com/users?api-version=2024-01-01
```

**Server handling:**
```javascript
app.get('/users', (req, res) => {
  const version = req.query.version || req.query['api-version'] || '1';

  if (version === '2') {
    return handleV2(req, res);
  }
  return handleV1(req, res);
});
```

**Considerations:**
- Can default to latest or oldest
- Easy to add to existing APIs
- May interfere with caching
- Less explicit in API design

### Header Versioning

**Implementation:**
```
GET /users HTTP/1.1
Host: api.example.com
Accept-Version: v2
```

Or custom header:
```
X-API-Version: 2
```

**Server handling:**
```javascript
app.get('/users', (req, res) => {
  const version = req.get('Accept-Version') || req.get('X-API-Version') || 'v1';

  switch(version) {
    case 'v2':
      return handleV2(req, res);
    default:
      return handleV1(req, res);
  }
});
```

**Considerations:**
- Clean URLs
- Harder to test in browser
- Requires client configuration
- Good for internal APIs

### Media Type Versioning

**Implementation:**
```
GET /users HTTP/1.1
Accept: application/vnd.example.v2+json
```

**Server handling:**
```javascript
app.get('/users', (req, res) => {
  const accept = req.get('Accept');

  if (accept.includes('vnd.example.v2')) {
    res.type('application/vnd.example.v2+json');
    return handleV2(req, res);
  }

  res.type('application/vnd.example.v1+json');
  return handleV1(req, res);
});
```

**Considerations:**
- Most RESTful approach
- Complex to implement
- Requires content negotiation
- Can version representations independently

## Comparison Matrix

### By Use Case

| Use Case | Recommended Strategy |
|----------|---------------------|
| Public REST API | URL Path |
| Internal microservices | Header |
| GraphQL API | Schema evolution (no versioning) |
| Frequently changing API | Date-based query param |
| Enterprise/compliant | Media Type |
| Simple CRUD API | URL Path |
| Mobile app backend | URL Path |
| Single client | Header |

### By Organization Size

| Size | Recommended | Rationale |
|------|-------------|-----------|
| Startup | URL Path | Simple, clear, easy to document |
| Small team | Query Param | Flexible, easy to add |
| Medium company | URL Path or Header | Balance of clarity and flexibility |
| Enterprise | Media Type | Standards compliance |

### By Breaking Change Frequency

| Frequency | Strategy |
|-----------|----------|
| Rarely | Major version in URL (v1, v2) |
| Occasionally | Minor versions in header |
| Frequently | Date-based versions |
| Continuously | GraphQL evolution |

## Hybrid Approaches

### URL + Header

```
/v1/users              # Major version in URL
X-Minor-Version: 1.2   # Minor version in header
```

**When to use:**
- Breaking changes rare (major in URL)
- Minor tweaks frequent (minor in header)

### URL + Query for Preview

```
/v2/users              # Stable version
/v2/users?preview=true # Preview features
```

**When to use:**
- Beta features
- Gradual rollout
- A/B testing

### Media Type + URL Fallback

```
# Preferred
Accept: application/vnd.example.v2+json

# Fallback for simple clients
/v2/users
```

**When to use:**
- Enterprise environments
- Mixed client sophistication

## Implementation Patterns

### Version Router Pattern

```python
# version_router.py
class VersionRouter:
    def __init__(self):
        self.handlers = {}

    def register(self, version, handler):
        self.handlers[version] = handler

    def route(self, version, request):
        handler = self.handlers.get(version, self.handlers.get('default'))
        return handler(request)

# Usage
router = VersionRouter()
router.register('v1', handle_v1)
router.register('v2', handle_v2)
router.register('default', handle_v1)
```

### Version Middleware Pattern

```javascript
// Express middleware
const versionMiddleware = (req, res, next) => {
  // Extract version from various sources
  req.apiVersion =
    req.params.version ||
    req.query.version ||
    req.get('X-API-Version') ||
    parseMediaType(req.get('Accept')) ||
    'v1';

  next();
};

app.use(versionMiddleware);
```

### Version Service Pattern

```python
class UserService:
    def get_users(self, version):
        if version == 'v2':
            return self._get_users_v2()
        return self._get_users_v1()

    def _get_users_v1(self):
        return [{"id": 1, "name": "Alice"}]

    def _get_users_v2(self):
        return [{"id": 1, "fullName": "Alice Smith", "email": "alice@example.com"}]
```

## Migration Between Strategies

### URL to Header

1. Add header support while keeping URL
2. Document header usage
3. Deprecate URL version parameter
4. Remove URL versioning after transition

### Header to URL

1. Add URL routing
2. Map headers to URL versions
3. Document URL patterns
4. Deprecate header support

## Anti-Patterns

### Version in Every Endpoint

```
/users/v1
/products/v1
/orders/v1
```

**Problem:** Inconsistent, hard to manage
**Solution:** Version at API root level

### Versioning Without Policy

```
/v1, /v2, /v3, /v4, /v5...
```

**Problem:** Too many versions to maintain
**Solution:** Deprecation policy, version consolidation

### Breaking Changes Without Version Bump

```
# v1 changed response format without new version
```

**Problem:** Breaks existing clients
**Solution:** New version for any breaking change

---

**See SKILL.md for complete API versioning guidance**
