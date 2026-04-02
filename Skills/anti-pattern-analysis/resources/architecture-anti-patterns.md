# Architecture Anti-Patterns
**Version:** v0.6.0

System design and structural issues that affect the overall codebase.

---

## Big Ball of Mud

**Description:** A system with no discernible architecture. Code grows organically without structure.

**Symptoms:**
- No clear module boundaries
- Everything depends on everything
- No separation of concerns
- "Just put it anywhere" mentality
- Fear of refactoring

**Example:**
```
src/
├── utils.js          # 5000 lines, does everything
├── helpers.js        # More of the same
├── app.js            # UI, business logic, API calls mixed
├── database.js       # Also handles validation and emails
└── stuff.js          # Nobody knows what this does
```

**Refactoring:**
1. Identify natural boundaries (features, domains)
2. Create explicit modules/packages
3. Define clear interfaces between modules
4. Migrate incrementally, not all at once

**Severity:** Critical

---

## Distributed Monolith

**Description:** Microservices that are tightly coupled, requiring coordinated deployments.

**Symptoms:**
- Services share databases
- Synchronous calls between many services
- Deploying one service requires deploying others
- Shared libraries with business logic
- "Microservices" that can't be deployed independently

**Example:**
```
OrderService ──sync──> InventoryService ──sync──> PaymentService
     │                        │                        │
     └────────────────────────┴────────────────────────┘
                    Shared Database
```

**Refactoring:**
- Each service owns its data
- Use async messaging where possible
- Define clear API contracts
- Accept eventual consistency
- Or: consolidate back to monolith if simpler

**Severity:** High

---

## Lava Flow

**Description:** Dead code that remains because no one is sure if it's still needed.

**Symptoms:**
- Commented-out code blocks
- Unused functions/classes
- "TODO: remove after migration" comments from years ago
- Fear of deleting anything
- "It might break something" mentality

**Example:**
```python
# def old_calculate_tax(order):
#     # Old implementation - DO NOT USE
#     return order.total * 0.08

# def really_old_calculate_tax(order):
#     # Even older - from 2018 migration
#     pass

def calculate_tax(order):
    # Current implementation
    return order.total * get_tax_rate(order.state)

def calculate_tax_v2(order):  # Nobody knows if this is used
    return order.total * 0.1
```

**Refactoring:**
1. Use code coverage to find dead code
2. Search for usages before deleting
3. Git history preserves deleted code
4. Delete with confidence (tests as safety net)

**Severity:** Medium

---

## Boat Anchor

**Description:** Code kept "just in case" it's needed later.

**Symptoms:**
- Unused parameters maintained for "future use"
- Abstract classes with single implementations
- Features built but never used
- Configuration for hypothetical scenarios

**Example:**
```javascript
// These parameters were added for "future flexibility"
function createUser(
    name,
    email,
    phoneNumber,           // Never used
    faxNumber,             // Never used
    emergencyContact,      // Never used
    bloodType,             // Never used
    zodiacSign             // Never used
) {
    return { name, email };
}
```

