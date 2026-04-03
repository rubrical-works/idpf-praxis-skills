# Python Anti-Patterns
**Version:** v0.7.0

Common anti-patterns specific to Python development.

---

## Mutable Default Arguments

**Description:** Using mutable objects as default function arguments.

**Symptoms:**
- Function behaves differently on subsequent calls
- Default list/dict accumulates values
- Hard to reproduce bugs
- "Works the first time, not the second"

**Example (Bad):**
```python
def add_item(item, items=[]):
    items.append(item)
    return items

print(add_item('a'))  # ['a']
print(add_item('b'))  # ['a', 'b'] - not ['b']!
print(add_item('c'))  # ['a', 'b', 'c'] - accumulating!

# Same with dict
def add_setting(key, value, settings={}):
    settings[key] = value
    return settings
```

**Refactoring:**
```python
def add_item(item, items=None):
    if items is None:
        items = []
    items.append(item)
    return items

# Or with walrus operator (Python 3.8+)
def add_item(item, items=None):
    (items := items or []).append(item)
    return items

# Type hints make intent clear
from typing import Optional, List

def add_item(item: str, items: Optional[List[str]] = None) -> List[str]:
    if items is None:
        items = []
    items.append(item)
    return items
```

**Severity:** High

---

## Bare Except Clause

**Description:** Catching all exceptions without specifying type.

**Symptoms:**
- Swallowing unexpected errors
- Hiding bugs
- Catching KeyboardInterrupt, SystemExit
- Impossible to debug issues

**Example (Bad):**
```python
try:
    result = risky_operation()
except:  # Catches EVERYTHING including Ctrl+C
    pass  # Silently swallows all errors

# Only slightly better
try:
    result = risky_operation()
except Exception:
    pass  # Still too broad, still swallows
```

**Refactoring:**
```python
# Catch specific exceptions
try:
    result = risky_operation()
except ValueError as e:
    logger.error(f"Invalid value: {e}")
    result = default_value
except ConnectionError as e:
    logger.error(f"Connection failed: {e}")
    raise

# If you must catch broadly, at least log
try:
    result = risky_operation()
except Exception as e:
    logger.exception("Unexpected error in risky_operation")
    raise  # Re-raise after logging

# Use finally for cleanup, not except
try:
    resource = acquire_resource()
    use_resource(resource)
finally:
    release_resource(resource)
```

**Severity:** High

---

## Not Using Context Managers

**Description:** Manual resource management instead of context managers.

**Symptoms:**
- Resources not closed on exceptions
- File handles leaked
- Connection pool exhaustion
- Complex try/finally blocks

**Example (Bad):**
```python
# Manual file handling
f = open('data.txt', 'r')
data = f.read()
f.close()  # Not called if read() raises!

# Manual try/finally
f = open('data.txt', 'r')
try:
    data = f.read()
finally:
    f.close()  # Better but verbose

# Database connections
conn = get_connection()
cursor = conn.cursor()
cursor.execute(query)
results = cursor.fetchall()
cursor.close()
conn.close()  # Not called on error
```

**Refactoring:**
```python
# Use with statement
with open('data.txt', 'r') as f:
    data = f.read()
# Automatically closed, even on exception

# Multiple context managers
with open('input.txt') as infile, open('output.txt', 'w') as outfile:
    outfile.write(infile.read())

# Database with context manager
with get_connection() as conn:
    with conn.cursor() as cursor:
        cursor.execute(query)
        results = cursor.fetchall()

# Custom context manager
from contextlib import contextmanager

@contextmanager
def timer(name):
    start = time.time()
    yield
    print(f"{name} took {time.time() - start:.2f}s")

with timer("Data processing"):
    process_data()
```

**Severity:** High

---

## Type Checking with type()

**Description:** Using `type()` instead of `isinstance()` for type checking.

**Symptoms:**
- Doesn't work with inheritance
- Misses subclasses
- Breaks duck typing
- Overly strict type checks

**Example (Bad):**
```python
def process(value):
    if type(value) == dict:  # Won't match OrderedDict, defaultdict, etc.
        return value['key']

def validate(obj):
    if type(obj) == list:  # Won't match subclasses
        return len(obj)
```

**Refactoring:**
```python
# Use isinstance for type checking
def process(value):
    if isinstance(value, dict):  # Matches dict and all subclasses
        return value['key']

# Check multiple types
def validate(obj):
    if isinstance(obj, (list, tuple)):
        return len(obj)

# Better: duck typing
def validate(obj):
    try:
        return len(obj)
    except TypeError:
        raise ValueError("Object must have length")

# Best: type hints + duck typing
from typing import Sized

def validate(obj: Sized) -> int:
    return len(obj)
```

**Severity:** Medium

---

## String Concatenation in Loops

**Description:** Building strings with `+` in loops instead of using join.

**Symptoms:**
- O(n²) performance for string building
- Slow for large iterations
- Memory inefficient
- Noticeable lag with large data

