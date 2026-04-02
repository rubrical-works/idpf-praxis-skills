# Using resilience-patterns Without IDPF Framework

Fault tolerance patterns for distributed systems -- retry with exponential backoff, circuit breaker, fallback, bulkhead, and timeout patterns with implementations in Python, JavaScript, and Go.

## What's Included

| File | Purpose |
|------|---------|
| `SKILL.md` | Main guide covering all five resilience patterns (retry, circuit breaker, fallback, bulkhead, timeout) with implementations, configuration tables, and combination strategies |

## Quick Start

> This is one approach. Adapt it to your project's structure.

1. Install the skill into your project (e.g., via Praxis Hub Manager or by placing it in `.claude/skills/resilience-patterns/`)
2. Add a rule in `.claude/rules/` or `CLAUDE.md` that references it:

```
When implementing calls to external APIs, adding database connection resilience,
designing microservice communication, or handling transient failures, read
.claude/skills/resilience-patterns/SKILL.md first. Apply the appropriate pattern
(retry, circuit breaker, fallback, bulkhead, timeout) or combine patterns as
recommended in the combining patterns section.
```

## Customization

- Adjust the default configuration values in `SKILL.md` (retry counts, backoff factors, circuit breaker thresholds) to match your service SLAs and traffic patterns.
- Add implementations in additional languages if your stack is not covered by the existing Python, JavaScript, and Go examples.
- Extend the combining patterns section with your organization's standard resilience stack (e.g., "all HTTP clients must use timeout + retry + circuit breaker").

## How IDPF Projects Use This

In IDPF projects, this skill is loaded on demand when working on service integration, API client code, or microservice communication. The framework reads `SKILL.md` into context so that resilience patterns are applied consistently when implementing external calls or handling failure scenarios. The approach above replicates that behavior for any Claude Code project.
