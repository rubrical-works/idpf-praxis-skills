#!/usr/bin/env node
/**
 * test-coverage-audit.js
 *
 * Audits newly added source files against language-specific test pairing
 * conventions. Bundled with the tdd-refactor-coverage-audit skill.
 *
 * Usage:
 *   node test-coverage-audit.js --since-commit <sha> [--config-only] [--json]
 *
 * Resolves all bundled assets via __dirname (no absolute or framework-hub
 * paths). Optional project overrides come from
 * <project-root>/framework-config.json -> testCoverageAudit.
 *
 * Output (JSON to stdout):
 *   {
 *     ok: boolean,
 *     newSources: number,
 *     missingTests: [{ file, language, expected: [pattern, ...] }, ...],
 *     coverage: number   // 0..1, paired / total
 *   }
 *
 * Exit codes:
 *   0 - script ran (advisory output, never blocks the TDD gate)
 *   2 - usage error or schema validation failure (returns ok:false)
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const SKILL_DIR = path.resolve(__dirname, '..');
const CONVENTIONS_PATH = path.join(SKILL_DIR, 'resources', 'test-coverage-conventions.json');
const SCHEMA_PATH = path.join(SKILL_DIR, 'resources', 'test-coverage-conventions-schema.json');

// ---------- arg parsing ----------

function parseArgs(argv) {
  const args = { sinceCommit: null, configOnly: false, json: true, projectRoot: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--since-commit') args.sinceCommit = argv[++i];
    else if (a.startsWith('--since-commit=')) args.sinceCommit = a.slice('--since-commit='.length);
    else if (a === '--config-only') args.configOnly = true;
    else if (a === '--project-root') args.projectRoot = argv[++i];
    else if (a.startsWith('--project-root=')) args.projectRoot = a.slice('--project-root='.length);
    else if (a === '--json') args.json = true;
    else if (a === '--help' || a === '-h') args.help = true;
  }
  return args;
}

function usage() {
  return [
    'Usage: node test-coverage-audit.js --since-commit <sha> [--config-only]',
    '',
    'Audits newly added source files for paired tests using bundled language',
    'conventions. Optionally merges framework-config.json -> testCoverageAudit.',
    '',
    'Flags:',
    '  --since-commit <sha>   Compare against this commit (required unless --config-only)',
    '  --config-only          Print resolved config and exit',
    '  --project-root <path>  Override project root (default: git toplevel)',
    '  -h, --help             Show this help'
  ].join('\n');
}

// ---------- minimal JSON Schema validator ----------
// Supports the subset used by test-coverage-conventions-schema.json:
// type, required, properties, additionalProperties, items, minItems,
// minProperties, minimum, maximum, pattern, $ref (#/$defs/...), $defs.

function loadJson(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(text);
}

function resolveRef(root, ref) {
  if (!ref.startsWith('#/')) throw new Error('Only local $ref supported: ' + ref);
  const parts = ref.slice(2).split('/');
  let cur = root;
  for (const p of parts) cur = cur[p];
  return cur;
}

function validate(schema, data, root, pathStr, errors) {
  if (!schema) return;
  if (schema.$ref) {
    return validate(resolveRef(root, schema.$ref), data, root, pathStr, errors);
  }
  if (schema.type) {
    const t = schema.type;
    const ok =
      (t === 'object' && data !== null && typeof data === 'object' && !Array.isArray(data)) ||
      (t === 'array' && Array.isArray(data)) ||
      (t === 'string' && typeof data === 'string') ||
      (t === 'integer' && Number.isInteger(data)) ||
      (t === 'number' && typeof data === 'number') ||
      (t === 'boolean' && typeof data === 'boolean');
    if (!ok) {
      errors.push(`${pathStr || '<root>'}: expected type ${t}`);
      return;
    }
  }
  if (schema.type === 'object') {
    if (Array.isArray(schema.required)) {
      for (const k of schema.required) {
        if (!(k in data)) errors.push(`${pathStr || '<root>'}: missing required field '${k}'`);
      }
    }
    if (typeof schema.minProperties === 'number') {
      if (Object.keys(data).length < schema.minProperties) {
        errors.push(`${pathStr || '<root>'}: minProperties ${schema.minProperties}`);
      }
    }
    if (schema.properties) {
      for (const [k, sub] of Object.entries(schema.properties)) {
        if (k in data) validate(sub, data[k], root, pathStr ? `${pathStr}.${k}` : k, errors);
      }
    }
    if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
      const known = new Set(Object.keys(schema.properties || {}));
      for (const [k, v] of Object.entries(data)) {
        if (!known.has(k)) {
          validate(schema.additionalProperties, v, root, pathStr ? `${pathStr}.${k}` : k, errors);
        }
      }
    }
  }
  if (schema.type === 'array') {
    if (typeof schema.minItems === 'number' && data.length < schema.minItems) {
      errors.push(`${pathStr}: minItems ${schema.minItems}`);
    }
    if (schema.items) {
      data.forEach((item, i) => validate(schema.items, item, root, `${pathStr}[${i}]`, errors));
    }
  }
  if (schema.type === 'string' && schema.pattern) {
    const re = new RegExp(schema.pattern);
    if (!re.test(data)) errors.push(`${pathStr}: does not match pattern ${schema.pattern}`);
  }
  if ((schema.type === 'number' || schema.type === 'integer')) {
    if (typeof schema.minimum === 'number' && data < schema.minimum) {
      errors.push(`${pathStr}: below minimum ${schema.minimum}`);
    }
    if (typeof schema.maximum === 'number' && data > schema.maximum) {
      errors.push(`${pathStr}: above maximum ${schema.maximum}`);
    }
  }
}

function validateSchema(schema, data) {
  const errors = [];
  validate(schema, data, schema, '', errors);
  return errors;
}

// ---------- config loading and merging ----------

function loadProjectOverride(projectRoot) {
  const cfgPath = path.join(projectRoot, 'framework-config.json');
  if (!fs.existsSync(cfgPath)) return null;
  try {
    const cfg = loadJson(cfgPath);
    return cfg.testCoverageAudit || null;
  } catch (_) {
    return null;
  }
}

function mergeConfig(conventions, override) {
  const merged = {
    languages: { ...conventions.languages },
    ignoredSourcePatterns: [...(conventions.ignoredSourcePatterns || [])],
    minTestCoverageRatio: 0
  };
  if (!override) return merged;
  if (override.additionalLanguages) {
    for (const [name, def] of Object.entries(override.additionalLanguages)) {
      merged.languages[name] = def;
    }
  }
  if (Array.isArray(override.ignoredSourcePatterns)) {
    merged.ignoredSourcePatterns.push(...override.ignoredSourcePatterns);
  }
  if (typeof override.minTestCoverageRatio === 'number') {
    merged.minTestCoverageRatio = override.minTestCoverageRatio;
  }
  return merged;
}

// ---------- glob matching (minimal: **, *, literal) ----------

function globToRegex(glob) {
  // Escape regex specials except *, ?, /
  let re = '';
  let i = 0;
  while (i < glob.length) {
    const c = glob[i];
    if (c === '*' && glob[i + 1] === '*') {
      re += '.*';
      i += 2;
      if (glob[i] === '/') i++;
    } else if (c === '*') {
      re += '[^/]*';
      i++;
    } else if (c === '?') {
      re += '[^/]';
      i++;
    } else if ('.+^$()|[]{}\\'.includes(c)) {
      re += '\\' + c;
      i++;
    } else {
      re += c;
      i++;
    }
  }
  return new RegExp('^' + re + '$');
}

function matchAny(file, patterns) {
  if (!patterns || !patterns.length) return false;
  return patterns.some((p) => globToRegex(p).test(file));
}

// ---------- language detection ----------

function detectLanguage(file, languages) {
  for (const [name, def] of Object.entries(languages)) {
    for (const ext of def.sourceExtensions) {
      if (file.endsWith(ext)) {
        if (matchAny(file, def.excludePatterns)) return null;
        return { name, def };
      }
    }
  }
  return null;
}

// ---------- pattern substitution ----------

function expandTestPatterns(file, patterns) {
  const ext = path.extname(file);
  const stem = path.basename(file, ext);
  const dir = path.dirname(file);
  const dirNorm = dir === '.' ? '' : dir;
  return patterns.map((p) => {
    let out = p.replaceAll('{stem}', stem).replaceAll('{dir}', dirNorm);
    // Collapse leading "/" from {dir} substitution when dir was empty
    out = out.replace(/^\/+/, '');
    return out;
  });
}

// ---------- inline test detection (Rust) ----------

function hasInlineTests(absPath) {
  try {
    const content = fs.readFileSync(absPath, 'utf8');
    return /#\[cfg\(test\)\]/.test(content) || /\bmod\s+tests\s*\{/.test(content);
  } catch (_) {
    return false;
  }
}

// ---------- git ----------

function getProjectRoot(override) {
  if (override) return path.resolve(override);
  try {
    const out = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' });
    return out.trim();
  } catch (_) {
    return process.cwd();
  }
}

function getNewFiles(projectRoot, sinceCommit) {
  const out = execFileSync(
    'git',
    ['diff', '--name-status', '--diff-filter=A', `${sinceCommit}..HEAD`],
    { cwd: projectRoot, encoding: 'utf8' }
  );
  return out
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split(/\s+/).slice(1).join(' '))
    .filter(Boolean);
}

// ---------- file existence ----------

function testFileExists(projectRoot, expanded) {
  for (const candidate of expanded) {
    if (candidate.includes('*')) {
      // Glob candidate — walk projectRoot and match. Limited usage; do a
      // shallow check via fs walk under the first non-glob ancestor.
      const re = globToRegex(candidate);
      // Cheap version: check if any file under projectRoot matches.
      // For audit purposes, pattern matching against actual file list is fine.
      // Use a bounded walker.
      if (walkAndMatch(projectRoot, re)) return true;
    } else {
      const abs = path.join(projectRoot, candidate);
      if (fs.existsSync(abs)) return true;
    }
  }
  return false;
}

function walkAndMatch(root, re, current = '', depth = 0) {
  if (depth > 8) return false;
  let entries;
  try {
    entries = fs.readdirSync(path.join(root, current), { withFileTypes: true });
  } catch (_) {
    return false;
  }
  for (const e of entries) {
    if (e.name === 'node_modules' || e.name === '.git' || e.name === 'dist' || e.name === 'build') continue;
    const rel = current ? `${current}/${e.name}` : e.name;
    if (e.isDirectory()) {
      if (walkAndMatch(root, re, rel, depth + 1)) return true;
    } else if (re.test(rel)) {
      return true;
    }
  }
  return false;
}

// ---------- main audit ----------

function audit(args) {
  // Load + validate conventions
  let conventions, schema;
  try {
    conventions = loadJson(CONVENTIONS_PATH);
    schema = loadJson(SCHEMA_PATH);
  } catch (e) {
    return { ok: false, error: 'Failed to load bundled conventions/schema: ' + e.message };
  }

  let errors = validateSchema(schema, conventions);
  if (errors.length) {
    return { ok: false, error: 'Bundled conventions failed schema validation', details: errors };
  }

  const projectRoot = getProjectRoot(args.projectRoot);
  const override = loadProjectOverride(projectRoot);
  if (override) {
    errors = validateSchema(schema, override);
    if (errors.length) {
      return {
        ok: false,
        error: 'framework-config.json -> testCoverageAudit failed schema validation',
        details: errors
      };
    }
  }
  const merged = mergeConfig(conventions, override);

  if (args.configOnly) {
    return { ok: true, configOnly: true, projectRoot, languages: Object.keys(merged.languages), config: merged };
  }

  if (!args.sinceCommit) {
    return { ok: false, error: '--since-commit <sha> required (or use --config-only)' };
  }

  let newFiles;
  try {
    newFiles = getNewFiles(projectRoot, args.sinceCommit);
  } catch (e) {
    return { ok: false, error: 'git diff failed: ' + e.message };
  }

  const missingTests = [];
  let totalSources = 0;
  let pairedSources = 0;

  for (const file of newFiles) {
    if (matchAny(file, merged.ignoredSourcePatterns)) continue;
    const lang = detectLanguage(file, merged.languages);
    if (!lang) continue;
    // Skip files that look like tests themselves (matched as sources only by extension)
    if (lang.def.testPatterns.some((p) => {
      const expanded = expandTestPatterns(file, [p]);
      return expanded[0] === file;
    })) {
      continue;
    }
    totalSources += 1;

    let paired = false;
    if (lang.def.inlineTests && hasInlineTests(path.join(projectRoot, file))) {
      paired = true;
    } else {
      const expanded = expandTestPatterns(file, lang.def.testPatterns);
      if (testFileExists(projectRoot, expanded)) paired = true;
    }

    if (paired) {
      pairedSources += 1;
    } else {
      missingTests.push({
        file,
        language: lang.name,
        expected: expandTestPatterns(file, lang.def.testPatterns)
      });
    }
  }

  const coverage = totalSources === 0 ? 1 : pairedSources / totalSources;
  return {
    ok: true,
    newSources: totalSources,
    pairedSources,
    missingTests,
    coverage: Number(coverage.toFixed(4)),
    minTestCoverageRatio: merged.minTestCoverageRatio || 0
  };
}

// ---------- CLI entry ----------

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    process.stdout.write(usage() + '\n');
    process.exit(0);
  }
  const result = audit(args);
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  process.exit(result.ok ? 0 : 2);
}

if (require.main === module) {
  main();
}

module.exports = {
  parseArgs,
  validateSchema,
  mergeConfig,
  globToRegex,
  matchAny,
  detectLanguage,
  expandTestPatterns,
  hasInlineTests,
  audit,
  // exposed for tests
  _paths: { SKILL_DIR, CONVENTIONS_PATH, SCHEMA_PATH }
};
