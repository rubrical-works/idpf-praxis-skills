# Backward Compatibility Guide
**Version:** v0.4.0

Patterns and practices for maintaining backward compatibility in APIs.

## Compatibility Levels

### Fully Compatible (No Version Bump)

Changes that don't break any clients:
- Adding new endpoints
- Adding optional query parameters
- Adding optional request body fields
- Adding new response fields
- Adding new enum values (if client handles unknown)
- Documentation improvements
- Performance improvements

### Backward Compatible (Minor Version)

Changes that don't break existing usage but add functionality:
- New required fields with defaults
- New response formats (with Accept header)
- New authentication methods (keeping old)
- Relaxed validation rules

### Breaking (Major Version Required)

Changes that may break existing clients:
- Removing endpoints
- Removing response fields
- Changing field types
- Renaming fields
- Tightening validation rules
- Changing authentication requirements
- Changing error response format

## Safe Change Patterns

### Adding Fields

**Request - new optional field:**
```json
// v1 (still works)
{"name": "Alice"}

// v1.1 (new optional field)
{"name": "Alice", "email": "alice@example.com"}
```

**Response - new field:**
```json
// v1
{"id": 1, "name": "Alice"}

// v1.1 (clients should ignore unknown fields)
{"id": 1, "name": "Alice", "created_at": "2024-01-01"}
```

### Adding Endpoints

```
// v1
GET /users
POST /users

// v1.1 (new endpoint, no impact on existing)
GET /users
POST /users
GET /users/search   // NEW
```

### Adding Query Parameters

```
// v1 (still works)
GET /users

// v1.1 (optional parameter)
GET /users?include_inactive=true
```

### Adding Enum Values

```json
// v1 status values: "active", "inactive"
// v1.1 status values: "active", "inactive", "pending"

// Client must handle unknown values gracefully:
switch(status) {
  case "active": ...
  case "inactive": ...
  default: handleUnknown(status);  // Don't crash!
}
```

## Breaking Change Mitigation

### Field Rename

**Problem:** Renaming `name` to `fullName` breaks clients.

**Solution: Parallel fields with deprecation**
```json
// Transition period
{
  "name": "Alice",       // Deprecated, will be removed
  "fullName": "Alice"    // New field
}

// After transition
{
  "fullName": "Alice"
}
```

**Implementation:**
```javascript
// Serve both during transition
const response = {
  fullName: user.fullName,
  name: user.fullName  // Deprecated alias
};

// Add header
res.set('Warning', '299 - "name field deprecated, use fullName"');
```

### Type Change

**Problem:** Changing `id` from number to string.

**Solution: New field with different name**
```json
// v1
{"id": 123}

// v2
{"id": "123", "legacyId": 123}
```

Or new version:
```json
// v1: {"id": 123}
// v2: {"id": "abc-123"}  // Breaking, requires new version
```

### Removing Fields

**Problem:** Removing `avatar_url` field.

**Solution: Deprecation period**
```json
// Phase 1: Mark deprecated
{
  "name": "Alice",
  "avatar_url": "...",  // Deprecated
  "profile_image": "..."  // New field
}

// Phase 2: Return null
{
  "name": "Alice",
  "avatar_url": null,  // Still present but null
  "profile_image": "..."
}

// Phase 3: Remove (new version)
{
  "name": "Alice",
  "profile_image": "..."
}
```

### Validation Changes

**Tightening rules (breaking):**
```
// v1: email accepts any string
// v2: email must be valid format
// This is BREAKING - clients may have invalid data
```

**Relaxing rules (safe):**
```
// v1: name required
// v1.1: name optional
// Safe - existing requests still work
```

## Client Guidelines

### Robustness Principles

**Postel's Law:** Be conservative in what you send, liberal in what you accept.

**For API clients:**
1. Ignore unknown response fields
2. Handle missing optional fields
3. Handle unknown enum values
4. Don't rely on field order
5. Handle extra whitespace
6. Accept reasonable type coercion

### Defensive Parsing

```javascript
// Good - handles missing and unknown
function parseUser(data) {
  return {
    id: data.id,
    name: data.name || 'Unknown',
    email: data.email || null,
    // Ignore other fields
  };
}

// Bad - brittle
function parseUser(data) {
  const { id, name, email } = data;
  // Fails if extra fields or missing fields
}
```

### Version Handling

```javascript
// Client should track API version
const client = new ApiClient({
  baseUrl: 'https://api.example.com',
  version: 'v2'
});

// Handle version-specific responses
client.getUsers().then(users => {
  // Response shape depends on version
  const normalized = client.version === 'v2'
    ? users.map(u => ({ id: u.id, name: u.fullName }))
    : users.map(u => ({ id: u.id, name: u.name }));
});
```

## Testing Compatibility

### Contract Testing

```javascript
// Test v1 contract still works
describe('v1 API contract', () => {
  it('returns expected v1 response shape', async () => {
    const response = await api.get('/v1/users/1');

    expect(response).toHaveProperty('id');
    expect(response).toHaveProperty('name');
    // v1 contract - these must exist
  });
});

// Test v2 additions
describe('v2 API contract', () => {
  it('returns v2 response shape with new fields', async () => {
    const response = await api.get('/v2/users/1');

    expect(response).toHaveProperty('id');
    expect(response).toHaveProperty('fullName');
    expect(response).toHaveProperty('email');
  });
});
```

### Backward Compatibility Tests

```javascript
// Ensure v1 client can consume v2 server response
describe('backward compatibility', () => {
  it('v2 response parseable by v1 client', () => {
    const v2Response = { id: 1, fullName: 'Alice', name: 'Alice', email: '...' };
    const v1Client = new V1Client();

    // Should not throw
    const user = v1Client.parseUser(v2Response);

    expect(user.id).toBe(1);
    expect(user.name).toBe('Alice');
    // v1 client ignores unknown fields
  });
});
```

### Schema Validation

```yaml
# OpenAPI - mark deprecated fields
components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: integer
        name:
          type: string
          deprecated: true
          description: "Deprecated. Use fullName instead."
        fullName:
          type: string
```

## Documentation Practices

### Changelog Format

```markdown
# API Changelog

## v2.0.0 - 2024-06-01

### Breaking Changes
- Removed `avatar_url` field from User response
- Changed `id` from integer to string

### Migration Required
See [Migration Guide](/docs/v2-migration)

## v1.2.0 - 2024-03-01

### Added
- New `profile_image` field in User response
- New `/users/search` endpoint

### Deprecated
- `avatar_url` field (use `profile_image`)
- `name` field (use `fullName`)

## v1.1.0 - 2024-01-01

### Added
- Optional `email` field in User response
```

### Deprecation Markers

```markdown
# Get User

Returns user details.

## Response

| Field | Type | Description |
|-------|------|-------------|
| id | integer | User ID |
| name | string | **DEPRECATED** Use fullName. Will be removed in v2. |
| fullName | string | User's full name |
| email | string | User's email (added in v1.1) |
```

---

**See SKILL.md for complete API versioning guidance**
