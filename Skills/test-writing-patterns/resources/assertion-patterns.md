# Assertion Patterns
**Version:** v0.8.0

Common assertion patterns organized by scenario, with guidance on writing clear, specific assertions.

## Core Principles

1. **One concept per test** — related assertions about the same concept are fine
2. **Specific over generic** — `assert result == 5` over `assert result is not null`
3. **Meaningful failure messages** — include context that helps diagnose failures
4. **Test behavior, not implementation** — assert on observable outcomes

---

## Assertion Patterns by Scenario

### Value Equality

```
// Direct equality
assert result == expected_value

// Approximate equality (floating point)
assert abs(result - expected) < tolerance

// String equality (case-insensitive)
assert result.lower() == expected.lower()
```

### Truthiness and Existence

```
// Boolean checks
assert condition is true
assert condition is false

// Null/nil checks
assert result is not null
assert result is null

// Emptiness
assert collection is empty
assert string is not empty
```

### Collection Assertions

```
// Membership
assert item in collection
assert item not in collection

// Size
assert len(collection) == expected_count
assert collection is not empty

// Ordering
assert collection == [1, 2, 3]  // ordered equality
assert set(collection) == set(expected)  // unordered equality

// Subset
assert all(item in collection for item in required_items)
```

### Exception and Error Assertions

```
// Expected exception raised
assert_raises(ExpectedError):
    function_that_should_fail()

// Exception with specific message
assert_raises(ValueError, message="Invalid input"):
    validate(bad_data)

// No exception raised
result = function_that_should_succeed()  // no assertion needed, failure = exception
```

### Object State Assertions

```
// Property verification
assert user.name == "Alice"
assert user.is_active == true
assert user.created_at is not null

// Multiple related properties (same concept)
assert order.status == "completed"
assert order.total == 99.99
assert order.items_count == 3
```

### API Response Assertions

```
// Status code
assert response.status == 200
assert response.status == 404

// Response body
assert response.json()["name"] == "Alice"
assert response.json()["items"] is list

// Headers
assert response.headers["content-type"] == "application/json"
```

### Side Effect Assertions

```
// Database state changed
assert db.count("users") == initial_count + 1

// File created
assert file_exists("/tmp/output.txt")
assert file_content("/tmp/output.txt") == expected

// Mock interaction
mock.verify_called_once()
mock.verify_called_with(expected_args)
mock.verify_not_called()
```

---

## Anti-Patterns

### Assert True (Useless)

**Bad:**
```
assert True  // Always passes, tests nothing
assert result  // Too vague — what is result?
```

**Good:**
```
assert result == expected_value
assert result.is_valid() == true
```

### Assert Everything

**Bad:**
```
test_user_creation:
    assert user.name == "Alice"
    assert user.email == "alice@test.com"
    assert user.id > 0
    assert user.created_at < now()
    assert user.updated_at == user.created_at
    assert user.role == "member"
    assert user.preferences == default_preferences
    // Testing too many unrelated properties
```

**Good:** Split into focused tests or assert only the properties relevant to the specific behavior being tested.

### Magic Numbers

**Bad:**
```
assert result == 42  // Why 42?
```

**Good:**
```
expected_total = item_price * quantity
assert result == expected_total  // Clear derivation
```

### Assertion Without Message

**Bad:**
```
assert response.status == 200
// Failure: "AssertionError" — unhelpful
```

**Good:**
```
assert response.status == 200, "Expected OK but got {response.status}: {response.body}"
// Failure: "Expected OK but got 403: Access denied" — actionable
```

---

## Framework-Specific Assertion Styles

| Framework | Equality | Exception | Approximate |
|-----------|----------|-----------|-------------|
| pytest | `assert a == b` | `with pytest.raises(E)` | `assert a == pytest.approx(b)` |
| Jest | `expect(a).toBe(b)` | `expect(fn).toThrow(E)` | `expect(a).toBeCloseTo(b)` |
| JUnit | `assertEquals(a, b)` | `assertThrows(E, fn)` | `assertEquals(a, b, delta)` |
| RSpec | `expect(a).to eq(b)` | `expect{fn}.to raise_error(E)` | `expect(a).to be_within(d).of(b)` |
| Node assert | `assert.equal(a, b)` | `assert.throws(fn, E)` | manual |

---

**Write assertions that read like specifications**
