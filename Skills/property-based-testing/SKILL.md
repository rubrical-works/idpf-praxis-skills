---
name: property-based-testing
description: Guide developers through property-based testing including property definition, shrinking, and framework-specific implementation
type: educational
version: "1.0.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-03-17"
license: Complete terms in LICENSE.txt
category: testing
relevantTechStack: [fast-check, hypothesis, property-testing, javascript, python]
copyright: "Rubrical Works (c) 2026"
---

# Property-Based Testing

This Skill guides developers through property-based testing (PBT), a testing approach where you define properties that should hold for all inputs, and the framework generates test cases automatically.

## When to Use This Skill

Invoke this Skill when:
- Writing tests for functions with many possible inputs
- Testing mathematical or algorithmic properties
- Finding edge cases traditional testing might miss
- Verifying serialization/deserialization roundtrips
- Testing parsers or data transformations

## What is Property-Based Testing?

### Traditional Testing vs Property-Based Testing

**Traditional (example-based):**
```
Test: add(2, 3) should equal 5
Test: add(-1, 1) should equal 0
Test: add(0, 0) should equal 0
```

**Property-based:**
```
Property: For all integers a and b,
          add(a, b) should equal add(b, a)  [commutative]
          add(a, 0) should equal a           [identity]
```

### Key Concepts

**Property:** An assertion that should hold for all valid inputs.

**Generator:** Creates random test inputs.

**Shrinking:** When a test fails, finds the minimal failing case.

**Counterexample:** A specific input that violates the property.

## Property Definition Patterns

### Common Property Types

**Roundtrip/Inverse:**
```
For all x: decode(encode(x)) == x
For all x: deserialize(serialize(x)) == x
For all x: uncompress(compress(x)) == x
```

**Idempotence:**
```
For all x: f(f(x)) == f(x)
For all x: sort(sort(list)) == sort(list)
For all x: absolute(absolute(x)) == absolute(x)
```

**Commutativity:**
```
For all a, b: f(a, b) == f(b, a)
For all a, b: add(a, b) == add(b, a)
For all a, b: union(a, b) == union(b, a)
```

**Associativity:**
```
For all a, b, c: f(f(a, b), c) == f(a, f(b, c))
For all a, b, c: (a + b) + c == a + (b + c)
```

**Identity:**
```
For all x: f(x, identity) == x
For all x: add(x, 0) == x
For all list: concat(list, []) == list
```

**Invariant:**
```
For all operations: invariant(state) remains true
For all inserts: len(list) increases by 1
For all valid inputs: output is within expected range
```

**Comparison to Reference:**
```
For all x: new_implementation(x) == reference_implementation(x)
For all x: optimized(x) == naive(x)
```

### Writing Good Properties

**Describe what, not how:**
```
GOOD: "sorting preserves length"
GOOD: "sorted output is in ascending order"
GOOD: "sorted output contains same elements"

BAD: "first pass puts smallest element first"
```

**Make properties specific:**
```
GOOD: For all lists, len(reverse(list)) == len(list)
BAD:  For all lists, reverse works correctly
```

**Combine multiple properties:**
```
Properties of sort(list):
1. len(sort(list)) == len(list)           [preserves length]
2. is_sorted(sort(list)) == true          [ordering]
3. multiset(sort(list)) == multiset(list) [same elements]
```

## Generators

### Built-in Generators

Most frameworks provide generators for:
- Integers (with ranges)
- Floats
- Strings (various alphabets)
- Booleans
- Lists/arrays
- Dictionaries/maps
- Optional/nullable values

### Custom Generators

**Constrained values:**
```
# Only positive integers
positive_int = integers(min_value=1)

# Valid email pattern
email = from_regex(r'[a-z]+@[a-z]+\.[a-z]{2,3}')

# Bounded list size
small_list = lists(integers(), min_size=0, max_size=10)
```

**Composite generators:**
```
# Generate a valid user object
user = builds(
    User,
    name=text(min_size=1, max_size=50),
    age=integers(min_value=0, max_value=150),
    email=emails()
)
```

**Dependent generators:**
```
# Generate a list and a valid index into it
list_and_index = lists(integers(), min_size=1).flatmap(
    lambda lst: tuples(just(lst), integers(0, len(lst)-1))
)
```

### Generator Best Practices

1. **Start simple** - Use built-in generators first
2. **Add constraints gradually** - Only constrain what's necessary
3. **Cover edge cases** - Include boundaries and special values
4. **Match domain** - Generate realistic data for your domain

## Shrinking

### What is Shrinking?

When a test fails, the framework tries to find a simpler input that still fails.

**Example:**
```
Original failing input: [43, -91, 7, 0, -15, 28, -3, 99]
After shrinking:        [0, -1]
```

### How Shrinking Works

