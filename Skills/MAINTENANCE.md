# Skills Maintenance Process
**Version:** v0.2.0

**Purpose:** Define the process for reviewing, updating, versioning, and releasing skills in the IDPF Framework.

**Related Documents:**
- `Reference/Skill-Packaging-Guide.md` - How to create and package skills
- `Assistant/Anti-Hallucination-Rules-for-Skill-Creation.md` - Accuracy rules for skill creation
- `PREPARE_RELEASE.md` (Phase 2a) - Release validation that references this document

---

## Skill Registry

| Skill | Version | Last Updated | Status |
|-------|---------|--------------|--------|
| anti-pattern-analysis | 1.0.0 | 2026-03-17 | Active |
| api-versioning | 1.0.0 | 2026-03-17 | Active |
| astro-development | 1.0.0 | 2026-03-17 | Active |
| bdd-writing | 1.0.0 | 2026-03-17 | Active |
| beginner-testing | 1.0.0 | 2026-03-17 | Active |
| ci-cd-pipeline-design | 1.0.0 | 2026-03-17 | Active |
| code-path-discovery | 1.0.0 | 2026-03-17 | Active |
| codebase-analysis | 1.0.0 | 2026-03-17 | Active |
| command-spec-audit | 1.0.0 | 2026-03-17 | Active |
| common-errors | 1.0.0 | 2026-03-17 | Active |
| digitalocean-app-setup | 1.0.0 | 2026-03-17 | Active |
| drawio-generation | 1.0.0 | 2026-03-17 | Active |
| electron-cross-build | 1.0.0 | 2026-03-17 | Active |
| electron-development | 1.0.0 | 2026-03-17 | Active |
| error-handling-patterns | 1.0.0 | 2026-03-17 | Active |
| flask-setup | 1.0.0 | 2026-03-17 | Active |
| i18n-setup | 1.0.0 | 2026-03-17 | Active |
| migration-patterns | 1.0.0 | 2026-03-17 | Active |
| mutation-testing | 1.0.0 | 2026-03-17 | Active |
| observability-setup | 1.0.0 | 2026-03-17 | Active |
| playwright-explorer | 1.0.0 | 2026-03-17 | Active |
| playwright-setup | 1.0.0 | 2026-03-17 | Active |
| postgresql-integration | 1.0.0 | 2026-03-17 | Active |
| privacy-compliance | 1.0.0 | 2026-03-17 | Active |
| property-based-testing | 1.0.0 | 2026-03-17 | Active |
| railway-project-setup | 1.0.0 | 2026-03-17 | Active |
| render-project-setup | 1.0.0 | 2026-03-17 | Active |
| resilience-patterns | 1.0.0 | 2026-03-17 | Active |
| seo-optimization | 1.0.0 | 2026-03-17 | Active |
| sinatra-setup | 1.0.0 | 2026-03-17 | Active |
| sqlite-integration | 1.0.0 | 2026-03-17 | Active |
| tdd-failure-recovery | 1.0.0 | 2026-03-17 | Active |
| tdd-green-phase | 1.0.0 | 2026-03-17 | Active |
| tdd-red-phase | 1.0.0 | 2026-03-17 | Active |
| tdd-refactor-phase | 1.0.0 | 2026-03-17 | Active |
| test-scaffold | 1.0.0 | 2026-03-17 | Active |
| test-writing-patterns | 1.0.0 | 2026-03-17 | Active |
| vercel-project-setup | 1.0.0 | 2026-03-17 | Active |

**Status Values:** Active, Deprecated, Archived

---

## Skill Versioning Policy

Skills use independent semantic versioning, decoupled from the framework version.

| Version Type | When to Bump | Examples |
|-------------|--------------|----------|
| **Patch** (1.0.x) | Typo fixes, clarifications, link updates. No functional changes. | 1.0.0 → 1.0.1 |
| **Minor** (1.x.0) | New sections, examples, expanded coverage. Backward compatible. | 1.0.1 → 1.1.0 |
| **Major** (x.0.0) | Significant restructuring, breaking changes to skill interface. | 1.2.0 → 2.0.0 |

**Version lives in:** `SKILL.md` frontmatter (`version` field).
**Compatibility range:** `frameworkCompatibility` in SKILL.md (e.g., `>=0.60.0`).
**Source of truth:** `skill-registry.json` aggregates all skill versions for downstream tools.

---

## Framework-Skill Dependency Matrix

| Framework | Required Skills |
|-----------|----------------|
| IDPF-Agile | tdd-red-phase, tdd-green-phase, tdd-refactor-phase, tdd-failure-recovery, test-writing-patterns |
| IDPF-Vibe (vibe-newbie) | flask-setup, sinatra-setup, common-errors, sqlite-integration, beginner-testing |
| IDPF-Vibe (other variants) | (none currently) |

