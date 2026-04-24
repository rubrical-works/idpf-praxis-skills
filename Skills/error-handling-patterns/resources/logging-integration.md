# Logging Integration
**Version:** v0.14.0

Integrating error handling with logging and monitoring systems.

## Structured Logging

### Log Format

```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "level": "error",
  "logger": "api.handlers",
  "message": "Request failed",
  "error": {
    "type": "ValidationError",
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format"
  },
  "request": {
    "id": "req-abc-123",
    "method": "POST",
    "path": "/api/users",
    "duration_ms": 45
  },
  "user": {
    "id": "user-456",
    "ip": "192.168.1.1"
  },
  "trace_id": "trace-xyz-789"
}
```

### Python Implementation

```python
import logging
import json
from datetime import datetime

class StructuredLogger:
    def __init__(self, name):
        self.logger = logging.getLogger(name)

    def _format_log(self, level, message, **kwargs):
        log_entry = {
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'level': level,
            'logger': self.logger.name,
            'message': message,
            **kwargs
        }
        return json.dumps(log_entry)

    def error(self, message, error=None, request=None, **kwargs):
        log_data = {}

        if error:
            log_data['error'] = {
                'type': type(error).__name__,
                'code': getattr(error, 'code', 'UNKNOWN'),
                'message': str(error)
            }

        if request:
            log_data['request'] = {
                'id': getattr(request, 'id', None),
                'method': request.method,
                'path': request.path
            }

        self.logger.error(self._format_log('error', message, **log_data, **kwargs))

# Usage
logger = StructuredLogger('api.handlers')
logger.error('Request failed', error=e, request=request)
```

### JavaScript Implementation

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console()
  ]
});

function logError(message, { error, request, ...extra } = {}) {
  const logData = {
    message,
    ...extra
  };

  if (error) {
    logData.error = {
      type: error.constructor.name,
      code: error.code || 'UNKNOWN',
      message: error.message,
      stack: error.stack
    };
  }

  if (request) {
    logData.request = {
      id: request.id,
      method: request.method,
      path: request.path
    };
  }

  logger.error(logData);
}

// Usage
logError('Request failed', { error: e, request: req });
```

## Log Levels by Error Type

| Error Type | Log Level | Alert? |
|------------|-----------|--------|
| ValidationError | warn | No |
| NotFoundError | info | No |
| AuthenticationError | warn | Monitor rate |
| AuthorizationError | warn | Monitor rate |
| BusinessError | warn | Depends |
| RateLimitError | warn | Monitor |
| ExternalServiceError | error | Yes |
| InternalError | error | Yes |
| CriticalError | critical | Immediate |

### Implementation

```python
def get_log_level(error):
    """Determine appropriate log level for error."""
    if isinstance(error, (ValidationError, NotFoundError)):
        return 'warning'
    if isinstance(error, (AuthenticationError, BusinessError)):
        return 'warning'
    if isinstance(error, ExternalServiceError):
        return 'error'
    if isinstance(error, CriticalError):
        return 'critical'
    return 'error'

def should_alert(error):
    """Determine if error should trigger alert."""
    return isinstance(error, (ExternalServiceError, CriticalError, DataCorruptionError))
```

## Sensitive Data Handling

### What to Redact

```python
SENSITIVE_FIELDS = {
    'password', 'token', 'api_key', 'secret',
    'credit_card', 'ssn', 'auth_header',
    'authorization', 'cookie'
}

def redact_sensitive(data, fields=SENSITIVE_FIELDS):
    """Redact sensitive fields from log data."""
    if isinstance(data, dict):
        return {
            k: '[REDACTED]' if k.lower() in fields else redact_sensitive(v)
            for k, v in data.items()
        }
    if isinstance(data, list):
        return [redact_sensitive(item) for item in data]
    return data

# Usage
log_data = redact_sensitive(request.json)
logger.info('Request received', data=log_data)
```

### Request Body Sanitization

```python
def sanitize_request_body(body, max_size=1000):
    """Sanitize request body for logging."""
    if body is None:
        return None

    # Redact sensitive fields
    sanitized = redact_sensitive(body)

    # Truncate large bodies
    serialized = json.dumps(sanitized)
    if len(serialized) > max_size:
        return {'_truncated': True, '_size': len(serialized)}

    return sanitized
