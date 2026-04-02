# Using resilience-patterns Without IDPF Framework
Fault tolerance patterns for distributed systems -- retry with exponential backoff, circuit breaker, fallback, bulkhead, and timeout patterns with implementations in Python, JavaScript, and Go.
## What's Included
| File | Purpose |
|------|---------|
| `SKILL.md` | Main guide covering all five resilience patterns with implementations, configuration tables, and combination strategies |
## Quick Start
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
- Adjust default configuration values (retry counts, backoff factors, circuit breaker thresholds) to match your service SLAs and traffic patterns
- Add implementations in additional languages if your stack is not covered
- Extend combining patterns section with your organization's standard resilience stack
## How IDPF Projects Use This
In IDPF projects, this skill is loaded on demand when working on service integration, API client code, or microservice communication. The framework reads `SKILL.md` into context so resilience patterns are applied consistently. The approach above replicates that behavior for any Claude Code project.