**Refactoring:** YAGNI (You Aren't Gonna Need It)
- Delete unused code
- Add features when actually needed
- Git preserves history

**Severity:** Low

---

## Copy-Paste Programming

**Description:** Duplicated code blocks instead of shared abstractions.

**Symptoms:**
- Same logic in multiple places
- Bug fixes needed in multiple locations
- Slight variations that diverge over time
- "I'll just copy this and modify it"

**Example (Bad):**
```javascript
// In userController.js
async function getUser(id) {
    try {
        const result = await db.query('SELECT * FROM users WHERE id = ?', [id]);
        if (!result) throw new NotFoundError('User not found');
        return result;
    } catch (err) {
        logger.error('Database error', err);
        throw err;
    }
}

// In orderController.js (copy-pasted)
async function getOrder(id) {
    try {
        const result = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
        if (!result) throw new NotFoundError('Order not found');
        return result;
    } catch (err) {
        logger.error('Database error', err);
        throw err;
    }
}
```

**Refactoring:**
```javascript
async function findById(table, id, entityName) {
    try {
        const result = await db.query(`SELECT * FROM ${table} WHERE id = ?`, [id]);
        if (!result) throw new NotFoundError(`${entityName} not found`);
        return result;
    } catch (err) {
        logger.error('Database error', err);
        throw err;
    }
}

const getUser = (id) => findById('users', id, 'User');
const getOrder = (id) => findById('orders', id, 'Order');
```

**Severity:** High

---

## Spaghetti Code

**Description:** Tangled control flow that's difficult to follow.

**Symptoms:**
- Gotos or equivalent jumps
- Deeply nested conditionals
- Long methods with many branches
- State mutations scattered throughout
- No clear entry/exit points

**Example (Bad):**
```python
def process(data):
    result = None
    if data.type == 'A':
        if data.status == 'active':
            if data.amount > 100:
                result = handle_large_a(data)
                if result.needs_review:
                    goto review  # Not Python, but the concept
            else:
                result = handle_small_a(data)
        else:
            # 50 more lines of nested conditions
    elif data.type == 'B':
        # Another 100 lines
    # ...
```

**Refactoring:**
- Extract methods for each branch
- Use strategy pattern
- State machines for complex flows
- Guard clauses for early returns

**Severity:** High

---

## Lasagna Code

**Description:** Too many layers of abstraction.

**Symptoms:**
- Simple operations pass through 5+ layers
- Interfaces with single implementations
- Abstract factories for simple objects
- "Enterprise" patterns where not needed
- Debugging requires tracing through many files

**Example:**
```
Controller → Service → Manager → Handler → Repository → DAO → Database

// To save a user:
UserController.create()
  → UserService.createUser()
    → UserManager.handleUserCreation()
      → UserHandler.processUser()
        → UserRepository.save()
          → UserDAO.insert()
            → Database.execute()
```

**Refactoring:**
- Remove unnecessary layers
- Each layer should add value
- Simple CRUD might only need: Controller → Repository → Database
- Add layers only when needed

**Severity:** Medium

---

## Swiss Army Knife

**Description:** One interface or class trying to do everything.

**Symptoms:**
- Interfaces with 20+ methods
- God interfaces that all implementations partially implement
- `UnsupportedOperationException` in implementations
- Feature flags to enable/disable capabilities

**Example (Bad):**
```java
interface DataProcessor {
    void read();
    void write();
    void validate();
    void transform();
    void encrypt();
    void decrypt();
    void compress();
    void decompress();
    void backup();
    void restore();
    void audit();
    void notify();
    // ... 20 more methods
}
```

**Refactoring:** Interface segregation
```java
interface Reader { void read(); }
interface Writer { void write(); }
interface Validator { void validate(); }
interface Transformer { void transform(); }
interface Encryptor { void encrypt(); void decrypt(); }
// Combine as needed
interface SecureDataProcessor extends Reader, Writer, Encryptor {}
```

**Severity:** Medium

---

## Vendor Lock-in Architecture

**Description:** System tightly coupled to specific vendor/cloud provider.

**Symptoms:**
- Vendor-specific APIs throughout codebase
- No abstraction over cloud services
- Difficult/impossible to switch providers
- Vendor SDK used directly in business logic

**Example (Bad):**
```python
from aws.dynamodb import DynamoDB
from aws.s3 import S3
from aws.sns import SNS

class OrderService:
    def create_order(self, order):
        dynamodb.put_item(...)  # Direct AWS call
        s3.upload(...)          # Direct AWS call
        sns.publish(...)        # Direct AWS call
```

**Refactoring:**
```python
class OrderService:
    def __init__(self, db: Database, storage: FileStorage, events: EventBus):
        self.db = db
        self.storage = storage
        self.events = events

    def create_order(self, order):
        self.db.save(order)
        self.storage.upload(receipt)
        self.events.publish(OrderCreatedEvent(order))

# Implementations can be swapped
# DynamoDBDatabase, S3Storage, SNSEventBus
# Or: PostgresDatabase, LocalStorage, RabbitMQEventBus
```

**Severity:** Medium (depends on strategy)

---

## Accidental Architecture

**Description:** Architecture that emerged without planning.

**Symptoms:**
- "It just grew this way"
- No documentation of decisions
- Inconsistent patterns across codebase
- New developers can't understand the structure
- Technical decisions made by default

**Refactoring:**
- Document current architecture (as-is)
- Make deliberate decisions (ADRs)
- Define target architecture
- Incrementally align

**Severity:** Medium

---

## Detection Checklist

- [ ] No clear module boundaries (Big Ball of Mud)
- [ ] Microservices requiring coordinated deploys (Distributed Monolith)
- [ ] Dead code nobody dares remove (Lava Flow)
- [ ] Unused features/parameters kept "just in case" (Boat Anchor)
- [ ] Same code blocks copied across codebase (Copy-Paste)
- [ ] Control flow impossible to follow (Spaghetti)
- [ ] Too many layers for simple operations (Lasagna)
- [ ] One interface doing everything (Swiss Army Knife)
- [ ] Vendor SDKs used directly in business logic (Vendor Lock-in)
- [ ] Architecture evolved without deliberate decisions (Accidental)

---

**End of Architecture Anti-Patterns**
