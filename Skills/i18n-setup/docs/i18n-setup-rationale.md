# i18n-setup Rationale

Preserved prose from the original SKILL.md. The skill is mostly conceptual — this rationale captures the volatile-knob extraction decisions.

## Three supported libraries

The config records `supportedLibraries.i18next`, `react-intl`, and `formatjs` because these are the three live web/React i18n choices in 2026. `react-intl` is the legacy name for FormatJS's React bindings; both are documented separately because they appear in different framework templates.

## Locale directory pattern

`locales/{locale}/{namespace}.json` is the convention used by i18next, react-intl, and most CI integrations. Recorded as `localeStructure.namespaceFilePattern` so the skill can scaffold the structure without hardcoding the path.

## Translation platforms

Crowdin and Lokalise are the dominant managed translation platforms. The config records the per-platform config-file convention and (for Crowdin) the GitHub Action `uses:` pin. New platforms can be added as a JSON edit.

## Default namespaces

`common` and `errors` are the namespaces the skill scaffolds by default — `common` for shared UI strings, `errors` for user-facing error messages (which often need slightly different review). Recorded so the skill is consistent across invocations.