1. Test fails with input X
2. Framework generates simpler versions of X
3. Each simpler version is tested
4. Process repeats until no simpler failing input found
5. Returns minimal failing case

### Shrinking Strategies

**For integers:** Try 0, then values closer to 0
**For strings:** Try empty string, then shorter strings
**For lists:** Try empty list, then smaller lists, then simpler elements
**For composite:** Shrink each component independently

### Analyzing Shrunk Counterexamples

When you get a minimal failing case:

1. **Understand why it fails** - The minimal case reveals the bug
2. **Add as regression test** - Keep the counterexample as an example test
3. **Fix the bug** - Use the counterexample to guide the fix
4. **Verify the fix** - Re-run property test to confirm

## Integration with Test Suites

### Recommended Approach

1. **Start with example tests** - Cover known important cases
2. **Add property tests** - For additional coverage
3. **Keep both** - They serve different purposes

### Test Organization

```
tests/
├── unit/
│   ├── test_sort.py          # Example-based tests
│   └── test_sort_properties.py  # Property-based tests
└── integration/
    └── ...
```

### When to Use Each

**Example tests:**
- Known edge cases
- Specific bug reproductions
- Documentation of expected behavior
- Fast, deterministic checks

**Property tests:**
- General invariants
- Random edge case discovery
- Mathematical properties
- Serialization roundtrips

## Framework-Specific Guidance

### Python (Hypothesis)

```python
from hypothesis import given, strategies as st

@given(st.lists(st.integers()))
def test_sort_preserves_length(lst):
    assert len(sorted(lst)) == len(lst)

@given(st.integers(), st.integers())
def test_addition_commutative(a, b):
    assert a + b == b + a
```

### JavaScript (fast-check)

```javascript
const fc = require('fast-check');

test('sort preserves length', () => {
  fc.assert(
    fc.property(fc.array(fc.integer()), (arr) => {
      return arr.sort().length === arr.length;
    })
  );
});
```

### Haskell (QuickCheck)

```haskell
prop_sort_preserves_length :: [Int] -> Bool
prop_sort_preserves_length xs = length (sort xs) == length xs

prop_addition_commutative :: Int -> Int -> Bool
prop_addition_commutative a b = a + b == b + a
```

### Other Frameworks

| Language | Framework | Notes |
|----------|-----------|-------|
| Python | Hypothesis | Most popular, excellent shrinking |
| JavaScript | fast-check | Good performance, TypeScript support |
| Java | jqwik | JUnit 5 integration |
| Scala | ScalaCheck | Inspired by QuickCheck |
| Rust | proptest | Good Rust integration |
| Go | gopter | Based on ScalaCheck |
| Erlang | PropEr | For concurrent systems |

## Common Pitfalls

### Pitfall 1: Overly Constrained Generators

```
BAD: Only test with lists of exactly 5 elements
GOOD: Test with lists of varying sizes including empty
```

### Pitfall 2: Testing Implementation Details

```
BAD: sort(list)[0] == min(list)  # Tests implementation
GOOD: is_sorted(sort(list))       # Tests property
```

### Pitfall 3: Non-Deterministic Properties

```
BAD: current_time() < current_time()  # Race condition
GOOD: Use deterministic properties
```

### Pitfall 4: Slow Generators

```
BAD: Generate huge inputs every time
GOOD: Size inputs appropriately, use max_examples setting
```

### Pitfall 5: Ignoring Counterexamples

```
BAD: @seed(12345)  # Hide the problem
GOOD: Fix the bug, add counterexample as regression test
```

## Debugging Failed Properties

### Steps When Property Fails

1. **Read the counterexample** - Understand the failing input
2. **Reproduce manually** - Run with the exact counterexample
3. **Simplify if needed** - Try even simpler inputs
4. **Add debug logging** - Trace execution with counterexample
5. **Fix the bug** - Use insights to fix
6. **Add regression test** - Keep counterexample as example test

### Example Debug Session

```
FAILED: test_sort_preserves_elements
Counterexample: [1, 1, 2]

# Debug:
input = [1, 1, 2]
output = sort(input)  # Returns [1, 2] - lost a duplicate!

# Bug found: sort was using set() internally
```

## Resources

See `resources/` directory for:
- `property-patterns.md` - Additional property patterns
- `shrinking-guide.md` - Detailed shrinking explanation
- `framework-examples.md` - Framework-specific code examples

## Relationship to Other Skills

**Complements:**
- `test-writing-patterns` - Example-based testing patterns
- `mutation-testing` - Test suite quality assessment
- `tdd-red-phase` - Writing failing tests first

**Independent from:**
- Beginner skills - This skill assumes testing experience

## Expected Outcome

After using this skill:
- Property-based testing concepts understood
- Properties defined for key functions
- Generators configured appropriately
- Counterexamples analyzed and bugs fixed
- Property tests integrated with existing test suite

---

**End of Property-Based Testing Skill**
