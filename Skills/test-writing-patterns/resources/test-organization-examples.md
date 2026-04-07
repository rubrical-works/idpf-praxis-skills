# Test Organization Examples
**Version:** v0.11.1

Practical examples of test file and suite organization for different project types.

## Principle: Mirror Production Structure

```
Production:                    Tests:
  src/                           tests/
    services/                      services/
      user_service                   test_user_service
      order_service                  test_order_service
    utils/                         utils/
      validator                      test_validator
      formatter                      test_formatter
    models/                        models/
      user                           test_user
      order                          test_order
```

---

## Organization by Test Type

### Standard Layout

```
tests/
  unit/              # Fast, isolated tests (~80% of tests)
    services/
    utils/
    models/
  integration/       # Tests with real dependencies (~15%)
    api/
    database/
  e2e/               # Full workflow tests (~5%)
    user_journeys/
    critical_paths/
  fixtures/          # Shared test data
    users.json
    orders.json
  helpers/           # Shared test utilities
    factory.js
    assertions.js
```

**Benefits:**
- Clear separation by test speed
- CI can run unit tests first, integration later
- Easy to identify test gaps by type

### When to Use

- Projects with clear dependency boundaries
- Teams that want fast feedback (run unit tests locally, integration in CI)
- Projects with significant external dependencies

---

## Organization by Feature

### Standard Layout

```
tests/
  user_management/
    test_registration.py
    test_authentication.py
    test_profile.py
  order_processing/
    test_cart.py
    test_checkout.py
    test_payment.py
  reporting/
    test_generate_report.py
    test_export.py
```

**Benefits:**
- Easy to find all tests for a feature
- Natural alignment with user stories
- Good for feature teams

### When to Use

- Feature-focused teams
- Domain-driven designs
- When features cut across multiple layers

---

## Organization by Convention (Language-Specific)

### Python (pytest)

```
project/
  src/
    myapp/
      services/
        user_service.py
      models/
        user.py
  tests/
    conftest.py          # Shared fixtures
    test_user_service.py
    test_user.py
  pyproject.toml         # Test config
```

**Conventions:**
- `test_` prefix on test files and functions
- `conftest.py` for shared fixtures
- `pytest.ini` or `pyproject.toml` for configuration

### JavaScript (Jest/Vitest)

```
project/
  src/
    services/
      userService.js
      userService.test.js    # Co-located
    models/
      user.js
      user.test.js
  __tests__/                  # Or centralized
    integration/
      api.test.js
```

**Conventions:**
- `.test.js` or `.spec.js` suffix
- Co-located tests (next to source) for unit tests
- `__tests__/` directory for integration/e2e
- `jest.config.js` for configuration

### Ruby (RSpec)

```
project/
  app/
    models/
      user.rb
    controllers/
      users_controller.rb
  spec/
    models/
      user_spec.rb
    controllers/
      users_controller_spec.rb
    support/
      helpers.rb
    spec_helper.rb
```

**Conventions:**
- `_spec.rb` suffix
- Mirror `app/` structure in `spec/`
- `spec_helper.rb` for configuration
- `support/` for shared helpers

---

## Naming Conventions

### Test File Naming

| Pattern | Example | When |
|---------|---------|------|
| `test_[module]` | `test_user_service.py` | Python (pytest) |
| `[module].test.js` | `userService.test.js` | JavaScript (Jest) |
| `[module]_spec.rb` | `user_service_spec.rb` | Ruby (RSpec) |
| `[Module]Test.java` | `UserServiceTest.java` | Java (JUnit) |

### Test Function Naming

**Pattern:** `test_[unit]_[scenario]_[expected]`

```
test_create_user_with_valid_data_returns_user
test_create_user_with_missing_email_raises_error
test_create_user_when_duplicate_returns_conflict
test_delete_user_as_admin_succeeds
test_delete_user_as_guest_raises_forbidden
```

### Test Suite/Describe Naming

```
describe "UserService":
  describe "create_user":
    it "returns user with valid data"
    it "raises error with missing email"
    it "returns conflict when duplicate"

  describe "delete_user":
    it "succeeds for admin"
    it "raises forbidden for guest"
```

---

## Fixtures and Test Data

### Fixture Organization

```
tests/
  fixtures/
    users/
      valid_user.json
      admin_user.json
      invalid_user.json
    orders/
      pending_order.json
      completed_order.json
```

### Factory Pattern

```
// test_factories.js
function createUser(overrides = {}):
    return {
        id: 1,
        name: "Test User",
        email: "test@example.com",
        role: "member",
        ...overrides
    }

// Usage in tests
user = createUser({role: "admin"})
```

---

## CI Integration

### Test Execution Order

```yaml
# Run fastest tests first for fast feedback
steps:
  - name: Unit tests
    run: test --type unit          # ~seconds
  - name: Integration tests
    run: test --type integration   # ~minutes
  - name: E2E tests
    run: test --type e2e           # ~minutes
```

### Coverage Reporting

```
tests/
  .coveragerc          # Python coverage config
  jest.config.js       # Jest coverage config
  coverage/            # Generated reports (gitignored)
```

---

**Consistency within a project matters more than which convention you choose**
