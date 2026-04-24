# General Programming Errors
**Version:** v0.14.0

## Logic Errors

### Infinite Loops
**Symptom:** Program hangs, browser keeps loading

**Cause:** Loop condition never becomes false

**Wrong:**
```python
i = 0
while i < 10:
    print(i)
    # Forgot to increment i!
```

**Fix:**
```python
i = 0
while i < 10:
    print(i)
    i += 1  # Makes loop end eventually
```

### Off-by-One Errors
**Symptom:** Missing first/last item, or processing one too many

**Common causes:**
- Starting at 1 instead of 0
- Using `<` instead of `<=`
- Forgetting arrays are zero-indexed

**Example:**
```python
# Wrong: misses last item
for i in range(len(items) - 1):
    print(items[i])

# Right: processes all items
for i in range(len(items)):
    print(items[i])
```

---

## Variable Errors

### Undefined Variable
**Python:** `NameError: name 'x' is not defined`
**Ruby:** `NameError: undefined local variable`
**JavaScript:** `ReferenceError: x is not defined`

**Cause:** Using variable before defining it

**Fix:** Define before use, check spelling

### Wrong Variable Scope
**Symptom:** Variable exists but seems empty/undefined

**Cause:** Variable defined in different scope (function, block)

**Example:**
```python
def get_name():
    name = "Alice"  # Only exists inside function

print(name)  # Error! 'name' not defined here
```

**Fix:** Return value or define in correct scope.

---

## String Errors

### Quote Mismatch
**Cause:** Mixed or unclosed quotes

**Wrong:**
```python
message = 'Hello, it's me"  # Mixed quotes
message = "Hello           # Unclosed
```

**Right:**
```python
message = "Hello, it's me"  # Use " when string has '
message = 'Hello "world"'   # Use ' when string has "
```

### String Concatenation Type Error
**Symptom:** `TypeError: can only concatenate str`

**Cause:** Mixing strings with numbers

**Wrong:**
```python
age = 25
print("Age: " + age)  # Can't add string + int
```

**Right:**
```python
print("Age: " + str(age))   # Convert to string
print(f"Age: {age}")        # Or use f-string
```

---

## Comparison Errors

### Assignment vs Comparison
**Cause:** Using `=` instead of `==`

**Wrong:**
```python
if x = 5:    # Assignment, not comparison
```

**Right:**
```python
if x == 5:   # Comparison
```

### Comparing Different Types
**Symptom:** Comparison always false/unexpected

**Example:**
```python
user_input = "5"    # String from form
if user_input == 5: # Comparing string to int
    print("Match")  # Never prints!
```

**Fix:** Convert types before comparing.

---

## Function Errors

### Forgetting to Return
**Symptom:** Function returns None/nil

**Wrong:**
```python
def add(a, b):
    result = a + b
    # Forgot to return!
```

**Right:**
```python
def add(a, b):
    return a + b
```

### Wrong Number of Arguments
**Cause:** Calling function with too many/few arguments

**Fix:** Check function definition for required parameters.

---

## Data Structure Errors

### Index Out of Range
**Python:** `IndexError: list index out of range`
**Ruby:** Returns `nil`

**Cause:** Accessing index that doesn't exist

**Example:**
```python
items = ["a", "b", "c"]  # Indices: 0, 1, 2
print(items[3])          # Error! No index 3
```

**Fix:** Check length before accessing, use safe methods.

### Key Not Found
**Python:** `KeyError`
**Ruby:** Returns `nil`

**Cause:** Accessing dictionary key that doesn't exist

**Fix:**
```python
# Safe access:
value = my_dict.get('key', 'default')
```

---

## Case Sensitivity

**Remember:** Most languages are case-sensitive
- `myVar` ≠ `myvar`
- `GetUser()` ≠ `getuser()`
- `/About` ≠ `/about`

**Tip:** Use consistent naming conventions:
- Python: `snake_case`
- JavaScript: `camelCase`
- Ruby: `snake_case`

---

## Common Fixes Checklist

When stuck, verify:
- [ ] File saved?
- [ ] Server restarted?
- [ ] Variable names spelled correctly?
- [ ] All brackets/quotes closed?
- [ ] Correct data types?
- [ ] Function returns a value?