```

## Correlation IDs

### Generating IDs

```python
import uuid

class RequestMiddleware:
    def __init__(self, app):
        self.app = app

    def __call__(self, environ, start_response):
        # Get or generate request ID
        request_id = environ.get('HTTP_X_REQUEST_ID') or str(uuid.uuid4())
        environ['REQUEST_ID'] = request_id

        # Get or generate trace ID
        trace_id = environ.get('HTTP_X_TRACE_ID') or str(uuid.uuid4())
        environ['TRACE_ID'] = trace_id

        return self.app(environ, start_response)
```

### Propagating IDs

```python
# Include in all log messages
logger.info('Processing request', extra={
    'request_id': request.id,
    'trace_id': request.trace_id
})

# Include in error responses
{
    "error": {
        "code": "INTERNAL_ERROR",
        "message": "An error occurred",
        "request_id": "req-abc-123",
        "trace_id": "trace-xyz-789"
    }
}

# Include in outgoing requests
requests.get(
    'https://other-service.com/api',
    headers={
        'X-Request-ID': request.id,
        'X-Trace-ID': request.trace_id
    }
)
```

## Monitoring Integration

### Metrics to Track

```python
from prometheus_client import Counter, Histogram

# Error counters
error_counter = Counter(
    'app_errors_total',
    'Total errors',
    ['error_type', 'error_code', 'endpoint']
)

# Error latency
error_latency = Histogram(
    'app_error_latency_seconds',
    'Time from request start to error',
    ['error_type']
)

def track_error(error, request, duration):
    error_counter.labels(
        error_type=type(error).__name__,
        error_code=getattr(error, 'code', 'UNKNOWN'),
        endpoint=request.path
    ).inc()

    error_latency.labels(
        error_type=type(error).__name__
    ).observe(duration)
```

### Alert Rules

```yaml
# Prometheus alert rules
groups:
  - name: error_alerts
    rules:
      - alert: HighErrorRate
        expr: rate(app_errors_total[5m]) > 10
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: High error rate detected

      - alert: CriticalError
        expr: increase(app_errors_total{error_type="CriticalError"}[1m]) > 0
        labels:
          severity: critical
        annotations:
          summary: Critical error occurred

      - alert: ExternalServiceDown
        expr: rate(app_errors_total{error_type="ExternalServiceError"}[5m]) > 5
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: External service failures detected
```

## Error Aggregation

### Group Similar Errors

```python
def get_error_fingerprint(error, request=None):
    """Generate fingerprint for error aggregation."""
    components = [
        type(error).__name__,
        getattr(error, 'code', 'UNKNOWN'),
    ]

    if request:
        components.append(request.method)
        components.append(request.path)

    return hash(tuple(components))

# Sentry-style fingerprint
def sentry_fingerprint(error, request=None):
    return [
        type(error).__name__,
        getattr(error, 'code', 'UNKNOWN'),
        request.path if request else 'unknown'
    ]
```

### Error Tracking Services

```python
# Sentry integration
import sentry_sdk

def report_error(error, request=None, user=None):
    with sentry_sdk.push_scope() as scope:
        if request:
            scope.set_context('request', {
                'method': request.method,
                'path': request.path,
                'id': request.id
            })

        if user:
            scope.set_user({'id': user.id})

        scope.set_tag('error_code', getattr(error, 'code', 'UNKNOWN'))
        scope.set_level('error' if should_alert(error) else 'warning')

        sentry_sdk.capture_exception(error)
```

## Log Retention

### Retention Policies

| Log Type | Retention | Storage |
|----------|-----------|---------|
| Debug | 1 day | Hot |
| Info | 7 days | Hot |
| Warning | 30 days | Warm |
| Error | 90 days | Warm |
| Critical | 1 year | Cold |

### Implementation

```yaml
# Elasticsearch ILM policy
{
  "policy": {
    "phases": {
      "hot": {
        "actions": {
          "rollover": {
            "max_size": "50gb",
            "max_age": "1d"
          }
        }
      },
      "warm": {
        "min_age": "7d",
        "actions": {
          "forcemerge": { "max_num_segments": 1 }
        }
      },
      "delete": {
        "min_age": "90d",
        "actions": {
          "delete": {}
        }
      }
    }
  }
}
```

---

**See SKILL.md for complete error handling guidance**
