# API Versioning Strategy Comparison
**Version:** v0.12.0
## Strategy Deep Dives
### URL Path Versioning
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
- Clear folder/module separation, easy CDN caching, explicit in docs
- URL changes required for version upgrades
### Query Parameter Versioning
```
https://api.example.com/users?version=1
https://api.example.com/users?api-version=2024-01-01
```
```javascript
app.get('/users', (req, res) => {
  const version = req.query.version || req.query['api-version'] || '1';
  if (version === '2') return handleV2(req, res);
  return handleV1(req, res);
});
```
- Can default to latest or oldest, easy to add to existing APIs
- May interfere with caching, less explicit
### Header Versioning
```
GET /users HTTP/1.1
Host: api.example.com
Accept-Version: v2
```
```javascript
app.get('/users', (req, res) => {
  const version = req.get('Accept-Version') || req.get('X-API-Version') || 'v1';
  switch(version) {
    case 'v2': return handleV2(req, res);
    default: return handleV1(req, res);
  }
});
```
- Clean URLs, good for internal APIs
- Harder to test in browser, requires client configuration
### Media Type Versioning
```
GET /users HTTP/1.1
Accept: application/vnd.example.v2+json
```
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
- Most RESTful, can version representations independently
- Complex to implement, requires content negotiation
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
Use when breaking changes are rare but minor tweaks are frequent.
### URL + Query for Preview
```
/v2/users              # Stable version
/v2/users?preview=true # Preview features
```
Use for beta features, gradual rollout, A/B testing.
### Media Type + URL Fallback
```
# Preferred
Accept: application/vnd.example.v2+json
# Fallback for simple clients
/v2/users
```
Use for enterprise environments with mixed client sophistication.
## Implementation Patterns
### Version Router Pattern
```python
class VersionRouter:
    def __init__(self):
        self.handlers = {}
    def register(self, version, handler):
        self.handlers[version] = handler
    def route(self, version, request):
        handler = self.handlers.get(version, self.handlers.get('default'))
        return handler(request)
router = VersionRouter()
router.register('v1', handle_v1)
router.register('v2', handle_v2)
router.register('default', handle_v1)
```
### Version Middleware Pattern
```javascript
const versionMiddleware = (req, res, next) => {
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
## Anti-Patterns
### Version in Every Endpoint
```
/users/v1    /products/v1    /orders/v1
```
**Problem:** Inconsistent, hard to manage. **Solution:** Version at API root level.
### Versioning Without Policy
**Problem:** Too many versions to maintain. **Solution:** Deprecation policy, version consolidation.
### Breaking Changes Without Version Bump
**Problem:** Breaks existing clients. **Solution:** New version for any breaking change.