**Example (Bad):**
```python
# O(n²) - creates new string each iteration
result = ""
for item in large_list:
    result += str(item) + ", "

# Also bad with f-strings in loop
result = ""
for item in large_list:
    result = f"{result}{item}, "
```

**Refactoring:**
```python
# O(n) - using join
result = ", ".join(str(item) for item in large_list)

# For complex formatting, use list then join
parts = []
for item in large_list:
    parts.append(f"{item.name}: {item.value}")
result = "\n".join(parts)

# Or list comprehension
result = "\n".join(
    f"{item.name}: {item.value}"
    for item in large_list
)

# io.StringIO for very complex cases
from io import StringIO
buffer = StringIO()
for item in large_list:
    buffer.write(f"{item}, ")
result = buffer.getvalue()
```

**Severity:** Medium

---

## Using range(len()) for Iteration

**Description:** Iterating with index when direct iteration would work.

**Symptoms:**
- Unpythonic code
- Extra indexing operations
- Missing the point of iterables
- C-style loops in Python

**Example (Bad):**
```python
# Unnecessary indexing
for i in range(len(items)):
    print(items[i])

# Getting index and value the hard way
for i in range(len(items)):
    print(f"{i}: {items[i]}")

# Iterating two lists
for i in range(len(list1)):
    print(list1[i], list2[i])
```

**Refactoring:**
```python
# Direct iteration
for item in items:
    print(item)

# Use enumerate for index
for i, item in enumerate(items):
    print(f"{i}: {item}")

# Use zip for parallel iteration
for item1, item2 in zip(list1, list2):
    print(item1, item2)

# Use zip_longest if lists differ in length
from itertools import zip_longest
for item1, item2 in zip_longest(list1, list2, fillvalue=None):
    print(item1, item2)
```

**Severity:** Low

---

## Not Using Comprehensions

**Description:** Using loops when comprehensions would be cleaner.

**Symptoms:**
- Verbose code for simple transformations
- Loop to build list/dict/set
- Multiple lines for one-liner operations

**Example (Bad):**
```python
# Building a list
squares = []
for x in range(10):
    squares.append(x ** 2)

# Filtering
evens = []
for x in numbers:
    if x % 2 == 0:
        evens.append(x)

# Building a dict
name_to_id = {}
for user in users:
    name_to_id[user.name] = user.id
```

**Refactoring:**
```python
# List comprehension
squares = [x ** 2 for x in range(10)]

# With filter
evens = [x for x in numbers if x % 2 == 0]

# Dict comprehension
name_to_id = {user.name: user.id for user in users}

# Set comprehension
unique_names = {user.name.lower() for user in users}

# Generator expression for large data (lazy evaluation)
sum_squares = sum(x ** 2 for x in range(1000000))

# Note: Don't over-use - complex comprehensions should be loops
# Bad: hard to read
result = [
    transform(x)
    for x in items
    if condition1(x)
    if condition2(x)
    for y in x.children
    if condition3(y)
]
```

**Severity:** Low

---

## Circular Imports

**Description:** Modules importing each other, causing import errors.

**Symptoms:**
- `ImportError: cannot import name`
- `AttributeError: module has no attribute`
- Import errors only in certain orders
- Partially initialized modules

**Example (Bad):**
```python
# models/user.py
from models.order import Order
class User:
    def get_orders(self):
        return Order.query.filter_by(user_id=self.id)

# models/order.py
from models.user import User  # Circular!
class Order:
    def get_user(self):
        return User.query.get(self.user_id)
```

**Refactoring:**
```python
# Option 1: Import inside function
# models/user.py
class User:
    def get_orders(self):
        from models.order import Order  # Local import
        return Order.query.filter_by(user_id=self.id)

# Option 2: Restructure to avoid circular dependency
# models/base.py - shared base
# models/user.py - imports from base
# models/order.py - imports from base
# services/user_orders.py - imports both, contains cross-references

# Option 3: Use TYPE_CHECKING for type hints only
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from models.order import Order  # Only used by type checker

class User:
    def get_orders(self) -> list['Order']:
        # Implementation imports at runtime if needed
        pass
```

**Severity:** High

---

## Using *args/**kwargs Incorrectly

**Description:** Misusing or overusing flexible argument passing.

**Symptoms:**
- Function signature unclear
- No IDE autocomplete
- Easy to pass wrong arguments
- Hidden API complexity

**Example (Bad):**
```python
# Unclear what function accepts
def create_user(**kwargs):
    name = kwargs.get('name')
    email = kwargs.get('email')
    # What other kwargs are valid? Who knows!

# Passing through without understanding
def wrapper(*args, **kwargs):
    return some_function(*args, **kwargs)
    # What if some_function signature changes?

# Using *args for distinct parameters
def calculate(*args):
    width, height, depth = args  # Fragile
    return width * height * depth
```

