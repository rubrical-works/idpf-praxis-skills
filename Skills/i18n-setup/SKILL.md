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
# i18n Setup
Scaffolds i18n for web/mobile apps: string externalization, locale formatting, translation workflows.
**Companion Domain:** Domains/i18n — provides evaluative review criteria
## When to Use
- Setting up i18n for a new project
- Configuring i18next, react-intl, or FormatJS
- Creating locale file structure and naming conventions
- Setting up string extraction tooling
- Establishing translation management workflow
## Capabilities
**Library Config:** i18next/react-intl/FormatJS with plugins, language detection (browser/URL/cookie/user preference), fallback chains, namespace organization
**String Extraction:** Extract message IDs, generate templates, detect hardcoded strings, key naming enforcement
**Locale Scaffolding:** Per-locale dirs (`locales/en/`, `locales/fr/`), JSON/YAML templates, namespace organization, default locale placeholders
**Translation Workflow:** Crowdin/Lokalise config, CI sync, PR workflow for updates, context/screenshots for translators
## Related Skills
- `seo-optimization` — hreflang tags and locale-specific URLs
- `error-handling-patterns` — localized error messages
