# Framework Examples
**Version:** v0.5.0

Concrete examples for popular property-based testing frameworks.

## Python - Hypothesis

### Installation

```bash
pip install hypothesis
```

### Basic Example

```python
from hypothesis import given, strategies as st

@given(st.integers(), st.integers())
def test_addition_commutative(a, b):
    assert a + b == b + a

@given(st.lists(st.integers()))
def test_sort_idempotent(xs):
    assert sorted(sorted(xs)) == sorted(xs)
```

### Custom Strategies

```python
from hypothesis import strategies as st

# Email strategy
emails = st.from_regex(r'[a-z]+@[a-z]+\.[a-z]{2,3}', fullmatch=True)

# User strategy using builds
from dataclasses import dataclass

@dataclass
class User:
    name: str
    age: int
    email: str

users = st.builds(
    User,
    name=st.text(min_size=1, max_size=50),
    age=st.integers(min_value=0, max_value=150),
    email=emails
)

@given(users)
def test_user_serialization(user):
    assert User.from_json(user.to_json()) == user
```

### Settings and Configuration

```python
from hypothesis import given, settings, Verbosity

@given(st.lists(st.integers()))
@settings(
    max_examples=500,
    verbosity=Verbosity.verbose,
    deadline=None  # Disable slow test detection
)
def test_with_many_examples(xs):
    assert my_property(xs)
```

### Stateful Testing

```python
from hypothesis.stateful import RuleBasedStateMachine, rule, invariant

class DatabaseStateMachine(RuleBasedStateMachine):
    def __init__(self):
        super().__init__()
        self.db = Database()
        self.expected_keys = set()

    @rule(key=st.text(), value=st.integers())
    def insert(self, key, value):
        self.db.insert(key, value)
        self.expected_keys.add(key)

    @rule(key=st.text())
    def delete(self, key):
        self.db.delete(key)
        self.expected_keys.discard(key)

    @invariant()
    def keys_match(self):
        assert set(self.db.keys()) == self.expected_keys

TestDatabase = DatabaseStateMachine.TestCase
```

## JavaScript - fast-check

### Installation

```bash
npm install fast-check
```

### Basic Example

```javascript
const fc = require('fast-check');

test('addition is commutative', () => {
  fc.assert(
    fc.property(fc.integer(), fc.integer(), (a, b) => {
      return a + b === b + a;
    })
  );
});

test('sort is idempotent', () => {
  fc.assert(
    fc.property(fc.array(fc.integer()), (arr) => {
      const sorted1 = [...arr].sort((a, b) => a - b);
      const sorted2 = [...sorted1].sort((a, b) => a - b);
      return JSON.stringify(sorted1) === JSON.stringify(sorted2);
    })
  );
});
```

### Custom Arbitraries

```javascript
const fc = require('fast-check');

// Email arbitrary
const emailArb = fc.tuple(
  fc.stringOf(fc.char().filter(c => /[a-z]/.test(c)), { minLength: 1 }),
  fc.stringOf(fc.char().filter(c => /[a-z]/.test(c)), { minLength: 1 }),
  fc.constantFrom('com', 'org', 'net')
).map(([user, domain, tld]) => `${user}@${domain}.${tld}`);

// User arbitrary
const userArb = fc.record({
  name: fc.string({ minLength: 1, maxLength: 50 }),
  age: fc.integer({ min: 0, max: 150 }),
  email: emailArb
});

test('user serialization roundtrip', () => {
  fc.assert(
    fc.property(userArb, (user) => {
      return deepEqual(User.fromJSON(user.toJSON()), user);
    })
  );
});
```

### Async Properties

```javascript
test('async operations', async () => {
  await fc.assert(
    fc.asyncProperty(fc.string(), async (input) => {
      const result = await asyncFunction(input);
      return result !== undefined;
    })
  );
});
```

### Model-Based Testing

