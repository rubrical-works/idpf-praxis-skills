---
name: observability-setup
description: Scaffold observability infrastructure including OpenTelemetry SDK config, Grafana dashboards, alert rules, and structured logging setup
version: "1.0.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-03-17"
license: Complete terms in LICENSE.txt
category: devops
type: educational
relevantTechStack: [opentelemetry, grafana, prometheus, logging, metrics, tracing]
copyright: "Rubrical Works (c) 2026"
---

# Observability Setup

This skill scaffolds observability infrastructure for production services. It provides concrete configuration templates and implementation patterns for structured logging, distributed tracing, metrics collection, and alerting.

**Companion Domain:** Domains/Observability — provides evaluative review criteria

## When to Use This Skill

Invoke this skill when:
- Setting up structured logging for a new service
- Configuring OpenTelemetry SDK for tracing and metrics
- Creating Grafana dashboard templates for service monitoring
- Defining alert rules for SLO-based alerting
- Establishing a metrics naming convention

## Scaffolding Capabilities

### OpenTelemetry SDK Configuration
- Tracer provider setup with sampling strategy
- Meter provider setup with metric export interval
- Context propagation configuration (W3C TraceContext)
- Resource attributes (service name, version, environment)

### Structured Logging Setup
- JSON log formatter configuration
- Log level mapping (ERROR, WARN, INFO, DEBUG)
- Correlation ID middleware for request tracing
- PII redaction patterns for sensitive fields

### Grafana Dashboard Templates
- RED metrics dashboard (Rate, Errors, Duration)
- Service overview with health indicators
- Endpoint-level latency percentiles (p50, p95, p99)
- Error rate breakdown by status code

### Alert Rule Scaffolding
- SLO-based burn rate alerts
- Error rate threshold alerts
- Latency p99 threshold alerts
- Alert routing and severity classification

## Related Skills
- `ci-cd-pipeline-design` — for deploying observability configuration
- `error-handling-patterns` — for consistent error logging and classification