**Refactoring:**
```python
# Explicit parameters with defaults
def create_user(name: str, email: str, age: int = None, role: str = 'user'):
    pass

# Document when kwargs are necessary
def create_user(name: str, email: str, **extra_fields):
    """
    Create a user with optional extra fields.

    Args:
        name: User's full name
        email: User's email address
        **extra_fields: Additional fields stored in user profile
            Supported: phone, address, preferences
    """
    pass

# Explicit tuple unpacking
def calculate(dimensions: tuple[float, float, float]) -> float:
    width, height, depth = dimensions
    return width * height * depth

# Or named parameters
def calculate(width: float, height: float, depth: float) -> float:
    return width * height * depth
```

**Severity:** Medium

---

## Global Variables

**Description:** Using global state instead of proper parameter passing.

**Symptoms:**
- Functions depend on external state
- Hard to test
- Race conditions in concurrent code
- Unexpected side effects

**Example (Bad):**
```python
# Global configuration
config = {}

def load_config():
    global config
    config = read_config_file()

def get_setting(key):
    return config.get(key)  # Depends on load_config being called

# Global connection
db_connection = None

def get_user(user_id):
    return db_connection.query(...)  # What if not initialized?
```

**Refactoring:**
```python
# Dependency injection
class ConfigService:
    def __init__(self, config_path: str):
        self.config = read_config_file(config_path)

    def get_setting(self, key: str):
        return self.config.get(key)

# Pass dependencies explicitly
class UserRepository:
    def __init__(self, db_connection):
        self.db = db_connection

    def get_user(self, user_id: int):
        return self.db.query(...)

# Module-level singletons with proper initialization
_config: Optional[Config] = None

def get_config() -> Config:
    global _config
    if _config is None:
        raise RuntimeError("Config not initialized. Call init_config() first.")
    return _config

def init_config(config_path: str) -> None:
    global _config
    _config = Config(config_path)
```

**Severity:** High

---

## Not Using Dataclasses

**Description:** Writing boilerplate for simple data containers.

**Symptoms:**
- `__init__` just assigns arguments to self
- Manual `__repr__`, `__eq__` implementations
- Lots of repetitive code
- Error-prone manual implementations

**Example (Bad):**
```python
class User:
    def __init__(self, name, email, age, role='user'):
        self.name = name
        self.email = email
        self.age = age
        self.role = role

    def __repr__(self):
        return f"User(name={self.name!r}, email={self.email!r}, age={self.age!r}, role={self.role!r})"

    def __eq__(self, other):
        if not isinstance(other, User):
            return False
        return (self.name == other.name and
                self.email == other.email and
                self.age == other.age and
                self.role == other.role)
```

**Refactoring:**
```python
from dataclasses import dataclass, field

@dataclass
class User:
    name: str
    email: str
    age: int
    role: str = 'user'
    # __init__, __repr__, __eq__ generated automatically

# With additional features
@dataclass(frozen=True)  # Immutable
class Point:
    x: float
    y: float

# With factory defaults
@dataclass
class Order:
    items: list = field(default_factory=list)
    metadata: dict = field(default_factory=dict)

# Named tuples for simpler cases
from typing import NamedTuple

class Point(NamedTuple):
    x: float
    y: float
```

**Severity:** Low

---

## Print Statement Debugging

**Description:** Using print statements instead of proper debugging/logging.

**Symptoms:**
- Print statements left in production code
- No log levels
- Hard to filter output
- No timestamps or context

**Example (Bad):**
```python
def process_order(order):
    print("Processing order")  # Debug print
    print(f"Order: {order}")
    print("Starting validation")
    if validate(order):
        print("Validation passed")
        # ... rest of function
    print("Done")
```

**Refactoring:**
```python
import logging

logger = logging.getLogger(__name__)

def process_order(order):
    logger.info("Processing order %s", order.id)
    logger.debug("Order details: %s", order)

    if validate(order):
        logger.info("Order %s validation passed", order.id)
        # ... rest of function

    logger.info("Order %s processing complete", order.id)

# Configure logging once at startup
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Use debugger for actual debugging
import pdb; pdb.set_trace()  # Or breakpoint() in Python 3.7+
```

**Severity:** Low

---

## Detection Checklist

- [ ] Default arguments that are mutable (list, dict, set)
- [ ] Bare `except:` or `except Exception:`
- [ ] `open()` without `with` statement
- [ ] `type(x) == SomeType` instead of `isinstance()`
- [ ] String concatenation with `+` in loops
- [ ] `for i in range(len(items))` patterns
- [ ] Loops that could be comprehensions
- [ ] Circular import errors
- [ ] Functions accepting `**kwargs` with unclear valid keys
- [ ] Global variables for configuration/state
- [ ] Data classes with manual `__init__`, `__repr__`, `__eq__`
- [ ] Print statements instead of logging

---

**End of Python Anti-Patterns**