```javascript
const fc = require('fast-check');

// Commands for model-based testing
class InsertCommand {
  constructor(key, value) {
    this.key = key;
    this.value = value;
  }
  check(model) { return true; }
  run(model, real) {
    model.set(this.key, this.value);
    real.insert(this.key, this.value);
  }
}

class DeleteCommand {
  constructor(key) { this.key = key; }
  check(model) { return model.has(this.key); }
  run(model, real) {
    model.delete(this.key);
    real.delete(this.key);
  }
}

test('database model', () => {
  fc.assert(
    fc.property(
      fc.commands([
        fc.tuple(fc.string(), fc.integer()).map(([k, v]) => new InsertCommand(k, v)),
        fc.string().map(k => new DeleteCommand(k))
      ]),
      (cmds) => {
        const model = new Map();
        const real = new Database();
        fc.modelRun(() => ({ model, real }), cmds);
      }
    )
  );
});
```

## Java - jqwik

### Dependency (Maven)

```xml
<dependency>
    <groupId>net.jqwik</groupId>
    <artifactId>jqwik</artifactId>
    <version>1.8.0</version>
    <scope>test</scope>
</dependency>
```

### Basic Example

```java
import net.jqwik.api.*;

class MathProperties {
    @Property
    boolean additionCommutative(@ForAll int a, @ForAll int b) {
        return a + b == b + a;
    }

    @Property
    boolean sortIdempotent(@ForAll List<Integer> list) {
        List<Integer> sorted1 = new ArrayList<>(list);
        Collections.sort(sorted1);
        List<Integer> sorted2 = new ArrayList<>(sorted1);
        Collections.sort(sorted2);
        return sorted1.equals(sorted2);
    }
}
```

### Custom Arbitraries

```java
import net.jqwik.api.*;

class UserProperties {
    @Provide
    Arbitrary<String> emails() {
        return Arbitraries.strings()
            .alpha()
            .ofMinLength(1)
            .ofMaxLength(10)
            .flatMap(user ->
                Arbitraries.strings()
                    .alpha()
                    .ofMinLength(1)
                    .ofMaxLength(10)
                    .map(domain -> user + "@" + domain + ".com")
            );
    }

    @Property
    boolean emailRoundtrip(@ForAll("emails") String email) {
        return Email.parse(email).toString().equals(email);
    }
}
```

## Rust - proptest

### Dependency (Cargo.toml)

```toml
[dev-dependencies]
proptest = "1.0"
```

### Basic Example

```rust
use proptest::prelude::*;

proptest! {
    #[test]
    fn addition_commutative(a: i32, b: i32) {
        prop_assert_eq!(a.wrapping_add(b), b.wrapping_add(a));
    }

    #[test]
    fn sort_idempotent(mut vec: Vec<i32>) {
        vec.sort();
        let first = vec.clone();
        vec.sort();
        prop_assert_eq!(first, vec);
    }
}
```

### Custom Strategies

```rust
use proptest::prelude::*;

#[derive(Debug, Clone)]
struct User {
    name: String,
    age: u8,
}

fn user_strategy() -> impl Strategy<Value = User> {
    (
        "[a-z]{1,20}",  // name regex
        0u8..150,       // age range
    ).prop_map(|(name, age)| User { name, age })
}

proptest! {
    #[test]
    fn user_serialization(user in user_strategy()) {
        let json = serde_json::to_string(&user).unwrap();
        let parsed: User = serde_json::from_str(&json).unwrap();
        prop_assert_eq!(user.name, parsed.name);
        prop_assert_eq!(user.age, parsed.age);
    }
}
```

## Go - gopter

### Installation

```bash
go get github.com/leanovate/gopter
```

### Basic Example

```go
package main

import (
    "testing"
    "github.com/leanovate/gopter"
    "github.com/leanovate/gopter/gen"
    "github.com/leanovate/gopter/prop"
)

func TestAdditionCommutative(t *testing.T) {
    properties := gopter.NewProperties(nil)

    properties.Property("addition is commutative", prop.ForAll(
        func(a, b int) bool {
            return a+b == b+a
        },
        gen.Int(),
        gen.Int(),
    ))

    properties.TestingRun(t)
}
```

## Summary: Framework Comparison

| Feature | Hypothesis | fast-check | jqwik | proptest |
|---------|------------|------------|-------|----------|
| Language | Python | JavaScript | Java | Rust |
| Shrinking | Excellent | Good | Good | Good |
| Stateful | Yes | Yes | Yes | Limited |
| Async | Limited | Yes | Yes | Yes |
| Documentation | Excellent | Good | Good | Good |

---

**See SKILL.md for complete property-based testing guidance**
