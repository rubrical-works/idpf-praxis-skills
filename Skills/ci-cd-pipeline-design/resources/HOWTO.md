# Using ci-cd-pipeline-design Without IDPF Framework

Guide developers through CI/CD pipeline design including architecture patterns, stage design, and security considerations.

## What's Included

| File | Purpose |
|------|---------|
| `SKILL.md` | Complete CI/CD pipeline design guide covering architecture, stages, deployment strategies, and platform examples |
| `resources/architecture-patterns.md` | Pipeline architecture patterns (linear, parallel, fan-out/fan-in, multi-environment) |
| `resources/stage-design.md` | Detailed stage design guidance for build, test, security, and deploy stages |
| `resources/platform-examples.md` | Platform-specific configurations for GitHub Actions, GitLab CI, Jenkins, and others |
| `resources/security-checklist.md` | Security considerations checklist for secrets, SAST, supply chain, and containers |

## Quick Start

> This is one approach. Adapt it to your project's structure.

1. Install the skill into your project (e.g., via Praxis Hub Manager or by placing it in `.claude/skills/ci-cd-pipeline-design/`)
2. Add a rule in `.claude/rules/` or `CLAUDE.md` that references it:

```
When designing CI/CD pipelines, configuring workflow files, setting up deployment stages,
or reviewing pipeline security, load and follow the guidance in
.claude/skills/ci-cd-pipeline-design/SKILL.md and its resources/.
Use the platform examples for the target CI system and the security checklist before merging pipeline changes.
```

## Customization

- Focus `platform-examples.md` on your CI/CD platform and remove others to reduce context size
- Tailor the `security-checklist.md` to your organization's compliance requirements (e.g., add SOC2 or HIPAA-specific gates)
- Extend `architecture-patterns.md` with your team's preferred deployment strategy (canary, blue-green, etc.)

## How IDPF Projects Use This

In IDPF projects, the ci-cd-pipeline-design skill is loaded as a reference skill when the developer is working on pipeline configuration or deployment infrastructure. The approach above replicates that behavior for any Claude Code project.
