# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in any skill package distributed through this repository, please report it responsibly.

**Do NOT open a public issue.** Instead, use [GitHub Private Vulnerability Reporting](https://github.com/rubrical-works/idpf-praxis-skills/security/advisories/new) to submit your report.

### What to Include

- Description of the vulnerability
- Affected skill package(s) and version(s)
- Steps to reproduce
- Potential impact

### Response Timeline

- **Acknowledgment:** Within 72 hours
- **Assessment:** Within 7 days
- **Fix (if confirmed):** Prioritized based on severity

## Scope

### In Scope

- Skill packages distributed in this repository (`Skills/`)
- Metadata and registry files (`.claude/metadata/`)
- Checksums and integrity mechanisms

### Out of Scope

- The IDPF framework itself (report to the framework repository)
- Claude Code or Anthropic products (report to [Anthropic](https://www.anthropic.com))
- Third-party dependencies (report to the upstream maintainer)

## Integrity Verification

Each release includes a `checksums.json` file. Verify downloaded packages against these checksums to ensure integrity.

## Supported Versions

Only the latest release is actively supported with security updates.
