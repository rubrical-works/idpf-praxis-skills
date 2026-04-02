# Test Parsing Guide
**Version:** v0.5.0

**Purpose:** Detailed rules for extracting requirements from test files

---

## Overview

Tests are the richest source for requirement extraction because they explicitly describe expected behaviors. This guide covers parsing patterns for major test frameworks.

---

## Python (pytest)

### File Patterns
- `test_*.py`
- `*_test.py`
- `tests/*.py`

### Function Naming Convention

```python
def test_<feature>_<action>_<condition>():
    """
    <Description of expected behavior>
    """
```

**Extraction:**
- Feature: First segment after `test_`
- Action: Middle segments
- Condition: Final segment (often indicates edge case)
- Description: Docstring content

### Example Extraction

```python
def test_user_registration_with_valid_email():
    """User should be able to register with a valid email address"""
    user = register_user("test@example.com", "password123")
    assert user.id is not None
    assert user.email == "test@example.com"
```

**Extracted:**
```
Feature: User Registration
Behavior: Registration with valid email
Description: User should be able to register with a valid email address
Acceptance Criteria:
  - User ID is assigned after registration
  - Email is stored correctly
```

### Fixtures as Context

```python
@pytest.fixture
def authenticated_user():
    """Logged in user with active session"""
    return create_user_and_login()

def test_profile_update_requires_authentication(authenticated_user):
    # → Implies: Feature requires authentication
```

### Parametrized Tests

```python
@pytest.mark.parametrize("email,valid", [
    ("user@example.com", True),
    ("invalid-email", False),
    ("", False),
])
def test_email_validation(email, valid):
    # → AC: Multiple email formats tested
    # → Edge cases: empty, invalid format
```

---

## JavaScript/TypeScript (Jest)

### File Patterns
- `*.test.js`, `*.test.ts`
- `*.spec.js`, `*.spec.ts`
- `__tests__/*.js`

### Block Structure

```javascript
describe('Feature Name', () => {
  describe('sub-feature or context', () => {
    it('should [behavior]', () => {
      // test implementation
    });

    it('should [another behavior]', () => {
      // test implementation
    });
  });
});
```

**Extraction:**
- Outer `describe`: Feature name
- Inner `describe`: Context/scenario
- `it`/`test`: Specific behaviors → Acceptance Criteria

### Example Extraction

```javascript
describe('Shopping Cart', () => {
  describe('adding items', () => {
    it('should add item to empty cart', () => {
      const cart = new Cart();
      cart.add(product);
      expect(cart.items).toHaveLength(1);
    });

    it('should update quantity for existing item', () => {
      const cart = new Cart([product]);
      cart.add(product);
      expect(cart.items[0].quantity).toBe(2);
    });
  });

  describe('removing items', () => {
    it('should remove item from cart', () => {
      // ...
    });
  });
});
```

**Extracted:**
```
Feature: Shopping Cart

Sub-feature: Adding Items
  AC-1: Add item to empty cart
  AC-2: Update quantity for existing item

Sub-feature: Removing Items
  AC-1: Remove item from cart
```

### Async Tests

```javascript
it('should fetch user profile from API', async () => {
  const profile = await api.getProfile(userId);
  expect(profile).toBeDefined();
});
// → Indicates async operation, likely API integration
```

---

## Java (JUnit 5)

### File Patterns
- `*Test.java`
- `*Tests.java`
- `src/test/java/**/*.java`

### Annotation Patterns

```java
@DisplayName("User Registration")
class UserRegistrationTest {

    @Test
    @DisplayName("should register user with valid email")
    void registerWithValidEmail() {
        // test
    }

    @Test
    @DisplayName("should reject duplicate email")
    void rejectDuplicateEmail() {
        // test
    }
}
```

**Extraction:**
- Class `@DisplayName`: Feature name
- Method `@DisplayName`: Behavior/AC
- Method name: Fallback if no DisplayName

### Nested Tests

