# Test Structure Patterns
**Version:** v0.12.3
Patterns for organizing and structuring tests in the RED phase of TDD.
## Arrange-Act-Assert (AAA)
```python
def test_user_creation():
    # Arrange - Set up test data and conditions
    email = "test@example.com"
    name = "Test User"
    # Act - Execute the code being tested
    user = create_user(email, name)
    # Assert - Verify the expected outcome
    assert user.email == email
    assert user.name == name
```
**Guidelines:**
- **Arrange:** Minimal setup needed for this specific test
- **Act:** Single action being tested (usually one line)
- **Assert:** Clear verification of expected behavior
## Given-When-Then (GWT)
BDD-style structure that reads like a specification.
```python
def test_authenticated_user_can_view_profile():
    # Given - Preconditions
    user = create_authenticated_user()
    # When - Action taken
    response = view_profile(user)
    # Then - Expected outcome
    assert response.status == 200
    assert response.data["name"] == user.name
```
| Given | -> | Arrange |
| When | -> | Act |
| Then | -> | Assert |
## Test Naming Conventions
### Pattern: `test_[unit]_[scenario]_[expected]`
```python
# Good names
test_user_with_invalid_email_raises_error
test_cart_with_items_calculates_total
test_login_with_wrong_password_fails
# Bad names
test_user()
test_1()
test_it_works()
```
| Do | Don't |
|----|-------|
| Describe the behavior | Use generic names |
| Include the condition | Use numbers/abbreviations |
| State expected outcome | Say "test" in the name |
| Be specific | Be vague |
## Test File Organization
### One Test Class Per Unit
```
tests/
├── test_user.py
├── test_order.py
├── test_payment.py
└── test_api_users.py
```
### Group by Feature
```
tests/
├── authentication/
│   ├── test_login.py
│   ├── test_logout.py
│   └── test_registration.py
├── orders/
│   ├── test_create_order.py
│   └── test_cancel_order.py
```
## Test Suite Structure
```python
class TestUserCreation:
    """Tests for user creation functionality"""
    def test_creates_user_with_valid_data(self):
        ...
    def test_raises_error_with_invalid_email(self):
        ...
    def test_raises_error_with_duplicate_email(self):
        ...

class TestUserAuthentication:
    """Tests for user authentication"""
    def test_authenticates_with_correct_password(self):
        ...
    def test_fails_with_wrong_password(self):
        ...
```
**Grouping:** Related tests together, one concept per test class, shared setup in fixtures/setUp.
## Quick Reference
| Pattern | Use When |
|---------|----------|
| AAA | Default choice, most tests |
| GWT | BDD, business-focused tests |
| One class per unit | Unit tests |
| Group by feature | Integration/E2E tests |
**Test Name Formula:** `test_[what]_[condition]_[result]`
**File Name Formula:** `test_[module_or_feature].py`
