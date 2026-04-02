---
name: codebase-analysis
description: Analyze existing codebases to extract structure, tech stack, and patterns
type: reference
disable-model-invocation: true
version: "1.0.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-04-02"
license: Complete terms in LICENSE.txt
category: code-quality
relevantTechStack: [javascript, typescript, python, java, go, rust, ruby, php, swift, elixir, kotlin, csharp]
defaultSkill: true
copyright: "Rubrical Works (c) 2026"
---
# Skill: codebase-analysis
Load with Anti-Hallucination-Rules-for-PRD-Work.md for PRD/charter work.
All analysis output must be traceable to code evidence. Never invent details not supported by actual files. Mark inferences with confidence levels.
## Tech Stack Detection
Detect languages, frameworks, dependencies from project files.
| File Pattern | Detects |
|--------------|---------|
| `package.json` | Node.js, npm deps |
| `requirements.txt`, `pyproject.toml` | Python, pip deps |
| `go.mod` | Go modules |
| `Gemfile` | Ruby gems |
| `pom.xml`, `build.gradle` | Java, Maven/Gradle |
| `Cargo.toml` | Rust crates |
| `.csproj`, `packages.config` | .NET, NuGet |
| `Package.swift` | Swift SPM |
| `composer.json` | PHP Composer |
| `mix.exs` | Elixir Mix |
| `pubspec.yaml` | Dart/Flutter |
| `build.gradle.kts` | Kotlin Gradle |
| `build.sbt` | Scala sbt |
Secondary: `Dockerfile` (containerization), `.github/workflows/*.yml` (CI/CD), `docker-compose.yml` (service arch), `*.config`/`*.yaml` (config patterns).
## Architecture Inference
| Pattern | Architecture Style |
|---------|-------------------|
| `src/`, `lib/`, `app/` | Monolith |
| `frontend/`, `backend/`, `api/` | Multi-tier |
| `services/*/`, `microservices/` | Microservices |
| `domain/`, `infrastructure/`, `application/` | Clean/Hexagonal |
| `models/`, `views/`, `controllers/` | MVC |
| `components/`, `pages/`, `hooks/` | Frontend component-based |
Layer indicators: Presentation (`views/`, `templates/`, `components/`), API (`routes/`, `api/`, `handlers/`), Business Logic (`services/`, `domain/`, `core/`), Data Access (`repositories/`, `models/`, `db/`), Infrastructure (`config/`, `utils/`).
## Test Parsing
| Framework | File Pattern | Extraction |
|-----------|--------------|------------|
| pytest | `test_*.py`, `*_test.py` | Function names, docstrings, parametrize |
| Jest | `*.test.js`, `*.spec.js` | describe/it blocks |
| JUnit | `*Test.java` | @Test, @DisplayName |
| RSpec | `*_spec.rb` | describe/context/it |
| Go testing | `*_test.go` | Test* functions |
| xUnit | `*.Tests.cs` | [Fact], [Theory] |
```
Test File -> Test Suite -> Test Case -> Feature Description
                                    -> Expected Behavior
                                    -> Edge Cases
```
## NFR Detection
Security: `bcrypt`/`argon2` (password security), JWT/OAuth (auth), CORS config, input validation, rate limiting.
Performance: Redis/Memcached (caching), connection pooling, async/await, CDN config, load balancer.
Reliability: retry/circuit breakers (fault tolerance), health checks, structured logging, error handling, transactions.
Accessibility: ARIA attributes, semantic HTML, skip nav, alt text, focus/keyboard handlers.
Observability: OpenTelemetry/Jaeger (tracing), Prometheus/StatsD (metrics), JSON logs, health endpoints, Sentry/Bugsnag.
i18n: i18next/gettext (multi-language), locale files, `Intl` API, RTL CSS, ICU message format.
## Usage
| Phase | Output |
|-------|--------|
| Tech Stack Detection | Technology summary with confidence |
| Architecture Inference | Structure, layers, patterns |
| Test Parsing | Feature list with test evidence |
| NFR Detection | NFR list with code evidence |
| Full Analysis | Complete codebase summary |
## Confidence Levels
| Level | Meaning | Action |
|-------|---------|--------|
| High | Direct code evidence | Use directly |
| Medium | Inferred from patterns | Flag for validation |
| Low | Weak signals | Require user confirmation |
```markdown
**Feature:** User Registration
**Confidence:** High
**Evidence:**
- test_user_registration.py (15 test cases)
- POST /api/register endpoint
- User model in models/user.py
```
## Anti-Hallucination Rules
1. Only report what exists in code
2. Cite specific files/patterns as evidence
3. Use confidence levels honestly
4. Flag gaps and missing information
5. Medium/Low confidence items need user confirmation