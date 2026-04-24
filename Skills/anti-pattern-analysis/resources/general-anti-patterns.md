# General Anti-Patterns
**Version:** v0.14.0

Design and code smell patterns that apply across languages and frameworks.

---

## Design Anti-Patterns

### God Object / God Class

**Description:** A class that knows too much or does too much. Violates Single Responsibility Principle.

**Symptoms:**
- Class has >500 lines of code
- Class has >10 public methods
- Class has dependencies on many other classes
- Class name ends with "Manager", "Handler", "Processor", "Helper", "Util"
- Methods in the class are unrelated to each other

**Example (Bad):**
```python
class UserManager:
    def create_user(self, data): ...
    def authenticate(self, credentials): ...
    def send_welcome_email(self, user): ...
    def generate_report(self, user): ...
    def process_payment(self, user, amount): ...
    def update_preferences(self, user, prefs): ...
    def sync_with_crm(self, user): ...
    def generate_invoice(self, user): ...
```

**Refactoring:**
```python
class UserService:
    def create_user(self, data): ...
    def update_preferences(self, user, prefs): ...

class AuthService:
    def authenticate(self, credentials): ...

class NotificationService:
    def send_welcome_email(self, user): ...

class BillingService:
    def process_payment(self, user, amount): ...
    def generate_invoice(self, user): ...
```

**Severity:** High

---

### Singleton Abuse

**Description:** Overuse of the Singleton pattern, creating global state and tight coupling.

**Symptoms:**
- `getInstance()` calls scattered throughout codebase
- Difficult to test in isolation
- Hidden dependencies
- Unexpected state mutations

**Example (Bad):**
```java
public class DatabaseConnection {
    private static DatabaseConnection instance;

    public static DatabaseConnection getInstance() {
        if (instance == null) {
            instance = new DatabaseConnection();
        }
        return instance;
    }
}

// Usage everywhere
DatabaseConnection.getInstance().query(...);
```

**Refactoring:** Use dependency injection
```java
public class UserRepository {
    private final DatabaseConnection db;

    public UserRepository(DatabaseConnection db) {
        this.db = db;
    }
}
```

**Severity:** Medium

---

### Anemic Domain Model

**Description:** Domain objects that are pure data containers with no behavior. All logic lives in service classes.

**Symptoms:**
- Classes with only getters/setters
- All business logic in "service" or "manager" classes
- Domain objects passed around just for data access

**Example (Bad):**
```python
class Order:
    def __init__(self):
        self.items = []
        self.status = "pending"
        self.total = 0

class OrderService:
    def calculate_total(self, order):
        order.total = sum(item.price for item in order.items)

    def can_ship(self, order):
        return order.status == "paid" and order.total > 0
```

**Refactoring:** Rich domain model
```python
class Order:
    def __init__(self):
        self.items = []
        self.status = "pending"

    @property
    def total(self):
        return sum(item.price for item in self.items)

    def can_ship(self):
        return self.status == "paid" and self.total > 0
```

**Severity:** Medium

---

### Circular Dependency

**Description:** Two or more modules that depend on each other, creating a cycle.

**Symptoms:**
- Import errors at runtime
- Difficult to understand data flow
- Hard to test in isolation
- Changes ripple unexpectedly

**Example (Bad):**
```python
# user.py
from order import Order
class User:
    def get_orders(self): return Order.find_by_user(self)

# order.py
from user import User
class Order:
    def get_user(self): return User.find(self.user_id)
```

**Refactoring:** Introduce abstraction or restructure
```python
# models/user.py
class User:
    pass

# models/order.py
class Order:
    pass

# services/user_orders.py
from models.user import User
from models.order import Order

def get_user_orders(user): ...
def get_order_user(order): ...
```

**Severity:** High

---

### Golden Hammer

**Description:** Using a familiar technology or pattern for everything, regardless of fit.

**Symptoms:**
- Same solution applied to all problems
- "We always use X for this"
- Ignoring better-suited alternatives
- Over-engineered solutions

**Examples:**
- Using microservices for a simple CRUD app
- Using NoSQL for highly relational data
- Using heavyweight ORM for simple queries
- Using React for a static page

**Refactoring:** Evaluate each problem independently. Choose tools that fit the specific requirements.

**Severity:** Medium

---

## Code Smell Patterns

### Long Method

**Description:** Methods that are too long to understand at a glance.

**Symptoms:**
- Method exceeds 20-30 lines
- Multiple levels of abstraction in one method
- Comments separating "sections" of the method
- Difficult to name accurately

**Example (Bad):**
```javascript
function processOrder(order) {
    // Validate order
    if (!order.items) throw new Error('No items');
    if (order.items.length === 0) throw new Error('Empty order');

    // Calculate totals
    let subtotal = 0;
    for (const item of order.items) {
        subtotal += item.price * item.quantity;
    }
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    // Apply discounts
    let discount = 0;
    if (order.coupon) {
        discount = total * order.coupon.percentage;
    }
    const finalTotal = total - discount;

    // Create invoice
    // ... 20 more lines

    // Send notification
    // ... 15 more lines

    // Update inventory
    // ... 10 more lines
}
```

**Refactoring:** Extract methods
```javascript
function processOrder(order) {
    validateOrder(order);
    const totals = calculateTotals(order);
    const finalTotal = applyDiscounts(totals, order.coupon);
    const invoice = createInvoice(order, finalTotal);
    sendNotification(order, invoice);
    updateInventory(order.items);
}
```

