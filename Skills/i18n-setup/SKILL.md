---
name: i18n-setup
description: Scaffold internationalization infrastructure including i18n library config, string extraction tooling, locale file scaffolding, and translation workflow setup
version: "1.0.0"
frameworkCompatibility: ">=0.60.0"
lastUpdated: "2026-03-17"
license: Complete terms in LICENSE.txt
category: web
type: invokable
relevantTechStack: [i18n, i18next, react-intl, formatjs, localization]
copyright: "Rubrical Works (c) 2026"
---
# Internationalization (i18n) Setup
Scaffolds i18n infrastructure for web/mobile apps: config templates and implementation patterns for string externalization, locale-aware formatting, and translation workflows.
**Companion Domain:** Domains/i18n — evaluative review criteria
## When to Use
- Setting up i18n for new web/mobile project
- Configuring i18next, react-intl, or FormatJS
- Creating locale file structure and naming conventions
- String extraction tooling setup
- Translation management workflow
## Responsibility Acknowledgement Gate
Implements `responsibility-gate` pattern. See `Skills/responsibility-gate/SKILL.md`.
- **Fires:** before installing i18n libraries (i18next, react-intl, FormatJS) and scaffolding locale dirs, translation files, extraction tooling.
- **Asks:** accept responsibility for changes to `package.json`/`node_modules`, source files (i18n init code), new locale structure (`locales/**`).
- **On decline:** exit cleanly; "Declined — no changes made."
- **Persistence:** per-invocation.
Use `AskUserQuestion` with `"I accept responsibility — proceed"` and `"Decline — exit without changes"`.
## Scaffolding Capabilities
### i18n Library Configuration
- i18next or react-intl/FormatJS setup with plugins
- Language detection (browser, URL, cookie, user preference)
- Fallback locale chain
- Namespace organization
### String Extraction Tooling
- Extract message IDs from source
- Generate translation file templates
- Detect hardcoded strings
- Key naming convention enforcement
### Locale File Scaffolding
- Per-locale directory (`locales/en/`, `locales/fr/`)
- JSON/YAML translation templates
- Namespace-based file organization
- Default locale with placeholders
### Translation Workflow Setup
- Crowdin or Lokalise project config
- CI integration for translation sync
- PR workflow for translation updates
- Context/screenshot attachments for translators
## Related Skills
- `seo-optimization` — hreflang tags, locale URLs
- `error-handling-patterns` — localized error messages
