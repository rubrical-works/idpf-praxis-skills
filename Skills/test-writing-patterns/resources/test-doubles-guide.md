# Test Doubles Guide
**Version:** v0.14.0

When to use each type of test double, with selection criteria and usage examples.

## Quick Selection Guide

```
Need to control response?       → Stub
Need to verify call made?       → Mock
Need working but simple version? → Fake
Need real behavior + verification? → Spy
```

---

## Stub

**Purpose:** Provide predetermined responses to calls

**When to use:**
- Need to control dependency behavior
- Isolate unit under test
- Avoid external dependencies (APIs, databases, file systems)

**Characteristics:**
- Returns fixed values
- No behavior verification
- Simplest test double

**Example (conceptual):**
```
// Stub database to return specific user
stub_database.when_called_with(user_id=1).returns({name: "Alice"})

// Stub API to return fixed response
stub_api.when_called_with(url="/status").returns({status: 200})

// Stub file system to return test data
stub_fs.when_read("config.json").returns('{"debug": true}')
```

**Common mistake:** Over-stubbing — if you stub most of the class, reconsider your design.

---

## Mock

**Purpose:** Verify interactions/calls were made correctly

**When to use:**
- Need to verify method was called
- Check call parameters
- Verify call count or order

**Characteristics:**
- Records calls made to it
- Can verify expectations after test
- Used for behavior verification

**Example (conceptual):**
```
// Mock logger to verify error logged
mock_logger = create_mock()
service.process(invalid_data)
mock_logger.verify_called_with("error", "Invalid data")

// Mock email service to verify send called
mock_email = create_mock()
registration.complete(user)
mock_email.verify_called_once_with(to=user.email, subject="Welcome")
```

**Common mistake:** Verifying too many interactions — test behavior, not implementation.

---

## Fake

**Purpose:** Working implementation (simplified)

**When to use:**
- Real implementation too slow or complex
- Need realistic behavior for integration tests
- Testing against a simplified but functional dependency

**Characteristics:**
- Functional implementation
- Simpler than production version
- Actually works (not just returns fixed values)

**Example (conceptual):**
```
// Fake in-memory database
fake_db = InMemoryDatabase()
fake_db.insert({id: 1, name: "Alice"})
result = fake_db.query({name: "Alice"})
assert result.id == 1

// Fake file system in memory
fake_fs = InMemoryFileSystem()
fake_fs.write("/tmp/test.txt", "content")
assert fake_fs.read("/tmp/test.txt") == "content"

// Fake message queue
fake_queue = InMemoryQueue()
fake_queue.publish("test-event", {data: 1})
msg = fake_queue.consume()
assert msg.data == 1
```

**Common mistake:** Making fakes too complex — if the fake is as complex as the real thing, use the real thing.

---

## Spy

**Purpose:** Record information about calls while delegating to real object

**When to use:**
- Need real behavior plus verification
- Want to observe interactions without changing behavior
- Partial mocking scenarios

**Characteristics:**
- Wraps real object
- Records calls
- Delegates to real implementation

**Example (conceptual):**
```
// Spy on cache to verify hits/misses
spy_cache = spy_on(real_cache)
service.get_user(1)  // cache miss, fetches from DB
service.get_user(1)  // cache hit
assert spy_cache.call_count("get") == 2
assert spy_cache.call_count("set") == 1

// Spy on validator to track what was validated
spy_validator = spy_on(real_validator)
service.create_order(order_data)
assert spy_validator.was_called_with(order_data)
```

**Common mistake:** Using spies when stubs would suffice — spies add complexity.

---

## Decision Matrix

| Scenario | Best Double | Reason |
|----------|-------------|--------|
| Database in unit test | Stub or Fake | Control data, avoid real DB |
| Verifying email sent | Mock | Need to verify interaction |
| Testing with simplified DB | Fake | Need working behavior |
| Logging behavior | Spy | Keep real logging + verify |
| External API | Stub | Control responses |
| Event publisher | Mock | Verify events emitted |
| Cache layer | Spy or Fake | Observe behavior or simplify |
| File system | Stub or Fake | Avoid real file operations |

---

## Anti-Patterns

### Over-Mocking
**Symptom:** Test has more mock setup than assertions
**Fix:** Simplify dependencies, consider integration test instead

### Testing Implementation
**Symptom:** Test breaks when refactoring without behavior change
**Fix:** Verify outcomes, not method calls

### Mocking Value Objects
**Symptom:** Mocking simple data objects
**Fix:** Use real value objects — they have no external dependencies

### Complex Stub Chains
**Symptom:** `stub.returns(stub.returns(stub.returns(...)))`
**Fix:** Extract into a fake with real behavior

---

**Use the simplest double that satisfies the test requirement**
