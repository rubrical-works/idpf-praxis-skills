# Testing Anti-Patterns
**Version:** v0.15.0

Issues in test code that reduce test effectiveness and maintainability.

---

## Flaky Tests

**Description:** Tests that pass or fail inconsistently without code changes.

**Symptoms:**
- "Just run it again" mentality
- Tests pass locally but fail in CI (or vice versa)
- Random test failures
- Team ignores failing tests

**Causes:**
- Race conditions
- Time-dependent logic
- External service dependencies
- Shared mutable state
- Order-dependent tests

**Example (Bad):**
```python
def test_user_created_recently():
    user = create_user()
    # Flaky: might fail if test runs at midnight
    assert user.created_at.date() == datetime.now().date()

def test_async_operation():
    start_async_task()
    # Flaky: race condition
    assert get_task_result() == 'completed'
```

**Refactoring:**
```python
def test_user_created_recently(frozen_time):
    with frozen_time('2024-01-15 10:00:00'):
        user = create_user()
        assert user.created_at == datetime(2024, 1, 15, 10, 0, 0)

async def test_async_operation():
    task = start_async_task()
    result = await task.wait_for_completion(timeout=5)
    assert result == 'completed'
```

**Severity:** Critical

---

## Test Interdependence

**Description:** Tests that depend on other tests running first.

**Symptoms:**
- Tests fail when run individually
- Tests fail when run in different order
- "Must run test A before test B"
- Setup happens in previous test

**Example (Bad):**
```python
class TestUserWorkflow:
    def test_1_create_user(self):
        self.user = create_user('test@example.com')
        assert self.user.id is not None

    def test_2_update_user(self):
        # Depends on test_1 running first
        self.user.name = 'Updated'
        save(self.user)
        assert self.user.name == 'Updated'

    def test_3_delete_user(self):
        # Depends on test_1 and test_2
        delete(self.user)
        assert not exists(self.user.id)
```

**Refactoring:**
```python
class TestUserWorkflow:
    def setup_method(self):
        self.user = create_user('test@example.com')

    def teardown_method(self):
        delete(self.user)

    def test_create_user(self):
        new_user = create_user('new@example.com')
        assert new_user.id is not None
        delete(new_user)

    def test_update_user(self):
        self.user.name = 'Updated'
        save(self.user)
        assert self.user.name == 'Updated'

    def test_delete_user(self):
        user_to_delete = create_user('delete@example.com')
        delete(user_to_delete)
        assert not exists(user_to_delete.id)
```

**Severity:** High

---

## Over-Mocking

**Description:** Mocking so much that the test doesn't test anything real.

**Symptoms:**
- More mock setup than actual test
- Mocking the thing you're testing
- Tests pass but production breaks
- "The mocks work perfectly"

**Example (Bad):**
```python
def test_order_service():
    mock_db = Mock()
    mock_validator = Mock()
    mock_calculator = Mock()
    mock_notifier = Mock()

    mock_db.save.return_value = True
    mock_validator.validate.return_value = True
    mock_calculator.calculate.return_value = 100
    mock_notifier.notify.return_value = True

    service = OrderService(mock_db, mock_validator, mock_calculator, mock_notifier)
    result = service.create_order(order_data)

    # What are we even testing? Just that mocks were called?
    assert mock_db.save.called
    assert mock_notifier.notify.called
```

**Refactoring:**
```python
def test_order_service_integration():
    # Use real database (test instance)
    db = TestDatabase()
    # Use real validator
    validator = OrderValidator()
    # Mock only external services
    notifier = Mock()

    service = OrderService(db, validator, PriceCalculator(), notifier)
    result = service.create_order(order_data)

    # Test real behavior
    saved_order = db.get(result.id)
    assert saved_order.total == expected_total
    assert saved_order.status == 'created'
```

**Severity:** High

---

## Testing Implementation Details

**Description:** Tests that break when implementation changes, even if behavior is correct.

**Symptoms:**
- Refactoring breaks tests
- Tests verify private methods
- Tests check internal state
- Tests assert on specific method calls

**Example (Bad):**
```javascript
test('user service stores data correctly', () => {
    const service = new UserService();
    service.createUser({ name: 'John' });

    // Testing implementation details
    expect(service._cache.has('John')).toBe(true);
    expect(service._internalCounter).toBe(1);
    expect(service._lastOperation).toBe('create');
});
```

**Refactoring:** Test behavior, not implementation
```javascript
test('created user can be retrieved', () => {
    const service = new UserService();
    const user = service.createUser({ name: 'John' });

    const retrieved = service.getUser(user.id);

    expect(retrieved.name).toBe('John');
});
```

**Severity:** Medium

---

## Slow Test Suite

**Description:** Tests that take too long to run, discouraging frequent execution.

**Symptoms:**
- Developers skip tests locally
- CI takes 30+ minutes
- "I'll run tests before pushing"
- Tests run only overnight

**Causes:**
- Too many E2E tests
- Real database for every test
- No parallelization
- Unnecessary waits/sleeps
- Starting servers for unit tests

