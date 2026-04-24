---
name: error-handling-patterns
description: Guide developers through consistent error handling including error hierarchies, API responses, and logging integration
version: "1.0.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-03-17"
license: Complete terms in LICENSE.txt
type: injector
category: code-quality
relevantTechStack: [javascript, typescript, python, go, rust, java, node, error-handling]
disable-model-invocation: true
user-invocable: false
defaultSkill: true
copyright: "Rubrical Works (c) 2026"
---

# Error Handling Patterns

This Skill guides developers through implementing consistent error handling across applications, including error hierarchy design, API error responses, and logging integration.

## When to Use This Skill

Invoke this Skill when:
- Designing error handling strategy for a new project
- Standardizing error responses in an API
- Implementing error logging and monitoring
- Creating user-facing error messages
- Refactoring inconsistent error handling

## Error Handling Philosophy

### Core Principles

1. **Fail fast:** Detect and report errors as early as possible
2. **Fail safely:** Errors should not corrupt data or leave systems in invalid states
3. **Be informative:** Error messages should help diagnose the problem
4. **Be actionable:** Tell users/developers what they can do about it
5. **Be consistent:** Use the same patterns throughout the application

### Error Audiences

Different audiences need different information:

**End users:**
- Clear, non-technical explanation
- What happened
- What they can do

**Developers (API consumers):**
- Error code for programmatic handling
- Technical description
- How to fix their request

**Operations (your team):**
- Stack traces
- Request context
- System state

## Error Hierarchy Design

### Base Error Class

```python
# Python example
class AppError(Exception):
    """Base class for application errors."""

    def __init__(self, message, code=None, details=None):
        super().__init__(message)
        self.message = message
        self.code = code or 'UNKNOWN_ERROR'
        self.details = details or {}

    def to_dict(self):
        return {
            'error': {
                'code': self.code,
                'message': self.message,
                'details': self.details
            }
        }
```

```javascript
// JavaScript example
class AppError extends Error {
  constructor(message, code = 'UNKNOWN_ERROR', details = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.details = details;
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        details: this.details
      }
    };
  }
}
```

### Error Categories

**Validation Errors:**
```python
class ValidationError(AppError):
    """Input validation failed."""

    def __init__(self, message, field=None, constraint=None):
        super().__init__(
            message,
            code='VALIDATION_ERROR',
            details={'field': field, 'constraint': constraint}
        )
```

**Not Found Errors:**
```python
class NotFoundError(AppError):
    """Requested resource not found."""

    def __init__(self, resource_type, resource_id):
        super().__init__(
            f'{resource_type} with id {resource_id} not found',
            code='NOT_FOUND',
            details={'resource_type': resource_type, 'resource_id': resource_id}
        )
```

**Authorization Errors:**
```python
class AuthorizationError(AppError):
    """User not authorized for this action."""

    def __init__(self, action, resource=None):
        super().__init__(
            f'Not authorized to {action}',
            code='UNAUTHORIZED',
            details={'action': action, 'resource': resource}
        )
```

**Business Logic Errors:**
```python
class BusinessError(AppError):
    """Business rule violation."""

    def __init__(self, message, rule=None):
        super().__init__(
            message,
            code='BUSINESS_RULE_VIOLATION',
            details={'rule': rule}
        )
```

**External Service Errors:**
```python
class ExternalServiceError(AppError):
    """External service failed."""

    def __init__(self, service, original_error=None):
        super().__init__(
            f'External service {service} failed',
            code='EXTERNAL_SERVICE_ERROR',
            details={'service': service, 'original': str(original_error)}
        )
```

### Error Hierarchy Structure

```
AppError
├── ValidationError
│   ├── InvalidFormatError
│   ├── MissingFieldError
│   └── OutOfRangeError
├── NotFoundError
│   ├── UserNotFoundError
│   └── ResourceNotFoundError
├── AuthorizationError
│   ├── AuthenticationError
│   └── PermissionDeniedError
├── BusinessError
│   ├── InsufficientFundsError
│   └── DuplicateEntryError
└── ExternalServiceError
    ├── DatabaseError
    └── ThirdPartyAPIError
```

## API Error Responses

