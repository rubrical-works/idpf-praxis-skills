---
name: i18n-setup
description: Scaffold internationalization infrastructure including i18n library config, string extraction tooling, locale file scaffolding, and translation workflow setup
version: "2.0.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-04-25"
license: Complete terms in LICENSE.txt
category: platform
type: invokable
relevantTechStack: [i18n, i18next, react-intl, formatjs, localization]
copyright: "Rubrical Works (c) 2026"
---
# Internationalization (i18n) Setup
Scaffolds internationalization infrastructure for web and mobile applications. Provides concrete configuration templates and implementation patterns for string externalization, locale-aware formatting, translation workflows.
**Companion Domain:** Domains/i18n — provides evaluative review criteria
## Step 0 — Re-read Config (MANDATORY)
Read `resources/i18n-setup.config.json` from disk and validate against `resources/i18n-setup.config.schema.json` at start of every invocation. Config is source of truth for supported i18n libraries and their install commands, locale directory pattern, language-detection source order, supported translation platforms (Crowdin, Lokalise) with action/CLI pins. SKILL.md must not duplicate values.
## When to Use This Skill
Invoke when:
- Setting up i18n for a new web or mobile project
- Configuring i18next, react-intl, or FormatJS
- Creating locale file structure and naming conventions
- Setting up string extraction tooling for developers
- Establishing a translation management workflow
## Responsibility Acknowledgement Gate
Implements pattern in **`responsibility-gate`** skill. See `Skills/responsibility-gate/SKILL.md`.
- **When this fires:** before installing i18n libraries (i18next, react-intl, or FormatJS) and scaffolding locale directories, translation files, and extraction tooling into the project.
- **What is asked:** acceptance of responsibility for change to `package.json`/`node_modules`, source files (i18n init code), and new locale file structure (`locales/**`).
- **On decline:** exit cleanly; report "Declined — no changes made."; no system changes.
- **Persistence:** per-invocation; never persisted.
Use `AskUserQuestion` with two required options (`"I accept responsibility — proceed"` and `"Decline — exit without changes"`).
## Scaffolding Capabilities
### i18n Library Configuration
- i18next or react-intl/FormatJS setup with plugins
- Language detection (browser, URL, cookie, user preference)
- Fallback locale chain configuration
- Namespace organization for large applications
### String Extraction Tooling
- Extract message IDs from source code
- Generate translation file templates
- Detect hardcoded strings in source files
- Key naming convention enforcement
### Locale File Scaffolding
- Directory structure per locale (`locales/en/`, `locales/fr/`)
- JSON or YAML translation file templates
- Namespace-based file organization
- Default locale with placeholder content
### Translation Workflow Setup
- Crowdin or Lokalise project configuration
- CI integration for translation file sync
- Pull request workflow for translation updates
- Context and screenshot attachment for translators
## Resources
| File | Purpose |
|------|---------|
| `resources/i18n-setup.config.json` | Volatile knobs (supported libraries + install commands, locale dir pattern, language-detection sources, translation platforms). Re-read at every invocation. |
| `resources/i18n-setup.config.schema.json` | JSON Schema validating the config. |
| `docs/i18n-setup-rationale.md` | Original prose rationale preserved during refurbishment. |
## Related Skills
- `seo-optimization` — for hreflang tags and locale-specific URLs
- `error-handling-patterns` — for localized error messages
