# Error Hierarchy Patterns
**Version:** v0.4.0

Design patterns for structuring application errors.

## Pattern 1: Domain-Based Hierarchy

Organize errors by business domain.

```
AppError
├── UserError
│   ├── UserNotFoundError
│   ├── DuplicateUserError
│   └── InvalidUserDataError
├── OrderError
│   ├── OrderNotFoundError
│   ├── OrderExpiredError
│   └── InsufficientInventoryError
├── PaymentError
│   ├── PaymentDeclinedError
│   ├── InvalidPaymentMethodError
│   └── PaymentTimeoutError
└── SystemError
    ├── DatabaseError
    └── ExternalServiceError
```

**When to use:**
- Large applications with distinct domains
- Microservices (one hierarchy per service)
- Domain-driven design projects

**Implementation:**
```python
# domain/user/errors.py
class UserError(AppError):
    """Base class for user domain errors."""
    pass

class UserNotFoundError(UserError):
    def __init__(self, user_id):
        super().__init__(
            message=f'User {user_id} not found',
            code='USER_NOT_FOUND',
            details={'user_id': user_id}
        )

class DuplicateUserError(UserError):
    def __init__(self, email):
        super().__init__(
            message=f'User with email {email} already exists',
            code='DUPLICATE_USER',
            details={'email': email}
        )
```

## Pattern 2: HTTP-Based Hierarchy

Organize errors by HTTP status code category.

```
AppError
├── ClientError (4xx)
│   ├── BadRequestError (400)
│   ├── UnauthorizedError (401)
│   ├── ForbiddenError (403)
│   ├── NotFoundError (404)
│   └── ConflictError (409)
├── ServerError (5xx)
│   ├── InternalError (500)
│   ├── BadGatewayError (502)
│   └── ServiceUnavailableError (503)
```

**When to use:**
- API-first applications
- RESTful services
- Simple CRUD applications

**Implementation:**
```python
class ClientError(AppError):
    """4xx errors - client's fault."""
    status_code = 400

class ServerError(AppError):
    """5xx errors - server's fault."""
    status_code = 500

class BadRequestError(ClientError):
    status_code = 400

    def __init__(self, message, details=None):
        super().__init__(
            message=message,
            code='BAD_REQUEST',
            details=details
        )

class NotFoundError(ClientError):
    status_code = 404

    def __init__(self, resource_type, resource_id):
        super().__init__(
            message=f'{resource_type} not found',
            code='NOT_FOUND',
            details={'resource_type': resource_type, 'resource_id': resource_id}
        )
```

## Pattern 3: Layer-Based Hierarchy

Organize errors by application layer.

```
AppError
├── PresentationError
│   ├── InvalidRequestError
│   └── ResponseFormattingError
├── ApplicationError
│   ├── ValidationError
│   ├── AuthorizationError
│   └── BusinessRuleError
├── DomainError
│   ├── EntityNotFoundError
│   ├── InvariantViolationError
│   └── DomainRuleError
└── InfrastructureError
    ├── DatabaseError
    ├── CacheError
    └── ExternalAPIError
```

**When to use:**
- Clean architecture projects
- Hexagonal architecture
- Large enterprise applications

**Implementation:**
```python
# application/errors.py
class ApplicationError(AppError):
    """Application layer errors."""
    pass

class ValidationError(ApplicationError):
    def __init__(self, field, message, constraint=None):
        super().__init__(
            message=message,
            code='VALIDATION_ERROR',
            details={'field': field, 'constraint': constraint}
        )

# domain/errors.py
class DomainError(AppError):
    """Domain layer errors."""
    pass

class EntityNotFoundError(DomainError):
    def __init__(self, entity_type, entity_id):
        super().__init__(
            message=f'{entity_type} not found',
            code='ENTITY_NOT_FOUND',
            details={'entity_type': entity_type, 'entity_id': entity_id}
        )
```

## Pattern 4: Severity-Based Hierarchy

Organize by error severity and required action.

```
AppError
├── RecoverableError
│   ├── RetryableError
│   │   ├── TransientError
│   │   └── RateLimitError
│   └── UserCorrectableError
│       ├── ValidationError
│       └── AuthenticationError
└── NonRecoverableError
    ├── ConfigurationError
    ├── CriticalError
    └── DataCorruptionError
```

**When to use:**
- Systems with retry logic
- Error recovery automation
- Monitoring-focused applications

**Implementation:**
```python
class RecoverableError(AppError):
    """Error that can be recovered from."""
    recoverable = True

class NonRecoverableError(AppError):
    """Error that requires manual intervention."""
    recoverable = False

class RetryableError(RecoverableError):
    """Error that may succeed on retry."""
    retryable = True
    max_retries = 3
    retry_delay = 1.0  # seconds

class TransientError(RetryableError):
    """Temporary failure, likely to succeed on retry."""

    def __init__(self, message, service=None):
        super().__init__(
            message=message,
            code='TRANSIENT_ERROR',
            details={'service': service}
        )
```

## Mixing Patterns

Combine patterns for complex applications:

```python
# Combine domain and severity
class PaymentDeclinedError(PaymentError, UserCorrectableError):
    """Payment was declined. User can retry with different payment method."""

    def __init__(self, reason):
        super().__init__(
            message=f'Payment declined: {reason}',
            code='PAYMENT_DECLINED',
            details={'reason': reason}
        )

    def get_user_action(self):
        return "Please try a different payment method or contact your bank."
```

## Error Metadata

Add metadata for cross-cutting concerns:

```python
class AppError(Exception):
    # Error identification
    code: str
    message: str

    # Severity/handling hints
    severity: str = 'error'  # debug, info, warning, error, critical
    retryable: bool = False
    recoverable: bool = True

    # Logging/monitoring
    should_alert: bool = False
    alert_channel: str = None

    # User experience
    user_message: str = None
    action_required: str = None

    # HTTP mapping (for APIs)
    status_code: int = 500

    # Documentation
    documentation_url: str = None
```

## Factory Pattern

Use factories for complex error creation:

```python
class ErrorFactory:
    @staticmethod
    def validation_error(field, message, value=None):
        return ValidationError(
            message=f"Validation failed for {field}: {message}",
            code='VALIDATION_ERROR',
            details={
                'field': field,
                'message': message,
                'value': value
            }
        )

    @staticmethod
    def not_found(resource_type, resource_id, suggestions=None):
        return NotFoundError(
            message=f"{resource_type} with id {resource_id} not found",
            code='NOT_FOUND',
            details={
                'resource_type': resource_type,
                'resource_id': resource_id,
                'suggestions': suggestions or []
            }
        )

# Usage
raise ErrorFactory.validation_error('email', 'must be a valid email', 'not-an-email')
```

## Anti-Patterns to Avoid

### 1. Flat Hierarchy

```python
# Bad - no structure
class MyAppValidationError(Exception): pass
class MyAppNotFoundError(Exception): pass
class MyAppDatabaseError(Exception): pass
# ... many more with no relationship
```

### 2. Too Deep Hierarchy

```python
# Bad - too many levels
AppError
└── DomainError
    └── UserDomainError
        └── UserValidationError
            └── UserEmailValidationError
                └── UserEmailFormatValidationError  # Too specific!
```

### 3. Catching Base Exception

```python
# Bad - too broad
try:
    do_something()
except Exception:  # Catches everything including system errors
    pass

# Good - catch specific errors
try:
    do_something()
except AppError as e:  # Only catch application errors
    handle_error(e)
```

---

**See SKILL.md for complete error handling guidance**
