# Shrinking Guide
**Version:** v0.6.0

Understanding how property-based testing frameworks minimize failing inputs.

## What is Shrinking?

Shrinking is the process of finding the smallest input that still fails a property test.

### Example

```
Property: All lists have length < 100

Test run:
  Generated: [42, -17, 88, 0, -5, 33, 91, 12, ...]  (150 elements)
  Result: FAILED

Shrinking:
  Try: [42, -17, 88, 0, -5, 33, 91, 12, ...]  (100 elements) - FAILED
  Try: [42, -17, 88, 0, -5, ...]  (50 elements) - passed
  Try: [42, -17, 88, 0, -5, 33, 91, ...]  (75 elements) - passed
  ...continues binary search...
  Try: [0, 0, 0, ...]  (100 elements) - FAILED

Minimal counterexample: [0] * 100 (or similar 100-element list)
```

## Why Shrinking Matters

### Without Shrinking

```
FAILED: test_parser
Input: {"users":[{"id":472891,"name":"xK#m2!...","email":"..."},...]}
       (500 characters of complex JSON)

Developer: "What exactly causes the failure?" 😕
```

### With Shrinking

```
FAILED: test_parser
Minimal input: {"users":[{"id":0}]}

Developer: "Ah, it fails when id is 0!" 💡
```

## Shrinking Strategies

### Integer Shrinking

**Goal:** Find smallest integer that fails

**Strategy:**
1. Try 0
2. Try values closer to 0
3. Try halving the distance to 0

```
Original: 847
Shrink attempts: 0, 423, 211, 105, 52, 26, 13, 6, 3, 1
If test fails at 3: minimal counterexample is 3
```

### String Shrinking

**Goal:** Find shortest/simplest string that fails

**Strategy:**
1. Try empty string
2. Try removing characters
3. Try simplifying characters (e.g., all 'a')

```
Original: "Hello, World!"
Attempts: "", "H", "He", "Hello", "a", "aaa"
```

### List Shrinking

**Goal:** Find shortest list with simplest elements

**Strategy:**
1. Try empty list
2. Try removing elements from end
3. Try removing elements from middle
4. Try shrinking individual elements

```
Original: [99, -5, 42, 0, 17]
Attempts: [], [99], [99, -5], [0], [0, 0], [0, 1]
```

### Composite Shrinking

For complex types, shrink each component:

```python
# Original
User(name="Alice", age=30, active=True)

# Shrink attempts
User(name="", age=30, active=True)    # shrink name
User(name="Alice", age=0, active=True) # shrink age
User(name="", age=0, active=True)      # shrink both
User(name="a", age=0, active=False)    # simplify all
```

## Framework-Specific Shrinking

### Hypothesis (Python)

```python
from hypothesis import given, strategies as st, settings

@given(st.lists(st.integers()))
@settings(max_examples=1000)  # More examples = better shrinking
def test_my_property(xs):
    assert my_function(xs)

# Hypothesis automatically shrinks on failure
# Output shows minimal counterexample
```

**Shrinking settings:**
```python
@settings(
    database=None,  # Don't save examples
    suppress_health_check=[HealthCheck.too_slow]
)
```

### fast-check (JavaScript)

```javascript
fc.assert(
  fc.property(
    fc.array(fc.integer()),
    (arr) => myFunction(arr)
  ),
  { numRuns: 1000 }  // More runs for better shrinking
);
```

**Custom shrinker:**
```javascript
const customArbitrary = fc.integer().map(
  (n) => createMyObject(n),
  { shrink: (obj) => shrinkMyObject(obj) }
);
```

### QuickCheck (Haskell)

```haskell
-- Automatic shrinking for Arbitrary instances
instance Arbitrary MyType where
  arbitrary = ...
  shrink x = [...]  -- Define shrinking behavior
```

## Custom Shrinking

### When to Customize

- Domain-specific constraints
- Complex composite types
- Performance optimization
- Better minimal examples

### Custom Shrink Function Pattern

```python
def shrink_my_type(value):
    """Generate smaller versions of value."""
    # Yield simpler versions
    if value.size > 0:
        yield value.with_size(value.size - 1)
    if value.name != "":
        yield value.with_name("")
    if value.count > 0:
        yield value.with_count(0)
```

### Maintaining Invariants

Ensure shrunk values are still valid:

```python
def shrink_valid_user(user):
    """Only shrink to valid users."""
    for candidate in default_shrink(user):
        if is_valid_user(candidate):
            yield candidate
```

## Analyzing Shrunk Counterexamples

### Step-by-Step Process

1. **Read the counterexample carefully**
   ```
   Counterexample: [0, -1]
   ```

2. **Understand what it represents**
   ```
   A list with zero and negative one
   ```

3. **Identify the failure pattern**
   ```
   Test: all elements should be positive
   Bug: Zero is not positive
   ```

4. **Verify understanding**
   ```python
   # Reproduce manually
   result = my_function([0, -1])
   assert result  # Fails!
   ```

5. **Fix the code**
   ```python
   # Before: return all(x > 0 for x in xs)
   # After: return all(x >= 0 for x in xs)  # or fix the test
   ```

### Red Flags in Counterexamples

**Suspiciously simple:**
```
Counterexample: 0
Counterexample: []
Counterexample: ""
```
→ Often boundary conditions not handled

**Contains special values:**
```
Counterexample: [None]
Counterexample: {"key": NaN}
```
→ Missing null/special value handling

**Exact boundary values:**
```
Counterexample: 2147483647 (MAX_INT)
Counterexample: -2147483648 (MIN_INT)
```
→ Overflow or boundary issues

## Shrinking Best Practices

### 1. Don't Fight the Shrinker

```python
# Bad: Constraining too much prevents good shrinking
@given(st.integers(min_value=100, max_value=200))

# Better: Let it find edge cases
@given(st.integers())
```

### 2. Save Good Counterexamples

```python
# Hypothesis database keeps failing examples
@settings(database=DirectoryBasedExampleDatabase(".hypothesis"))

# Or manually save as regression test
def test_regression_issue_42():
    # Counterexample from property test
    assert my_function([0, -1]) == expected
```

### 3. Improve Shrinking Speed

```python
# Limit shrink time
@settings(
    suppress_health_check=[HealthCheck.too_slow],
    deadline=None  # No deadline for complex shrinking
)
```

### 4. Debug Shrinking

```python
# Verbose mode shows shrinking process
@settings(verbosity=Verbosity.verbose)
def test_with_shrink_details(xs):
    ...
```

## Common Shrinking Issues

### Issue: Shrinking Takes Too Long

**Cause:** Complex types with many shrink paths

**Solution:**
- Limit shrink iterations
- Use simpler generators
- Implement efficient custom shrinking

### Issue: Counterexample Not Minimal

**Cause:** Shrinking stops at local minimum

**Solution:**
- Run more examples
- Use different seed
- Implement better shrink function

### Issue: Invalid Shrunk Values

**Cause:** Shrinker produces values that violate constraints

**Solution:**
- Filter invalid values in shrink function
- Use constrained generators
- Validate in shrink output

---

**See SKILL.md for complete property-based testing guidance**
