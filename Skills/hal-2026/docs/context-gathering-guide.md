# Context Gathering Guide (Step 0)

HAL-2026's optional Step 0 loads relevant skills before signal matching to provide richer context for architecture and design problems.

## When Step 0 Runs

**Runs for:** Architecture decisions, system design, testing infrastructure, database design, API design, deployment strategy, security architecture — any problem where existing codebase context or domain-specific patterns inform the solution.

**Skips for:** Algorithmic/competitive programming problems, pure data structure selection, complexity analysis — problems that are self-contained in the problem statement.

## Domain-to-Skill Mapping

The mapping is defined in `resources/skill-context-map.json`. Each skill entry has:

| Field | Purpose |
|-------|---------|
| `keywords` | Problem statement keywords that trigger this skill |
| `provides` | What context the skill adds to signal matching |
| `priority` | Loading priority when more than 3 skills match |
| `requiresCodebase` | Whether an existing codebase must be present |

### Available Skills

| Skill | When Loaded | What it Provides |
|-------|------------|-----------------|
| `codebase-analysis` | Existing codebase + architecture/design problem | Tech stack, patterns, dependencies, test coverage |
| `anti-pattern-analysis` | Refactoring or improvement problems | Anti-patterns to avoid in recommendations |
| `error-handling-patterns` | Error/fault handling design | Error hierarchy, logging, recovery strategies |
| `resilience-patterns` | Distributed system reliability | Circuit breaker, retry, fallback patterns |
| `api-versioning` | API design problems | Versioning strategies, deprecation workflows |
| `migration-patterns` | Database/schema design | Migration strategies, zero-downtime patterns |
| `ci-cd-pipeline-design` | Build/deploy infrastructure | Pipeline architecture, stage design |
| `test-scaffold` | Testing infrastructure | Domain-specific test configs and patterns |
| `code-path-discovery` | Complex codebase navigation | Behavioral path scanning (TypeScript/JavaScript) |

## Token Budget

Maximum 3 skills loaded per invocation. When more than 3 match, skills are selected by:
1. Priority (high > medium > low)
2. Keyword match count (more matches = more relevant)

## How Context Influences Path Selection

Loaded skills don't change the signal matching algorithm — they enrich the inputs:
- **Tech stack detection** (e.g., PostgreSQL) boosts database-related signals
- **Test framework detection** (e.g., Playwright) boosts test infrastructure signals
- **Anti-pattern findings** add constraints that filter out problematic approaches
- **Domain patterns** provide sub-variant awareness for more specific path naming