### Standard Error Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": {
      "field": "email",
      "constraint": "must be a valid email address"
    },
    "request_id": "abc-123",
    "documentation_url": "https://api.example.com/docs/errors#VALIDATION_ERROR"
  }
}
```

### HTTP Status Code Mapping

| Error Type | HTTP Status | When to Use |
|------------|-------------|-------------|
| ValidationError | 400 Bad Request | Invalid input format |
| AuthenticationError | 401 Unauthorized | Invalid/missing credentials |
| AuthorizationError | 403 Forbidden | Valid credentials, no permission |
| NotFoundError | 404 Not Found | Resource doesn't exist |
| BusinessError | 409 Conflict | Business rule violation |
| RateLimitError | 429 Too Many Requests | Rate limit exceeded |
| InternalError | 500 Internal Server Error | Unexpected server error |
| ExternalServiceError | 502/503 | Downstream service failure |

### Error Response Examples

**Validation error (400):**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {
      "errors": [
        {"field": "email", "message": "Invalid email format"},
        {"field": "age", "message": "Must be a positive number"}
      ]
    }
  }
}
```

**Not found (404):**
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "User not found",
    "details": {
      "resource_type": "user",
      "resource_id": "123"
    }
  }
}
```

**Internal error (500):**
```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "abc-123"
  }
}
```

### Error Handler Implementation

```python
# Flask example
from flask import jsonify

@app.errorhandler(AppError)
def handle_app_error(error):
    response = jsonify(error.to_dict())
    response.status_code = get_status_code(error)
    return response

@app.errorhandler(Exception)
def handle_unexpected_error(error):
    # Log the full error for debugging
    app.logger.exception('Unexpected error')

    # Return safe response to client
    response = jsonify({
        'error': {
            'code': 'INTERNAL_ERROR',
            'message': 'An unexpected error occurred',
            'request_id': request.id
        }
    })
    response.status_code = 500
    return response
```

```javascript
// Express example
const errorHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(getStatusCode(err)).json(err.toJSON());
  }

  // Log unexpected errors
  console.error('Unexpected error:', err);

  // Return safe response
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      request_id: req.id
    }
  });
};

app.use(errorHandler);
```

## User-Facing vs Developer-Facing Errors

### User-Facing Messages

**Characteristics:**
- Non-technical language
- Actionable guidance
- No sensitive information
- Translated/localized

**Examples:**
```
GOOD: "We couldn't process your payment. Please check your card details and try again."
BAD:  "PaymentGateway threw InvalidCardException at line 234"

GOOD: "This email address is already registered. Try logging in instead."
BAD:  "Duplicate key violation on users.email"

GOOD: "Something went wrong. Please try again in a few minutes."
BAD:  "NullPointerException in UserService.getUserById()"
```

### Developer-Facing Messages

**Characteristics:**
- Technical and precise
- Include error codes
- Reference documentation
- Include request context

**Examples:**
```json
{
  "error": {
    "code": "INVALID_PARAMETER",
    "message": "The 'limit' parameter must be between 1 and 100",
    "parameter": "limit",
    "received_value": 500,
    "documentation_url": "https://api.example.com/docs/pagination"
  }
}
```

### Message Strategy

```python
class UserFacingError(AppError):
    """Error with user-friendly message."""

    def __init__(self, user_message, technical_message, code, details=None):
        super().__init__(technical_message, code, details)
        self.user_message = user_message

    def to_user_dict(self):
        return {
            'error': {
                'message': self.user_message
            }
        }

    def to_developer_dict(self):
        return {
            'error': {
                'code': self.code,
                'message': self.message,
                'details': self.details
            }
        }
```

## Logging Integration

### What to Log

**Always log:**
- Error type/code
- Timestamp
- Request ID/correlation ID
- User ID (if authenticated)
- Error message
- Stack trace (for unexpected errors)

**Context to include:**
- Request method and path
- Request body (sanitized)
- Response status
- Duration

### What NOT to Log

**Never log:**
- Passwords
- API keys/tokens
- Credit card numbers
- Full social security numbers
- Other PII without consent

### Logging Pattern

```python
import logging
import json

