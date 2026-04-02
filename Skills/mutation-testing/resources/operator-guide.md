# Mutation Operator Guide
**Version:** v0.4.0

Comprehensive reference for mutation operators across languages.

## Operator Categories

### 1. Arithmetic Operator Replacement (AOR)

Replace arithmetic operators with other arithmetic operators.

| Original | Mutations |
|----------|-----------|
| `+` | `-`, `*`, `/`, `%` |
| `-` | `+`, `*`, `/`, `%` |
| `*` | `+`, `-`, `/`, `%` |
| `/` | `+`, `-`, `*`, `%` |
| `%` | `+`, `-`, `*`, `/` |

**Example:**
```python
# Original
result = a + b

# Mutations
result = a - b  # AOR
result = a * b  # AOR
result = a / b  # AOR
```

### 2. Relational Operator Replacement (ROR)

Replace relational operators with other relational operators.

| Original | Mutations |
|----------|-----------|
| `<` | `<=`, `>`, `>=`, `==`, `!=` |
| `<=` | `<`, `>`, `>=`, `==`, `!=` |
| `>` | `<`, `<=`, `>=`, `==`, `!=` |
| `>=` | `<`, `<=`, `>`, `==`, `!=` |
| `==` | `<`, `<=`, `>`, `>=`, `!=` |
| `!=` | `<`, `<=`, `>`, `>=`, `==` |

**Example:**
```python
# Original
if x < y:

# Mutations
if x <= y:  # ROR
if x > y:   # ROR
if x == y:  # ROR
```

### 3. Logical Operator Replacement (LOR)

Replace logical operators.

| Original | Mutations |
|----------|-----------|
| `and` / `&&` | `or` / `||` |
| `or` / `||` | `and` / `&&` |

**Example:**
```python
# Original
if a and b:

# Mutation
if a or b:  # LOR
```

### 4. Logical Negation Insertion (LNI)

Insert or remove logical negation.

| Original | Mutation |
|----------|----------|
| `x` | `not x` |
| `not x` | `x` |

**Example:**
```python
# Original
if is_valid:

# Mutation
if not is_valid:  # LNI
```

### 5. Conditional Operator Replacement (COR)

Replace conditional expressions.

| Original | Mutations |
|----------|-----------|
| `condition ? a : b` | `true ? a : b`, `false ? a : b`, `condition ? b : a` |

**Example:**
```javascript
// Original
result = valid ? success : failure;

// Mutations
result = true ? success : failure;   // COR
result = false ? success : failure;  // COR
result = valid ? failure : success;  // COR (swap branches)
```

### 6. Statement Deletion (SDL)

Remove statements entirely.

| Type | Example |
|------|---------|
| Assignment | Remove `x = 5` |
| Method call | Remove `validate()` |
| Return statement | Remove `return x` |

**Example:**
```python
# Original
def process(x):
    validate(x)     # Can be deleted
    x = transform(x) # Can be deleted
    return x

# Mutation: remove validate() call
def process(x):
    x = transform(x)
    return x
```

### 7. Constant Replacement (CR)

Replace constants with different values.

| Original | Mutations |
|----------|-----------|
| `0` | `1`, `-1` |
| `1` | `0`, `2`, `-1` |
| `true` | `false` |
| `false` | `true` |
| `""` | `"mutant"` |
| `null` | Non-null value |

**Example:**
```python
# Original
MAX_RETRIES = 3

# Mutations
MAX_RETRIES = 0  # CR
MAX_RETRIES = 4  # CR
MAX_RETRIES = -3 # CR
```

### 8. Increment/Decrement Replacement (IDR)

Replace increment/decrement operators.

| Original | Mutations |
|----------|-----------|
| `++x` | `--x`, `x` |
| `x++` | `x--`, `x` |
| `--x` | `++x`, `x` |
| `x--` | `x++`, `x` |

**Example:**
```javascript
// Original
for (let i = 0; i < n; i++)

// Mutations
for (let i = 0; i < n; i--)  // IDR
for (let i = 0; i < n; )     // IDR (remove increment)
```

### 9. Return Value Replacement (RVR)

Replace return values.

| Return Type | Mutations |
|-------------|-----------|
| `int` | `0`, `1`, `-1` |
| `boolean` | `true`, `false`, `!original` |
| `object` | `null` |
| `string` | `""`, `"mutant"` |

**Example:**
```python
# Original
def get_count():
    return len(items)

# Mutations
def get_count():
    return 0        # RVR
    return 1        # RVR
    return -1       # RVR
```

### 10. Void Method Call Removal (VMC)

Remove calls to void methods.

**Example:**
```java
// Original
public void process() {
    log("starting");  // Can be removed
    validate();       // Can be removed
    notify();         // Can be removed
}

// Mutation: remove log call
public void process() {
    validate();
    notify();
}
```

## Language-Specific Operators

### Python-Specific

| Operator | Description | Example |
|----------|-------------|---------|
| Decorator removal | Remove `@decorator` | `@cache` → removed |
| Exception handling | Change exception type | `except ValueError` → `except Exception` |
| Comprehension | Modify list comprehension | `[x for x in items]` → `[x for x in items if False]` |

### JavaScript-Specific

| Operator | Description | Example |
|----------|-------------|---------|
| `===` to `==` | Strict to loose equality | `a === b` → `a == b` |
| `!==` to `!=` | Strict to loose inequality | `a !== b` → `a != b` |
| Optional chaining | Remove `?.` | `obj?.prop` → `obj.prop` |
| Nullish coalescing | Change `??` | `a ?? b` → `a || b` |

### Java-Specific

| Operator | Description | Example |
|----------|-------------|---------|
| Access modifier | Change visibility | `private` → `public` |
| Static removal | Remove static | `static method` → `method` |
| Final removal | Remove final | `final x` → `x` |

## Operator Selection Strategy

### Start With

1. **Relational operators** - Most effective at finding bugs
2. **Logical operators** - Common source of logic errors
3. **Constant replacement** - Catches off-by-one errors

### Add Gradually

4. **Arithmetic operators** - If math is important
5. **Statement deletion** - If test coverage seems high
6. **Return value** - For function testing

### Use Sparingly

7. **Increment/decrement** - Can generate many equivalents
8. **Void method removal** - Often generates equivalents

## Operator Effectiveness

Research shows mutation operator effectiveness varies:

| Operator | Effectiveness | Common Finding |
|----------|---------------|----------------|
| ROR | Very High | Missing boundary tests |
| LOR | High | Logic errors |
| CR | High | Off-by-one errors |
| AOR | Medium | Arithmetic bugs |
| SDL | Medium | Missing assertions |
| RVR | Medium | Return value testing |

## Reducing Equivalent Mutants

### Operators Prone to Equivalents

- Statement deletion (especially logging)
- Increment/decrement in loops
- Return value changes in dead code

### Configuration Tips

```yaml
# Example: Focus on high-value operators
operators:
  - relational
  - logical
  - conditional
exclude_operators:
  - increment_decrement  # Many equivalents
```

---

**See SKILL.md for complete mutation testing guidance**
