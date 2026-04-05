# Backward Compatibility Guide
**Version:** v0.10.0
## Compatibility Levels
### Fully Compatible (No Version Bump)
- Adding new endpoints
- Adding optional query parameters
- Adding optional request body fields
- Adding new response fields
- Adding new enum values (if client handles unknown)
- Documentation/performance improvements
### Backward Compatible (Minor Version)
- New required fields with defaults
- New response formats (with Accept header)
- New authentication methods (keeping old)
- Relaxed validation rules
### Breaking (Major Version Required)
- Removing endpoints or response fields
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
**Solution: Parallel fields with deprecation**
```json
// Transition period
{
  "name": "Alice",       // Deprecated, will be removed
  "fullName": "Alice"    // New field
}
```
```javascript
const response = {
  fullName: user.fullName,
  name: user.fullName  // Deprecated alias
};
res.set('Warning', '299 - "name field deprecated, use fullName"');
```
### Type Change
**Solution: New field with different name**
```json
// v1
{"id": 123}
// v2
{"id": "123", "legacyId": 123}
```
### Removing Fields
**Solution: Phased deprecation**
```json
// Phase 1: Mark deprecated (both fields present)
{"name": "Alice", "avatar_url": "...", "profile_image": "..."}
// Phase 2: Return null
{"name": "Alice", "avatar_url": null, "profile_image": "..."}
// Phase 3: Remove (new version)
{"name": "Alice", "profile_image": "..."}
```
### Validation Changes
- **Tightening rules = BREAKING** (clients may have invalid data)
- **Relaxing rules = safe** (existing requests still work)
## Client Guidelines
**Postel's Law:** Be conservative in what you send, liberal in what you accept.
1. Ignore unknown response fields
2. Handle missing optional fields
3. Handle unknown enum values
4. Don't rely on field order
5. Accept reasonable type coercion
### Defensive Parsing
```javascript
// Good - handles missing and unknown
function parseUser(data) {
  return {
    id: data.id,
    name: data.name || 'Unknown',
    email: data.email || null,
  };
}
```
## Testing Compatibility
### Contract Testing
```javascript
describe('v1 API contract', () => {
  it('returns expected v1 response shape', async () => {
    const response = await api.get('/v1/users/1');
    expect(response).toHaveProperty('id');
    expect(response).toHaveProperty('name');
  });
});
```
### Backward Compatibility Tests
```javascript
describe('backward compatibility', () => {
  it('v2 response parseable by v1 client', () => {
    const v2Response = { id: 1, fullName: 'Alice', name: 'Alice', email: '...' };
    const v1Client = new V1Client();
    const user = v1Client.parseUser(v2Response);
    expect(user.id).toBe(1);
    expect(user.name).toBe('Alice');
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
## v2.0.0 - 2024-06-01
### Breaking Changes
- Removed `avatar_url` field from User response
- Changed `id` from integer to string
### Migration Required
See [Migration Guide](/docs/v2-migration)
## v1.2.0 - 2024-03-01
### Added
- New `profile_image` field in User response
### Deprecated
- `avatar_url` field (use `profile_image`)
- `name` field (use `fullName`)
```
### Deprecation Markers
| Field | Type | Description |
|-------|------|-------------|
| id | integer | User ID |
| name | string | **DEPRECATED** Use fullName. Will be removed in v2. |
| fullName | string | User's full name |
| email | string | User's email (added in v1.1) |