**Refactoring:**
- Follow test pyramid (more unit, fewer E2E)
- Use in-memory database for tests
- Parallelize test execution
- Mock external services
- Use test containers

**Severity:** Medium

---

## Test Pollution

**Description:** Tests that leave behind state affecting other tests.

**Symptoms:**
- Tests pass in isolation, fail together
- Different results on second run
- "Works on my machine"
- Database has leftover test data

**Example (Bad):**
```python
def test_create_admin():
    # Creates user but never cleans up
    User.create(email='admin@test.com', role='admin')
    assert User.count_admins() == 1

def test_count_admins():
    # Fails if run after test_create_admin
    # because there's already an admin
    assert User.count_admins() == 0
```

**Refactoring:**
```python
@pytest.fixture(autouse=True)
def clean_database():
    yield
    User.delete_all()

def test_create_admin():
    User.create(email='admin@test.com', role='admin')
    assert User.count_admins() == 1
    # Cleanup happens automatically

def test_count_admins():
    # Starts with clean database
    assert User.count_admins() == 0
```

**Severity:** High

---

## Happy Path Only

**Description:** Tests that only cover the success scenario.

**Symptoms:**
- No error handling tests
- No edge case tests
- Bugs found in production
- High code coverage but poor quality

**Example (Bad):**
```python
def test_divide():
    assert divide(10, 2) == 5
    assert divide(100, 4) == 25
    # No test for divide by zero!
    # No test for non-numeric input!
```

**Refactoring:**
```python
def test_divide_success():
    assert divide(10, 2) == 5
    assert divide(100, 4) == 25

def test_divide_by_zero():
    with pytest.raises(ZeroDivisionError):
        divide(10, 0)

def test_divide_invalid_input():
    with pytest.raises(TypeError):
        divide("10", 2)

def test_divide_edge_cases():
    assert divide(0, 5) == 0
    assert divide(-10, 2) == -5
    assert divide(10, -2) == -5
```

**Severity:** Medium

---

## Ice Cream Cone

**Description:** Inverted test pyramid with more E2E tests than unit tests.

**Symptoms:**
- Slow test suite
- Flaky tests
- Difficult to debug failures
- High maintenance cost
- "All our tests are integration tests"

**Correct Test Pyramid:**
```
        /\
       /  \         E2E (few, slow, expensive)
      /----\
     /      \       Integration (some)
    /--------\
   /          \     Unit (many, fast, cheap)
  /------------\
```

**Ice Cream Cone (Bad):**
```
   ____________
  /            \    E2E (many, slow)
  \____________/
       ||           Integration (some)
       ||
       ||           Unit (few or none)
       \/
```

**Refactoring:**
- Add unit tests for business logic
- Move E2E tests to critical paths only
- Use integration tests for boundaries
- Mock external dependencies in unit tests

**Severity:** Medium

---

## Excessive Setup

**Description:** Tests with more setup code than actual test code.

**Symptoms:**
- 50 lines of setup, 2 lines of assertion
- Copy-pasted setup across tests
- Difficult to understand what's being tested
- Changes require updating many tests

**Example (Bad):**
```python
def test_user_can_checkout():
    # 40 lines of setup
    store = Store()
    store.name = "Test Store"
    store.address = "123 Main St"
    store.save()

    product1 = Product()
    product1.name = "Widget"
    product1.price = 10
    product1.store = store
    product1.save()

    # ... 30 more lines of setup

    # 2 lines of actual test
    result = checkout(cart)
    assert result.success
```

**Refactoring:** Use fixtures and factories
```python
@pytest.fixture
def store():
    return StoreFactory.create()

@pytest.fixture
def cart_with_items(store):
    return CartFactory.create(store=store, item_count=3)

def test_user_can_checkout(cart_with_items):
    result = checkout(cart_with_items)
    assert result.success
```

**Severity:** Medium

---

## Testing Trivial Code

**Description:** Tests for code that obviously works.

**Symptoms:**
- Tests for getters/setters
- Tests for simple constructors
- Tests for framework functionality
- Inflated coverage numbers

**Example (Bad):**
```python
def test_user_name_getter():
    user = User(name='John')
    assert user.name == 'John'

def test_user_name_setter():
    user = User(name='John')
    user.name = 'Jane'
    assert user.name == 'Jane'

def test_list_append():
    items = []
    items.append('a')
    assert 'a' in items
```

**Refactoring:** Focus on behavior, not trivial code
- Test business logic
- Test complex calculations
- Test edge cases
- Skip obvious getters/setters

**Severity:** Low

---

## Detection Checklist

- [ ] Tests fail randomly (Flaky)
- [ ] Tests must run in specific order (Interdependence)
- [ ] More mocks than real code (Over-Mocking)
- [ ] Refactoring breaks tests (Testing Implementation)
- [ ] Test suite takes >10 minutes (Slow)
- [ ] Different results on re-run (Pollution)
- [ ] Only success cases tested (Happy Path Only)
- [ ] More E2E than unit tests (Ice Cream Cone)
- [ ] Setup longer than assertions (Excessive Setup)
- [ ] Tests for getters/setters (Trivial Code)

---

**End of Testing Anti-Patterns**