```java
@Nested
@DisplayName("when user is authenticated")
class WhenAuthenticated {

    @Test
    @DisplayName("can update profile")
    void canUpdateProfile() { }

    @Test
    @DisplayName("can change password")
    void canChangePassword() { }
}
```

**Extracted:**
```
Feature: [Parent class name]
Context: When user is authenticated
  AC-1: Can update profile
  AC-2: Can change password
```

### Tags for Categorization

```java
@Tag("security")
@Test
void passwordMustBeHashed() { }
// → Categorize as Security requirement
```

---

## Ruby (RSpec)

### File Patterns
- `*_spec.rb`
- `spec/**/*_spec.rb`

### Block Structure

```ruby
RSpec.describe UserRegistration do
  describe '#register' do
    context 'with valid email' do
      it 'creates a new user' do
        # test
      end

      it 'sends confirmation email' do
        # test
      end
    end

    context 'with invalid email' do
      it 'returns validation error' do
        # test
      end
    end
  end
end
```

**Extraction:**
- `describe` (class/module): Feature
- `describe` (method): Operation
- `context`: Scenario/condition
- `it`: Specific behavior

### Shared Examples

```ruby
RSpec.shared_examples 'requires authentication' do
  it 'returns 401 when not authenticated' do
    # ...
  end
end

RSpec.describe AdminController do
  include_examples 'requires authentication'
end
# → AdminController requires authentication
```

### Metadata Tags

```ruby
it 'processes payment', :slow, :integration do
  # → Tagged as slow, integration test
  # → Indicates external dependency
end
```

---

## Go (testing)

### File Patterns
- `*_test.go`

### Function Naming

```go
func TestUserRegistration(t *testing.T) {
    // Feature: User Registration
}

func TestUserRegistration_WithValidEmail(t *testing.T) {
    // Feature: User Registration
    // Context: With valid email
}
```

### Table-Driven Tests

```go
func TestEmailValidation(t *testing.T) {
    tests := []struct {
        name  string
        email string
        valid bool
    }{
        {"valid email", "user@example.com", true},
        {"missing @", "userexample.com", false},
        {"empty", "", false},
    }
    // → Multiple scenarios extracted
}
```

### Subtests

```go
func TestCart(t *testing.T) {
    t.Run("add item", func(t *testing.T) {
        // AC: Add item
    })
    t.Run("remove item", func(t *testing.T) {
        // AC: Remove item
    })
}
```

---

## C# (xUnit/NUnit)

### xUnit Patterns

```csharp
public class UserRegistrationTests
{
    [Fact]
    public void Should_Register_User_With_Valid_Email()
    {
        // test
    }

    [Theory]
    [InlineData("valid@email.com", true)]
    [InlineData("invalid", false)]
    public void Should_Validate_Email_Format(string email, bool expected)
    {
        // test
    }
}
```

### NUnit Patterns

```csharp
[TestFixture]
public class UserRegistrationTests
{
    [Test]
    public void RegisterUser_WithValidEmail_CreatesUser()
    {
        // test
    }

    [TestCase("valid@email.com", ExpectedResult = true)]
    [TestCase("invalid", ExpectedResult = false)]
    public bool ValidateEmail_ReturnsCorrectResult(string email)
    {
        // test
    }
}
```

---

## Extraction Priority

| Source | Priority | Confidence |
|--------|----------|------------|
| Test description (`it`, `@DisplayName`) | High | High |
| Test function name | Medium | High |
| Docstring/comment | Medium | Medium |
| Assertion content | Low | Medium |
| Fixture/setup | Low | Low |

---

## Edge Cases to Capture

1. **Error scenarios** - Tests with `throws`, `rejects`, `raises`
2. **Boundary conditions** - Parametrized with edge values
3. **Empty/null handling** - Tests with empty inputs
4. **Authorization** - Tests checking roles/permissions
5. **Async behavior** - Tests with async/await patterns

---

**End of Guide**
