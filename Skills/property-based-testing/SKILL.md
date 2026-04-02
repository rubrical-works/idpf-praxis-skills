---
name: property-based-testing
description: Guide developers through property-based testing including property definition, shrinking, and framework-specific implementation
type: invokable
version: "1.0.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-03-17"
license: Complete terms in LICENSE.txt
category: testing
relevantTechStack: [fast-check, hypothesis, property-testing, javascript, python]
copyright: "Rubrical Works (c) 2026"
---
# Property-Based Testing
Define properties that should hold for all inputs; the framework generates test cases automatically.
## When to Use
- Writing tests for functions with many possible inputs
- Testing mathematical or algorithmic properties
- Finding edge cases traditional testing might miss
- Verifying serialization/deserialization roundtrips
- Testing parsers or data transformations
## Key Concepts
- **Property:** Assertion that should hold for all valid inputs
- **Generator:** Creates random test inputs
- **Shrinking:** When a test fails, finds the minimal failing case
- **Counterexample:** A specific input that violates the property
## Property Definition Patterns
### Common Property Types
**Roundtrip/Inverse:**
```
For all x: decode(encode(x)) == x
For all x: deserialize(serialize(x)) == x
```
**Idempotence:**
```
For all x: f(f(x)) == f(x)
For all x: sort(sort(list)) == sort(list)
```
**Commutativity:**
```
For all a, b: f(a, b) == f(b, a)
```
**Associativity:**
```
For all a, b, c: f(f(a, b), c) == f(a, f(b, c))
```
**Identity:**
```
For all x: f(x, identity) == x
```
**Invariant:**
```
For all operations: invariant(state) remains true
For all inserts: len(list) increases by 1
```
**Comparison to Reference:**
```
For all x: new_implementation(x) == reference_implementation(x)
```
### Writing Good Properties
- **Describe what, not how** — "sorting preserves length" not "first pass puts smallest element first"
- **Make properties specific** — `len(reverse(list)) == len(list)` not "reverse works correctly"
- **Combine multiple properties** for full coverage:
  1. `len(sort(list)) == len(list)` [preserves length]
  2. `is_sorted(sort(list)) == true` [ordering]
  3. `multiset(sort(list)) == multiset(list)` [same elements]
## Generators
### Built-in Generators
Most frameworks provide: integers, floats, strings, booleans, lists/arrays, dictionaries/maps, optional/nullable values.
### Custom Generators
```
positive_int = integers(min_value=1)
email = from_regex(r'[a-z]+@[a-z]+\.[a-z]{2,3}')
small_list = lists(integers(), min_size=0, max_size=10)
```
**Composite generators:**
```
user = builds(User, name=text(min_size=1, max_size=50), age=integers(0, 150), email=emails())
```
**Dependent generators:**
```
list_and_index = lists(integers(), min_size=1).flatmap(
    lambda lst: tuples(just(lst), integers(0, len(lst)-1))
)
```
### Generator Best Practices
1. Start simple — use built-in generators first
2. Add constraints gradually — only constrain what's necessary
3. Cover edge cases — include boundaries and special values
4. Match domain — generate realistic data
## Shrinking
When a test fails, the framework finds a simpler input that still fails.
```
Original failing input: [43, -91, 7, 0, -15, 28, -3, 99]
After shrinking:        [0, -1]
```
**Strategies:** Integers try 0 then closer to 0. Strings try empty then shorter. Lists try empty then smaller then simpler elements. Composite shrinks each component independently.
**Analyzing shrunk counterexamples:**
1. Understand why it fails — the minimal case reveals the bug
2. Add as regression test
3. Fix the bug using the counterexample
4. Re-run property test to confirm
## Integration with Test Suites
1. Start with example tests for known important cases
2. Add property tests for additional coverage
3. Keep both — they serve different purposes
**Example tests for:** known edge cases, bug reproductions, documentation, fast deterministic checks.
**Property tests for:** general invariants, random edge case discovery, mathematical properties, serialization roundtrips.
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
1. **Overly constrained generators** — test with varying sizes including empty, not fixed sizes
2. **Testing implementation details** — test properties (`is_sorted(sort(list))`) not implementation
3. **Non-deterministic properties** — use deterministic properties only
4. **Slow generators** — size inputs appropriately, use `max_examples` setting
5. **Ignoring counterexamples** — fix the bug, don't seed around it
## Debugging Failed Properties
1. Read the counterexample
2. Reproduce manually with the exact counterexample
3. Simplify if needed
4. Add debug logging
5. Fix the bug
6. Add regression test with the counterexample
## Resources
- `resources/property-patterns.md` — Additional property patterns
- `resources/shrinking-guide.md` — Detailed shrinking explanation
- `resources/framework-examples.md` — Framework-specific code examples
## Related Skills
- `test-writing-patterns` — Example-based testing patterns
- `mutation-testing` — Test suite quality assessment
- `tdd-red-phase` — Writing failing tests first