class ErrorLogger:
    def __init__(self, logger):
        self.logger = logger

    def log_error(self, error, request=None):
        log_data = {
            'error_type': type(error).__name__,
            'error_code': getattr(error, 'code', 'UNKNOWN'),
            'error_message': str(error),
            'timestamp': datetime.utcnow().isoformat()
        }

        if request:
            log_data['request'] = {
                'method': request.method,
                'path': request.path,
                'request_id': request.id,
                'user_id': getattr(request, 'user_id', None)
            }

        if isinstance(error, AppError):
            self.logger.warning(json.dumps(log_data))
        else:
            log_data['stack_trace'] = traceback.format_exc()
            self.logger.error(json.dumps(log_data))
```

### Structured Logging

```json
{
  "level": "error",
  "timestamp": "2024-01-15T10:30:00Z",
  "request_id": "abc-123",
  "error": {
    "type": "ValidationError",
    "code": "INVALID_EMAIL",
    "message": "Invalid email format"
  },
  "request": {
    "method": "POST",
    "path": "/api/users",
    "user_id": null
  },
  "duration_ms": 45
}
```

## Error Recovery Patterns

> **See also:** The `resilience-patterns` skill covers retry, circuit breaker, fallback, bulkhead, and timeout patterns in detail with multi-language examples. This section covers the relationship between error handling and resilience.

Error handling and resilience are complementary:
- **Error handling** defines *what* errors look like and how they're reported
- **Resilience** defines *what to do* when errors occur at system boundaries

Use the error hierarchy from this skill to define error types, then apply resilience patterns from `resilience-patterns` at integration points (API calls, database connections, external services).

### Go Error Handling

```go
// Go uses explicit error returns instead of exceptions
func getUser(id string) (*User, error) {
    user, err := db.FindUser(id)
    if err != nil {
        if errors.Is(err, sql.ErrNoRows) {
            return nil, &NotFoundError{Resource: "user", ID: id}
        }
        return nil, fmt.Errorf("getUser: %w", err)
    }
    return user, nil
}
```

### Rust Error Handling

```rust
// Rust uses Result<T, E> and the ? operator
fn get_user(id: &str) -> Result<User, AppError> {
    let user = db::find_user(id)
        .map_err(|e| AppError::Database(e))?;
    Ok(user)
}

#[derive(Debug, thiserror::Error)]
enum AppError {
    #[error("not found: {0}")]
    NotFound(String),
    #[error("database error: {0}")]
    Database(#[from] sqlx::Error),
    #[error("validation error: {0}")]
    Validation(String),
}
```

### Java Error Handling

```java
// Java uses checked and unchecked exceptions
public class AppException extends RuntimeException {
    private final String code;
    private final Map<String, Object> details;

    public AppException(String message, String code) {
        super(message);
        this.code = code;
        this.details = new HashMap<>();
    }
}

public class NotFoundException extends AppException {
    public NotFoundException(String resource, String id) {
        super(resource + " not found: " + id, "NOT_FOUND");
    }
}
```

## Testing Error Handling

### Unit Tests

```python
def test_validation_error_format():
    error = ValidationError('Invalid email', field='email')

    result = error.to_dict()

    assert result['error']['code'] == 'VALIDATION_ERROR'
    assert result['error']['details']['field'] == 'email'

def test_error_handler_returns_correct_status():
    with app.test_client() as client:
        response = client.get('/users/nonexistent')

        assert response.status_code == 404
        assert response.json['error']['code'] == 'NOT_FOUND'
```

### Integration Tests

```python
def test_error_logged_correctly(caplog):
    with app.test_client() as client:
        client.post('/api/users', json={'invalid': 'data'})

    assert 'VALIDATION_ERROR' in caplog.text
    assert 'request_id' in caplog.text
```

## Resources

See `resources/` directory for:
- `hierarchy-patterns.md` - Error hierarchy design patterns
- `api-errors.md` - API error response patterns
- `logging-integration.md` - Logging setup and integration

## Relationship to Other Skills

**Complements:**
- `resilience-patterns` - Retry, circuit breaker, fallback, bulkhead, timeout
- `api-versioning` - API design consistency
- `common-errors` - Specific error troubleshooting

**Independent from:**
- TDD skills - This skill focuses on error handling design

## Expected Outcome

After using this skill:
- Error hierarchy established
- Consistent API error responses
- Proper logging integration
- User-facing and developer-facing messages separated
- Error recovery patterns implemented

---

**End of Error Handling Patterns Skill**