**Standalone Skills (not framework-specific):**
- anti-pattern-analysis - Code review and technical debt detection
- api-versioning - API versioning strategies and deprecation workflows
- bdd-writing - BDD specification writing
- ci-cd-pipeline-design - CI/CD pipeline architecture and security
- code-path-discovery - Scan source files for behavioral paths in 6-category format
- codebase-analysis - Analyze codebases for structure, tech stack, and patterns
- electron-cross-build - Cross-platform Electron builds for Windows, macOS, and Linux
- electron-development - Electron app development with Vite, Playwright, Windows considerations
- error-handling-patterns - Error hierarchy and API error responses
- i18n-setup - Internationalization setup and locale management
- migration-patterns - Database schema versioning and rollback procedures
- mutation-testing - Mutation testing operators and score interpretation
- observability-setup - Application observability with logging, metrics, and tracing
- playwright-explorer - Interactive Playwright browser exploration and DOM inspection
- playwright-setup - Playwright installation verification and CI configuration
- postgresql-integration - PostgreSQL connection setup and query patterns
- privacy-compliance - Privacy compliance patterns for consent, cookies, and regulations
- property-based-testing - Property-based testing patterns and shrinking
- seo-optimization - SEO best practices for web project discoverability

**Deployment Platform Skills:**
- digitalocean-app-setup - DigitalOcean App Platform deployment with review apps
- railway-project-setup - Railway deployment with Nixpacks and preview environments
- render-project-setup - Render deployment with Blueprints and preview environments
- vercel-project-setup - Vercel deployment with preview deployments and edge functions

**Update this matrix when skills or framework dependencies change.**

---

## Review Schedule

**Frequency:** Quarterly (every 3 months)

**Review Months:** March, June, September, December

**Trigger:** Manual review or when significant changes occur in:
- Underlying technology (language, framework, library updates)
- Best practices (industry standards evolve)
- User feedback (issues reported)

---

## Review Checklist

When reviewing a skill, verify the following:

### Content Accuracy
- [ ] All code examples compile/run correctly
- [ ] Referenced tools and libraries still exist
- [ ] Version numbers in examples are current
- [ ] Best practices are still current

### Links and References
- [ ] All external links are valid
- [ ] Documentation references are current
- [ ] Related skills are correctly referenced

### Completeness
- [ ] Common use cases are covered
- [ ] Error scenarios are documented
- [ ] Troubleshooting section is helpful

### Quality
- [ ] Instructions are clear and actionable
- [ ] Examples match the target audience level
- [ ] No outdated or deprecated patterns

---

## Skill File Structure

Every skill MUST have:

```
Skills/[skill-name]/
├── SKILL.md          # Main skill documentation (REQUIRED)
├── LICENSE.txt       # License file (REQUIRED)
└── resources/        # Supporting files (OPTIONAL)
    └── *.md, *.json, etc.
```

### SKILL.md Header Format

```markdown
# Skill: [skill-name]

**Version:** X.Y.Z
**Category:** [TDD | BDD | Setup | Integration | Analysis]

## Purpose
[Brief description]
```

---

## Update Workflow

### 1. Patch Updates (1.0.x)
- Typo fixes, clarifications, link updates
- No functional changes to guidance

```bash
# Update SKILL.md content
# Bump version: 1.0.0 → 1.0.1
# Update lastUpdated date
# Re-package skill
```

### 2. Minor Updates (1.x.0)
- New sections or examples added
- Expanded coverage of existing topics

```bash
# Update SKILL.md content
# Bump version: 1.0.x → 1.1.0
# Update lastUpdated date
# Update registry in MAINTENANCE.md
# Re-package skill
```

### 3. Major Updates (x.0.0)
- Significant restructuring
- Breaking changes to skill interface
- New resource files added

```bash
# Update SKILL.md content
# Bump version: 1.x.x → 2.0.0
# Update lastUpdated date and frameworkCompatibility if needed
# Update registry in MAINTENANCE.md
# Re-package skill
```

---

## Packaging Skills

### Source Files

**IMPORTANT:** Skill packages are built from **minimized sources** in `.min-mirror/Skills/`, NOT from the source `Skills/` directories.

| Content | Source Location |
|---------|-----------------|
| SKILL.md | `.min-mirror/Skills/[skill-name]/SKILL.md` |
| LICENSE.txt | `Skills/[skill-name]/LICENSE.txt` (not minimized) |
| resources/ | `.min-mirror/Skills/[skill-name]/resources/` |

### Package Command

```powershell
# CRITICAL: Run from repository root
cd "E:\Projects\idpf-praxis"

# Windows with 7-Zip (RECOMMENDED):
# Package from .min-mirror sources
"C:\Program Files\7-Zip\7z.exe" a -tzip "Skills\Packaged\skill-name.zip" ".\.min-mirror\Skills\skill-name\SKILL.md" ".\Skills\skill-name\LICENSE.txt" ".\.min-mirror\Skills\skill-name\resources"

# Unix (from repository root):
zip -j Skills/Packaged/skill-name.zip .min-mirror/Skills/skill-name/SKILL.md Skills/skill-name/LICENSE.txt && \
zip -r Skills/Packaged/skill-name.zip .min-mirror/Skills/skill-name/resources -x "*.md"
```

