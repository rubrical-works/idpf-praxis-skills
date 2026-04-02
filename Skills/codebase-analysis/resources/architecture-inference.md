# Architecture Inference Guide
**Version:** v0.4.2

**Purpose:** Patterns for inferring system architecture from codebase structure

---

## Architecture Style Detection

### Monolith Patterns

**Indicators (High Confidence):**
- Single `src/` or `app/` directory
- Shared database models
- No service-to-service communication code
- Single deployment unit (one Dockerfile, one deploy config)

**Directory Patterns:**
```
project/
├── src/
│   ├── models/
│   ├── views/
│   ├── controllers/
│   └── utils/
└── tests/
```

### Microservices Patterns

**Indicators (High Confidence):**
- Multiple `services/*/` directories with independent deps
- Service-to-service communication (gRPC, HTTP clients, message queues)
- Multiple `Dockerfile` or `docker-compose.yml` with many services
- Independent databases per service

**Directory Patterns:**
```
project/
├── services/
│   ├── user-service/
│   │   ├── src/
│   │   └── Dockerfile
│   ├── order-service/
│   │   ├── src/
│   │   └── Dockerfile
│   └── payment-service/
├── shared/
└── infrastructure/
```

### Modular Monolith Patterns

**Indicators (Medium Confidence):**
- Single deployment but modular `modules/` or `features/`
- Shared infrastructure but separate domain logic
- Internal module boundaries

**Directory Patterns:**
```
project/
├── modules/
│   ├── users/
│   ├── orders/
│   └── payments/
├── shared/
└── infrastructure/
```

---

## Architectural Patterns

### MVC (Model-View-Controller)

**Indicators:**
- `models/`, `views/`, `controllers/` directories
- Framework-specific patterns (Rails, Django, Laravel)

**Evidence Strength:**
| Pattern | Confidence |
|---------|------------|
| All three directories present | High |
| Two directories + framework | High |
| Only naming conventions | Medium |

### Clean Architecture / Hexagonal

**Indicators:**
- `domain/`, `application/`, `infrastructure/` separation
- `ports/`, `adapters/` directories
- Dependency inversion (interfaces in domain)

**Directory Patterns:**
```
project/
├── domain/
│   ├── entities/
│   └── repositories/  (interfaces)
├── application/
│   └── usecases/
├── infrastructure/
│   ├── repositories/  (implementations)
│   └── adapters/
└── presentation/
```

### Layered Architecture

**Indicators:**
- Clear layer separation: presentation → business → data
- Layer dependencies flow downward
- No circular dependencies between layers

**Directory Patterns:**
```
project/
├── presentation/  (or api/, controllers/)
├── business/      (or services/, domain/)
├── data/          (or repositories/, persistence/)
└── shared/        (or common/, utils/)
```

### Event-Driven Architecture

**Indicators:**
- Message queue dependencies (RabbitMQ, Kafka, SQS)
- Event handlers, event emitters
- `events/`, `handlers/`, `subscribers/` directories
- Async communication patterns

**Directory Patterns:**
```
project/
├── events/
│   ├── definitions/
│   └── handlers/
├── publishers/
└── subscribers/
```

---

## Layer Detection

### Presentation Layer

**File Patterns:**
| Pattern | Framework/Type |
|---------|----------------|
| `views/`, `templates/` | Server-rendered |
| `components/`, `pages/` | React/Vue/Svelte |
| `controllers/` | MVC |
| `handlers/` | Go/Rust |
| `routes/` | Express/Fastify |

### Business Logic Layer

**File Patterns:**
| Pattern | Type |
|---------|------|
| `services/` | Service classes |
| `usecases/` | Use case handlers |
| `domain/` | Domain logic |
| `core/` | Core business rules |
| `interactors/` | Clean architecture |

### Data Access Layer

**File Patterns:**
| Pattern | Type |
|---------|------|
| `repositories/` | Repository pattern |
| `models/` | ORM models |
| `db/`, `database/` | Database access |
| `persistence/` | Persistence logic |
| `entities/` | Database entities |

### Infrastructure Layer

**File Patterns:**
| Pattern | Type |
|---------|------|
| `config/` | Configuration |
| `infrastructure/` | External services |
| `adapters/` | External adapters |
| `utils/`, `helpers/` | Utilities |
| `lib/` | Shared libraries |

---

## Component Relationship Detection

### Import Analysis

Analyze import statements to infer dependencies:

```python
# Python example
from services.user import UserService  # depends on services layer
from repositories.user import UserRepository  # depends on data layer
```

### Dependency Direction

**Valid (Clean Architecture):**
```
Presentation → Application → Domain ← Infrastructure
```

**Code Smell (Circular/Inverse):**
```
Domain → Infrastructure (violation)
Data → Presentation (violation)
```

---

## API Style Detection

### REST API

**Indicators:**
- HTTP method annotations (`@app.get`, `@GetMapping`)
- Resource-based routes (`/users/{id}`)
- JSON response patterns

### GraphQL

**Indicators:**
- `schema.graphql` or SDL files
- `resolvers/` directory
- `typeDefs`, `Query`, `Mutation` patterns

### gRPC

**Indicators:**
- `.proto` files
- Generated code patterns
- gRPC dependencies

### WebSocket

**Indicators:**
- Socket.io, ws dependencies
- WebSocket handlers
- Real-time event patterns

---

## Output Format

```markdown
## Architecture Summary

**Style:** Modular Monolith
**Confidence:** High
**Evidence:**
- Single deployment (Dockerfile at root)
- Clear module boundaries in `modules/`
- Shared database but separate domain logic

**Layers Detected:**

| Layer | Directory | Confidence |
|-------|-----------|------------|
| Presentation | `api/`, `routes/` | High |
| Business Logic | `services/`, `modules/*/domain/` | High |
| Data Access | `repositories/` | High |
| Infrastructure | `config/`, `infrastructure/` | High |

**API Style:** REST
**Evidence:** Express routes, HTTP method decorators, JSON responses

**Component Relationships:**
- `api/` depends on `services/`
- `services/` depends on `repositories/`
- No circular dependencies detected
```

---

## Confidence Assessment

| Evidence Type | Confidence |
|---------------|------------|
| Explicit directory structure matches pattern | High |
| Framework conventions match pattern | High |
| Partial pattern match + supporting files | Medium |
| Only naming conventions | Medium |
| Inferred from code style | Low |

---

**End of Architecture Inference Guide**