**Severity:** Medium

---

### Deep Nesting

**Description:** Code with many levels of indentation, making it hard to follow.

**Symptoms:**
- More than 3 levels of indentation
- Arrow-shaped code
- Difficult to trace execution path
- Easy to miss edge cases

**Example (Bad):**
```python
def process_user(user):
    if user:
        if user.is_active:
            if user.has_permission('edit'):
                if user.department:
                    if user.department.is_active:
                        # Finally do the work
                        return do_something(user)
    return None
```

**Refactoring:** Use guard clauses
```python
def process_user(user):
    if not user:
        return None
    if not user.is_active:
        return None
    if not user.has_permission('edit'):
        return None
    if not user.department:
        return None
    if not user.department.is_active:
        return None

    return do_something(user)
```

**Severity:** Medium

---

### Magic Numbers/Strings

**Description:** Unexplained literal values scattered throughout code.

**Symptoms:**
- Numbers like 86400, 3600, 1000
- Strings like "admin", "pending", "active"
- Same value repeated in multiple places
- Unclear what the value represents

**Example (Bad):**
```javascript
if (user.role === 2) {
    setTimeout(refresh, 86400000);
}
if (retries > 3) {
    throw new Error('Failed');
}
```

**Refactoring:** Use named constants
```javascript
const ROLE_ADMIN = 2;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const MAX_RETRIES = 3;

if (user.role === ROLE_ADMIN) {
    setTimeout(refresh, ONE_DAY_MS);
}
if (retries > MAX_RETRIES) {
    throw new Error('Failed');
}
```

**Severity:** Low

---

### Primitive Obsession

**Description:** Using primitive types instead of small objects for domain concepts.

**Symptoms:**
- Email as string instead of Email object
- Money as number instead of Money object
- Date ranges as two separate dates
- Validation logic scattered

**Example (Bad):**
```python
def create_user(email: str, phone: str, zip_code: str):
    if '@' not in email:
        raise ValueError('Invalid email')
    if len(phone) != 10:
        raise ValueError('Invalid phone')
    # Validation repeated everywhere email/phone/zip used
```

**Refactoring:** Value objects
```python
class Email:
    def __init__(self, value: str):
        if '@' not in value:
            raise ValueError('Invalid email')
        self.value = value

class Phone:
    def __init__(self, value: str):
        if len(value) != 10:
            raise ValueError('Invalid phone')
        self.value = value

def create_user(email: Email, phone: Phone, zip_code: ZipCode):
    # Validation handled by value objects
    pass
```

**Severity:** Medium

---

### Feature Envy

**Description:** A method that uses more features of another class than its own.

**Symptoms:**
- Method accesses many properties of another object
- Chained property access (a.b.c.d)
- Logic that "belongs" to another class

**Example (Bad):**
```python
class Order:
    def calculate_shipping(self):
        # Uses customer data more than order data
        if self.customer.address.country == 'US':
            if self.customer.membership.level == 'premium':
                return 0
            elif self.customer.address.state in ['CA', 'NY']:
                return 10
        return 20
```

**Refactoring:** Move method to the class it envies
```python
class Customer:
    def calculate_shipping_rate(self):
        if self.address.country == 'US':
            if self.membership.level == 'premium':
                return 0
            elif self.address.state in ['CA', 'NY']:
                return 10
        return 20

class Order:
    def calculate_shipping(self):
        return self.customer.calculate_shipping_rate()
```

**Severity:** Medium

---

### Shotgun Surgery

**Description:** Making one change requires editing many different classes.

**Symptoms:**
- Adding a field requires changes in 5+ files
- Feature changes touch unrelated classes
- High coupling between components
- Fear of making changes

**Example:** Adding a new user field requires changes to:
- User model
- User DTO
- User mapper
- User validator
- User serializer
- User API controller
- User form component
- User display component

**Refactoring:**
- Consolidate related logic
- Use code generation for boilerplate
- Apply DRY principle
- Consider if layers are necessary

**Severity:** High

---

### Data Clumps

**Description:** The same group of data items appearing together repeatedly.

**Symptoms:**
- Same 3+ parameters passed together to multiple methods
- Same fields appear in multiple classes
- Parameters that are always used together

**Example (Bad):**
```python
def create_user(first_name, last_name, street, city, state, zip_code):
    pass

def update_address(user_id, street, city, state, zip_code):
    pass

def validate_address(street, city, state, zip_code):
    pass
```

**Refactoring:** Extract a class
```python
class Address:
    def __init__(self, street, city, state, zip_code):
        self.street = street
        self.city = city
        self.state = state
        self.zip_code = zip_code

    def validate(self):
        pass

def create_user(first_name, last_name, address: Address):
    pass

def update_address(user_id, address: Address):
    pass
```

**Severity:** Medium

---

## Detection Checklist

- [ ] Classes with >500 lines or >10 public methods
- [ ] Singleton pattern used for non-infrastructure concerns
- [ ] Domain classes with only getters/setters
- [ ] Circular imports/dependencies
- [ ] Same tool/pattern used regardless of fit
- [ ] Methods >20-30 lines
- [ ] Nesting >3 levels deep
- [ ] Unexplained literal values
- [ ] Primitives used for domain concepts (email, money, phone)
- [ ] Methods primarily using another class's data
- [ ] Changes requiring edits in many files
- [ ] Same data parameters grouped together repeatedly

---

**End of General Anti-Patterns**