### Package Validation

```bash
# Verify zip contents (Unix)
for zip in Skills/Packaged/*.zip; do echo "=== $zip ==="; unzip -l "$zip"; done

# Windows PowerShell
Get-ChildItem Skills/Packaged/*.zip | ForEach-Object { Write-Host "=== $($_.Name) ==="; & 7z l $_.FullName }
```

**Package must contain:**
- SKILL.md (minimized, with valid YAML frontmatter)
- LICENSE.txt
- resources/ (if applicable, minimized)

**Package must NOT contain:**
- Non-minimized versions of SKILL.md

---

## Pre-Release Checklist

Before framework release, verify:

### 1. Skill Inventory Audit
- [ ] List all skill directories in `Skills/`
- [ ] List all minimized skill directories in `.min-mirror/Skills/`
- [ ] List all `.zip` files in `Skills/Packaged/`
- [ ] Verify 1:1 match between source directories and `.zip` files
- [ ] Verify minimized sources exist for all skills
- [ ] Identify any new skills added since last release
- [ ] Identify any deprecated/removed skills

**Audit Commands:**

```bash
# List skill directories (Unix)
ls -d Skills/*/

# List minimized skill directories
ls -d .min-mirror/Skills/*/

# List skill zip files
ls Skills/Packaged/*.zip

# Windows PowerShell
Get-ChildItem -Directory Skills
Get-ChildItem -Directory .min-mirror/Skills
Get-ChildItem Skills/Packaged/*.zip
```

### 2. Package Validation
For each skill, verify:
- [ ] `.min-mirror/Skills/[skill]/SKILL.md` exists and is minimized
- [ ] `SKILL.md` has valid YAML frontmatter (`name`, `description`)
- [ ] `Skills/[skill]/LICENSE.txt` exists and is complete
- [ ] `resources/` directory contains all referenced files (in `.min-mirror/`)
- [ ] `.zip` built from `.min-mirror/` sources (NOT from `Skills/` directly)

### 3. Install Script Synchronization
For `install.js`, verify:
- [ ] Skill list matches inventory
- [ ] Framework mappings match dependency matrix above
- [ ] Extraction paths correct: `.claude/skills/[skill-name]/`
- [ ] New skills included in framework mappings
- [ ] Removed skills cleaned from framework mappings

**Verification Location:**

| Script | Mapping Location |
|--------|-----------------|
| `install/lib/constants.js` | `FRAMEWORK_SKILLS` and `VIBE_VARIANT_SKILLS` objects |

### 4. Cross-Reference Validation
- [ ] `Framework-Overview.md` skill count matches registry count
- [ ] `Framework-Overview.md` skill descriptions match `SKILL.md` content
- [ ] No orphaned skills (in directory but not mapped)
- [ ] No missing skills (referenced but `.zip` missing)

---

## Creating New Skills

1. Copy template structure from existing skill
2. Create SKILL.md with required header
3. Add LICENSE.txt
4. Add to registry in this file
5. Add to dependency matrix if framework-specific
6. Package and add to Skills/Packaged/
7. Update install scripts if framework-specific
8. Update Framework-Overview.md

---

## Deprecation Process

When a skill becomes obsolete:

1. **Mark as Deprecated** in registry (Status: Deprecated)
2. **Add deprecation notice** to top of SKILL.md
3. **Remove from install script mappings** in `install/lib/constants.js`
4. **Update dependency matrix** in this file
5. **Keep for 2 review cycles** (6 months)
6. **Archive** - Move to Skills/Archived/ directory
7. **Remove from Packaged/** - Delete zip file
8. **Update Framework-Overview.md** to remove references
9. **Document removal** in CHANGELOG.md

---

## Troubleshooting

### Skill Not Deploying

1. Check `.zip` file exists in `Skills/Packaged/` directory
2. Verify skill name matches exactly (case-sensitive on Unix)
3. Check extraction tool available (unzip on Unix, PowerShell on Windows)
4. Verify `SKILL.md` exists in `.zip` root

### Minimization Issues

1. Verify `.min-mirror/Skills/[skill]/SKILL.md` exists
2. Ensure minimized file retains YAML frontmatter
3. Check that `.zip` was built from `.min-mirror/` not `Skills/` source
4. Re-run minimization process if sources are out of sync

### Skill Deployed But Not Recognized

1. Verify `SKILL.md` has valid YAML frontmatter
2. Check `name` field matches directory name
3. Ensure `description` field is present and under 1024 characters
4. Restart Claude Code session after deployment

### Framework-Skill Mismatch

1. Compare `install/lib/constants.js` mappings with dependency matrix above
2. Verify no typos in skill names

---

**End of Skills Maintenance Process**
