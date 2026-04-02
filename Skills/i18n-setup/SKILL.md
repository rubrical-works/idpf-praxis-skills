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
**Companion Domain:** Domains/i18n -- provides evaluative review criteria
## When to Use
- Setting up i18n for a new web or mobile project
- Configuring i18next, react-intl, or FormatJS
- Creating locale file structure and naming conventions
- Setting up string extraction tooling
- Establishing a translation management workflow
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
## Related Skills
- `seo-optimization` -- for hreflang tags and locale-specific URLs
- `error-handling-patterns` -- for localized error messages
