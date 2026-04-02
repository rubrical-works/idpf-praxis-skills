# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| latest  | Yes       |

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it responsibly.

**Do not open a public GitHub issue for security vulnerabilities.**

Instead, please use [GitHub Security Advisories](https://github.com/rubrical-works/idpf-skills-dev/security/advisories/new) to report the vulnerability privately.

You can expect:

- **Acknowledgment** within 48 hours
- **Assessment** within 5 business days
- **Fix or mitigation** based on severity

## Scope

This policy covers:

- Skill content (SKILL.md, resources, scripts)
- Build and packaging scripts
- CI/CD workflows
- Distribution pipeline

## Security Considerations

- **Skill scripts** (`scripts/`, `lib/`) execute in the user's environment via Claude Code. Scripts are reviewed for safe patterns before inclusion.
- **JSON schemas** validate structure only and do not execute code.
- **Markdown content** is rendered by GitHub and Claude Code — no executable content.

## License

Individual skills include `LICENSE.txt` files. The repository is licensed under [Apache License 2.0](LICENSE).
