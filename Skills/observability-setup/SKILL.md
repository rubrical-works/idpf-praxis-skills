---
name: observability-setup
description: Scaffold observability infrastructure including OpenTelemetry SDK config, Grafana dashboards, alert rules, and structured logging setup
version: "1.0.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-03-17"
license: Complete terms in LICENSE.txt
category: devops
type: invokable
relevantTechStack: [opentelemetry, grafana, prometheus, logging, metrics, tracing]
copyright: "Rubrical Works (c) 2026"
---
# Observability Setup
Scaffolds observability for production services: structured logging, distributed tracing, metrics, alerting.
**Companion Domain:** Domains/Observability — provides evaluative review criteria
## When to Use
- Setting up structured logging for a new service
- Configuring OpenTelemetry SDK for tracing/metrics
- Creating Grafana dashboard templates
- Defining SLO-based alert rules
- Establishing metrics naming conventions
## Capabilities
**OpenTelemetry SDK:** Tracer provider with sampling, meter provider with export interval, W3C TraceContext propagation, resource attributes (service, version, env)
**Structured Logging:** JSON formatter, log level mapping (ERROR/WARN/INFO/DEBUG), correlation ID middleware, PII redaction patterns
**Grafana Dashboards:** RED metrics (Rate/Errors/Duration), service health overview, endpoint latency percentiles (p50/p95/p99), error rate by status code
**Alert Rules:** SLO burn rate alerts, error rate thresholds, latency p99 thresholds, routing and severity classification
## Related Skills
- `ci-cd-pipeline-design` — deploying observability configuration
- `error-handling-patterns` — consistent error logging and classification
