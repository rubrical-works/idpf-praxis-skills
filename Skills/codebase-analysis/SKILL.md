---
name: codebase-analysis
description: Analyze existing codebases to extract structure, tech stack, and patterns
type: invokable
version: "1.0.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-03-17"
license: Complete terms in LICENSE.txt
category: code-quality
relevantTechStack: [javascript, typescript, python, java, go, rust, ruby, php, swift, elixir, kotlin, csharp]
defaultSkill: false
copyright: "Rubrical Works (c) 2026"
---
# Skill: codebase-analysis
**Purpose:** Analyze existing codebases to extract structure, tech stack, and patterns
**Audience:** Used by /create-prd extract, /charter extraction, and codebase exploration
**Load with:** Anti-Hallucination-Rules-for-PRD-Work.md (for PRD/charter work)
**Critical:** All analysis output must be traceable to code evidence. Never invent details not supported by actual files, tests, or code patterns. Mark all inferences with confidence levels.
## When to Use
- `/create-prd extract` - Analyzing codebase for PRD generation
- `/charter` extraction mode - Analyzing codebase for charter generation
- `/charter refresh` - Re-analyzing codebase for charter updates
- General codebase exploration and understanding
- Legacy code analysis and onboarding assistance
## Analysis Capabilities
### 1. Tech Stack Detection
| File Pattern | Detects | Example |
|--------------|---------|---------|
| `package.json` | Node.js, npm deps | `"express": "4.x"` -> Express.js |
| `requirements.txt`, `pyproject.toml` | Python, pip deps | `flask==2.0` -> Flask |
| `go.mod` | Go, modules | `require github.com/gin-gonic/gin` -> Gin |
| `Gemfile` | Ruby, gems | `gem 'rails'` -> Ruby on Rails |
| `pom.xml`, `build.gradle` | Java, Maven/Gradle | Spring, Hibernate |
| `Cargo.toml` | Rust, crates | `tokio`, `actix-web` |
| `.csproj`, `packages.config` | .NET, NuGet | ASP.NET, Entity Framework |
| `Package.swift` | Swift, SPM | Vapor, SwiftUI |
| `composer.json` | PHP, Composer | Laravel, Symfony |
| `mix.exs` | Elixir, Mix | Phoenix, Ecto |
| `pubspec.yaml` | Dart/Flutter | Flutter, Dart packages |
| `build.gradle.kts` | Kotlin, Gradle | Ktor, Spring (Kotlin) |
| `build.sbt` | Scala, sbt | Play, Akka |
**Secondary Sources:**
| File Pattern | Detects |
|--------------|---------|
| `Dockerfile` | Containerization, base images |
| `.github/workflows/*.yml` | CI/CD, GitHub Actions |
| `docker-compose.yml` | Service architecture |
| `*.config`, `*.yaml` | Configuration patterns |
### 2. Architecture Inference
**Directory Pattern Detection:**
| Pattern | Architecture Style |
|---------|-------------------|
| `src/`, `lib/`, `app/` | Monolith (single-tier) |
| `frontend/`, `backend/`, `api/` | Multi-tier separation |
| `services/*/`, `microservices/` | Microservices |
| `domain/`, `infrastructure/`, `application/` | Clean/Hexagonal |
| `models/`, `views/`, `controllers/` | MVC pattern |
| `components/`, `pages/`, `hooks/` | Frontend component-based |
**Layer Detection:**
| Layer | Indicators |
|-------|------------|
| Presentation | `views/`, `templates/`, `components/`, `pages/` |
| API | `routes/`, `api/`, `endpoints/`, `handlers/` |
| Business Logic | `services/`, `domain/`, `core/`, `usecases/` |
| Data Access | `repositories/`, `models/`, `db/`, `data/` |
| Infrastructure | `config/`, `infrastructure/`, `utils/` |
### 3. Test Parsing
| Framework | File Pattern | Feature Extraction |
|-----------|--------------|-------------------|
| pytest | `test_*.py`, `*_test.py` | Function names, docstrings, parametrize |
| Jest | `*.test.js`, `*.spec.js` | describe/it blocks |
| JUnit | `*Test.java`, `*Tests.java` | @Test methods, @DisplayName |
| RSpec | `*_spec.rb` | describe/context/it blocks |
| Go testing | `*_test.go` | Test* functions |
| xUnit | `*.Tests.cs` | [Fact], [Theory] methods |
**Extraction Pattern:**
```
Test File -> Test Suite -> Test Case -> Feature Description
                                     -> Expected Behavior
                                     -> Edge Cases
```
### 4. NFR Detection
**Security Patterns:**
| Pattern | NFR Inference |
|---------|---------------|
| `bcrypt`, `argon2`, password hashing | Password security required |
| JWT, OAuth, session management | Authentication required |
| CORS configuration | Cross-origin access control |
| Input validation, sanitization | Input security required |
| Rate limiting middleware | Rate limiting required |
**Performance Patterns:**
| Pattern | NFR Inference |
|---------|---------------|
| Redis, Memcached usage | Caching required |
| Connection pooling | Database performance |
| Async/await, promises | Non-blocking I/O |
| CDN configuration | Content delivery |
| Load balancer config | Horizontal scaling |
**Reliability Patterns:**
| Pattern | NFR Inference |
|---------|---------------|
| Retry logic, circuit breakers | Fault tolerance |
| Health check endpoints | Monitoring required |
| Logging (structured) | Observability |
| Error handling patterns | Error recovery |
| Transaction management | Data consistency |
**Accessibility Patterns:**
| Pattern | NFR Inference |
|---------|---------------|
| ARIA attributes (`aria-label`, `role`) | Accessibility required |
| Semantic HTML (`<nav>`, `<main>`, `<article>`) | Accessibility standards |
| Skip navigation links | Screen reader support |
| Alt text on images | Image accessibility |
| Focus management, keyboard handlers | Keyboard accessibility |
**Observability Patterns:**
| Pattern | NFR Inference |
|---------|---------------|
| OpenTelemetry, Jaeger, Zipkin | Distributed tracing |
| Prometheus metrics, StatsD | Metrics collection |
| Structured logging (JSON logs) | Log aggregation |
| Health check endpoints (`/health`, `/ready`) | Liveness/readiness probes |
| Error tracking (Sentry, Bugsnag) | Error monitoring |
**Internationalization Patterns:**
| Pattern | NFR Inference |
|---------|---------------|
| i18n/l10n libraries (`i18next`, `gettext`, `fluent`) | Multi-language support |
| Locale files (`locales/`, `translations/`) | Translation infrastructure |
| `Intl` API usage, `formatMessage` | Runtime localization |
| Right-to-left (RTL) CSS | Bidirectional text support |
| ICU message format | Pluralization/gender handling |
## Usage
### Load for PRD/Charter Work
```
1. Load: Skills/codebase-analysis/SKILL.md
2. Load: Assistant/Anti-Hallucination-Rules-for-PRD-Work.md
3. Run analysis commands as needed
```
### Analysis Phases
| Phase | Purpose | Output |
|-------|---------|--------|
| Tech Stack Detection | Detect languages, frameworks, dependencies | Tech-Stack summary |
| Architecture Inference | Infer structure, layers, patterns | Architecture summary |
| Test Parsing | Parse tests for features | Feature list with evidence |
| NFR Detection | Detect NFRs from patterns | NFR list with evidence |
| Full Analysis | Run all phases | Complete codebase summary |
## Confidence Levels
| Level | Meaning | Action |
|-------|---------|--------|
| **High** | Direct code evidence (test file, config value) | Use directly |
| **Medium** | Inferred from patterns (directory structure, naming) | Flag for validation |
| **Low** | Weak signals, assumptions | Require user confirmation |
**Format:**
```markdown
**Feature:** User Registration
**Confidence:** High
**Evidence:**
- test_user_registration.py (15 test cases)
- POST /api/register endpoint
- User model in models/user.py
```
## Integration Points
| Consumer | Uses For |
|----------|----------|
| `/create-prd extract` | PRD generation from codebase |
| `/charter` extraction | Charter generation from codebase |
| `/charter refresh` | Charter updates from code changes |
| Anti-pattern analysis | Code quality assessment |
## Resources
| Resource | Purpose |
|----------|---------|
| `resources/test-parsing-guide.md` | Detailed test parsing patterns |
| `resources/nfr-detection-guide.md` | NFR detection patterns by category |
| `resources/tech-stack-detection.md` | Tech stack detection patterns |
| `resources/architecture-inference.md` | Architecture inference patterns |
## Anti-Hallucination Rules
1. **Only report what exists** - Don't invent features not found in code
2. **Cite evidence** - Every finding must reference specific files/patterns
3. **Use confidence levels** - Be honest about inference certainty
4. **Flag gaps** - Note what's missing or unclear
5. **Validate with user** - Medium/Low confidence items need confirmation
