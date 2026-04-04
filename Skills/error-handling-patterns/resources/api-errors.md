# API Error Patterns
**Version:** v0.9.0

Best practices for API error responses.

## Standard Error Response Format

### JSON:API Style

```json
{
  "errors": [
    {
      "id": "error-123",
      "status": "400",
      "code": "VALIDATION_ERROR",
      "title": "Validation Error",
      "detail": "The 'email' field must be a valid email address",
      "source": {
        "pointer": "/data/attributes/email",
        "parameter": "email"
      },
      "meta": {
        "received_value": "not-an-email"
      }
    }
  ]
}
```

### Problem Details (RFC 7807)

```json
{
  "type": "https://api.example.com/problems/validation-error",
  "title": "Validation Error",
  "status": 400,
  "detail": "The email field contains an invalid email address",
  "instance": "/api/users/123",
  "errors": [
    {
      "field": "email",
      "message": "must be a valid email address"
    }
  ]
}
```

### Custom Format (Simple)

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "errors": [
        {"field": "email", "message": "Invalid format"}
      ]
    },
    "request_id": "abc-123"
  }
}
```

## HTTP Status Codes

### 4xx Client Errors

| Code | Name | When to Use |
|------|------|-------------|
| 400 | Bad Request | Malformed request, validation error |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Authenticated but not authorized |
| 404 | Not Found | Resource doesn't exist |
| 405 | Method Not Allowed | HTTP method not supported |
| 406 | Not Acceptable | Cannot produce requested content type |
| 409 | Conflict | Resource conflict (duplicate, state conflict) |
| 410 | Gone | Resource permanently removed |
| 415 | Unsupported Media Type | Request content type not supported |
| 422 | Unprocessable Entity | Semantic validation failure |
| 429 | Too Many Requests | Rate limit exceeded |

### 5xx Server Errors

| Code | Name | When to Use |
|------|------|-------------|
| 500 | Internal Server Error | Unexpected error |
| 501 | Not Implemented | Feature not implemented |
| 502 | Bad Gateway | Upstream service error |
| 503 | Service Unavailable | Service temporarily unavailable |
| 504 | Gateway Timeout | Upstream service timeout |

### Choosing Between Similar Codes

**400 vs 422:**
- 400: Syntactically invalid (malformed JSON)
- 422: Syntactically valid but semantically invalid (business rule violation)

**401 vs 403:**
- 401: "Who are you?" (authentication)
- 403: "I know who you are, but you can't do this" (authorization)

**404 vs 403:**
- 404: Resource doesn't exist (or you're hiding it)
- 403: Resource exists but you can't access it
- Use 404 to hide existence for security-sensitive resources

## Error Code Design

### Naming Conventions

```
PREFIX_CATEGORY_SPECIFIC

Examples:
- AUTH_TOKEN_EXPIRED
- AUTH_INVALID_CREDENTIALS
- VALIDATION_FIELD_REQUIRED
- VALIDATION_FORMAT_INVALID
- RESOURCE_NOT_FOUND
- RESOURCE_ALREADY_EXISTS
- PAYMENT_CARD_DECLINED
- PAYMENT_INSUFFICIENT_FUNDS
```

### Code Hierarchy

```
General → Specific

NOT_FOUND                    (general)
USER_NOT_FOUND              (resource-specific)
USER_PROFILE_NOT_FOUND      (too specific - avoid)

VALIDATION_ERROR            (general)
VALIDATION_FIELD_REQUIRED   (type-specific)
```

### Code Documentation

```yaml
# error-codes.yaml
codes:
  - code: AUTH_TOKEN_EXPIRED
    status: 401
    title: Authentication Token Expired
    description: The provided authentication token has expired
    resolution: Request a new token using the refresh token or re-authenticate
    documentation: https://api.example.com/docs/errors#AUTH_TOKEN_EXPIRED

  - code: VALIDATION_FIELD_REQUIRED
    status: 400
    title: Required Field Missing
    description: A required field was not provided in the request
    resolution: Include all required fields as documented
    documentation: https://api.example.com/docs/errors#VALIDATION_FIELD_REQUIRED
```

## Validation Error Patterns

### Single Field Error

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email must be a valid email address",
    "field": "email",
    "received": "not-an-email"
  }
}
```

### Multiple Field Errors

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "errors": [
      {
        "field": "email",
        "code": "FORMAT_INVALID",
        "message": "Must be a valid email address"
      },
      {
        "field": "age",
        "code": "OUT_OF_RANGE",
        "message": "Must be between 0 and 150",
        "received": -5
      }
    ]
  }
}
```

### Nested Object Errors

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "errors": [
      {
        "path": "address.zipCode",
        "code": "FORMAT_INVALID",
        "message": "Must be a valid ZIP code"
      },
      {
        "path": "contacts[0].email",
        "code": "FORMAT_INVALID",
        "message": "Must be a valid email address"
      }
    ]
  }
}
```

## Error Headers

### Standard Headers

```
X-Request-ID: abc-123           # Correlation ID
X-RateLimit-Limit: 100          # Rate limit ceiling
X-RateLimit-Remaining: 0        # Remaining requests
X-RateLimit-Reset: 1640000000   # Reset timestamp
Retry-After: 60                 # Seconds to wait (429, 503)
```

### Custom Error Headers

```
X-Error-Code: VALIDATION_ERROR
X-Error-Documentation: https://api.example.com/docs/errors
```

## Rate Limiting Errors

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests",
    "details": {
      "limit": 100,
      "remaining": 0,
      "reset_at": "2024-01-15T12:00:00Z",
      "retry_after_seconds": 60
    }
  }
}
```

## Authentication Errors

### Invalid Credentials

```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "The email or password is incorrect"
  }
}
```

Note: Don't reveal which field is wrong for security.

### Token Expired

```json
{
  "error": {
    "code": "TOKEN_EXPIRED",
    "message": "Your session has expired",
    "details": {
      "expired_at": "2024-01-15T10:00:00Z"
    }
  }
}
```

## Business Logic Errors

### Resource Conflict

```json
{
  "error": {
    "code": "DUPLICATE_RESOURCE",
    "message": "A user with this email already exists",
    "details": {
      "conflicting_field": "email"
    }
  }
}
```

### State Transition Error

```json
{
  "error": {
    "code": "INVALID_STATE_TRANSITION",
    "message": "Order cannot be cancelled",
    "details": {
      "current_state": "shipped",
      "requested_state": "cancelled",
      "allowed_transitions": ["delivered", "returned"]
    }
  }
}
```

## Internal Server Errors

**Never expose internal details to clients:**

```json
// BAD - exposes internals
{
  "error": {
    "message": "NullPointerException at UserService.java:123",
    "stack_trace": "..."
  }
}

// GOOD - safe for client
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "abc-123"
  }
}
```

## Error Localization

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",        // Default/fallback
    "localized_message": "Fehler bei der Validierung",  // Based on Accept-Language
    "errors": [
      {
        "field": "email",
        "message": "Invalid format",
        "localized_message": "Ungültiges Format"
      }
    ]
  }
}
```

---

**See SKILL.md for complete error handling guidance**
