#!/usr/bin/env node
/**
 * JSON Schema Validator
 * Validates JSON files against their $schema references using Ajv.
 *
 * Usage:
 *   node validate.js <file.json>          Validate a single file
 *   node validate.js --all                Scan project for all schema-referenced JSON
 *   node validate.js --dir <path>         Scan a specific directory
 *   node validate.js --inline <file.json> Scoped fallback: parse-only + top-level type
 *                                          check (no ajv required). For hosts without
 *                                          ajv installed. Does NOT do schema validation.
 *
 * Output: JSON to stdout
 *   { "ok": true/false, "mode": "schema"|"inline", "results": [...], "summary": { "total", "passed", "failed", "skipped" } }
 *
 * Preflight: in default mode, exits non-zero with a Pattern 4 diagnostic
 * (deliverable / fallback / install path) when ajv is unavailable.
 */

'use strict';

const fs = require('fs');
const path = require('path');

// --- Argument parsing (must run before ajv check so --inline can opt out of ajv requirement) ---

const args = process.argv.slice(2);
let mode = 'single';
let target = null;
let inlineMode = false;

const schemaOverrides = new Map();

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--all') {
    mode = 'all';
  } else if (args[i] === '--inline') {
    inlineMode = true;
  } else if (args[i] === '--dir') {
    mode = 'dir';
    target = args[++i];
    if (!target) {
      console.log(JSON.stringify({ ok: false, error: '--dir requires a path argument' }));
      process.exit(1);
    }
  } else if (args[i] === '--schema-override') {
    // Format: file=schemaPath
    const mapping = args[++i];
    if (mapping) {
      const eqIdx = mapping.indexOf('=');
      if (eqIdx > 0) {
        const file = path.resolve(mapping.slice(0, eqIdx));
        const schema = path.resolve(mapping.slice(eqIdx + 1));
        schemaOverrides.set(file, schema);
      }
    }
  } else if (!args[i].startsWith('-')) {
    mode = 'single';
    target = args[i];
  }
}

if (mode === 'single' && !target) {
  console.log(JSON.stringify({ ok: false, error: 'No file specified. Use <file.json>, --all, or --dir <path>' }));
  process.exit(1);
}

// --- Ajv preflight (Pattern 4: deliverable -> fallback -> install) ---
// In normal mode, ajv is required for JSON Schema validation. In --inline mode,
// ajv is not needed because we do parse-only structural checks instead.

let Ajv = null;
if (!inlineMode) {
  try {
    Ajv = require('ajv');
  } catch {
    console.log(JSON.stringify({
      ok: false,
      mode: 'preflight-failure',
      deliverable: 'Validate JSON files against JSON Schema using ajv (Draft 7 / 2020-12, $ref resolution, format validators).',
      fallback: 'Re-invoke with --inline for parse-only structural checks (valid JSON syntax + top-level type matches $schema-declared type if trivially derivable). The fallback does NOT perform schema validation.',
      installPath: 'Or install Node 18+ and run: npm install ajv'
    }, null, 2));
    process.exit(1);
  }
}

// --- File discovery ---

const EXCLUDE_DIRS = new Set(['node_modules', '.git', '.vite', 'out', 'dist', '.min-mirror']);
const EXCLUDE_FILES = new Set(['package-lock.json', 'tsconfig.json']);

function parseGitignore(gitignorePath) {
  try {
    const content = fs.readFileSync(gitignorePath, 'utf8');
    return content.split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'))
      .map(line => line.replace(/\/$/, ''));
  } catch {
    return [];
  }
}

function isGitignored(filePath, rootDir, patterns) {
  if (patterns.length === 0) return false;
  const relative = path.relative(rootDir, filePath).replace(/\\/g, '/');
  const segments = relative.split('/');
  for (const pattern of patterns) {
    for (const segment of segments) {
      if (segment === pattern) return true;
    }
  }
  return false;
}

function findJsonFiles(dir, rootDir, gitignorePatterns) {
  if (!rootDir) rootDir = dir;
  if (!gitignorePatterns) {
    gitignorePatterns = parseGitignore(path.join(rootDir, '.gitignore'));
  }
  const results = [];
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return results;
  }
  for (const entry of entries) {
    if (EXCLUDE_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (isGitignored(fullPath, rootDir, gitignorePatterns)) continue;
    if (entry.isDirectory()) {
      results.push(...findJsonFiles(fullPath, rootDir, gitignorePatterns));
    } else if (entry.isFile() && entry.name.endsWith('.json') && !EXCLUDE_FILES.has(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

function discoverFiles() {
  if (mode === 'single') {
    const resolved = path.resolve(target);
    if (!fs.existsSync(resolved)) {
      console.log(JSON.stringify({ ok: false, error: `File not found: ${target}` }));
      process.exit(1);
    }
    return [resolved];
  }
  const scanDir = mode === 'all' ? process.cwd() : path.resolve(target);
  if (!fs.existsSync(scanDir)) {
    console.log(JSON.stringify({ ok: false, error: `Directory not found: ${target}` }));
    process.exit(1);
  }
  return findJsonFiles(scanDir);
}

// --- Schema resolution ---

function getSchemaRef(filePath) {
  try {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return content.$schema || null;
  } catch {
    return null;
  }
}

function resolveSchema(schemaRef, fileDir) {
  if (!schemaRef) return null;

  // URL — not supported locally
  if (schemaRef.startsWith('http://') || schemaRef.startsWith('https://')) {
    return { type: 'url', ref: schemaRef, resolved: null };
  }

  // Relative or absolute path
  const resolved = path.isAbsolute(schemaRef)
    ? schemaRef
    : path.resolve(fileDir, schemaRef);

  if (fs.existsSync(resolved)) {
    return { type: 'file', ref: schemaRef, resolved };
  }

  return { type: 'missing', ref: schemaRef, resolved };
}

// --- Validation ---

function validateFile(filePath, schemaPath) {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    // Remove meta-schema reference to avoid Ajv draft resolution issues
    delete schema.$schema;

    const ajv = new Ajv({ allErrors: true, strict: false });
    const validate = ajv.compile(schema);
    const valid = validate(data);

    return {
      file: filePath,
      schema: schemaPath,
      status: valid ? 'PASS' : 'FAIL',
      mode: 'schema',
      errors: valid ? [] : validate.errors.map(e => ({
        path: e.instancePath || '/',
        message: e.message,
        keyword: e.keyword,
        params: e.params
      }))
    };
  } catch (err) {
    return {
      file: filePath,
      schema: schemaPath,
      status: 'ERROR',
      mode: 'schema',
      errors: [{ path: '/', message: err.message, keyword: 'parse', params: {} }]
    };
  }
}

// Scoped fallback (Pattern 4): parse-only structural check when ajv is unavailable.
// Verifies the file is valid JSON. If the schema declares a top-level `type`
// trivially derivable without $ref resolution, asserts the parsed data matches it.
// Does NOT do constraint checking, format validation, $ref resolution, or anything
// beyond parse + top-level type. SKILL.md is explicit about this scope gap.
function validateFileInline(filePath, schemaPath) {
  let data;
  try {
    data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    return {
      file: filePath,
      schema: schemaPath,
      status: 'ERROR',
      mode: 'inline',
      note: 'Structural check only; schema validation not performed.',
      errors: [{ path: '/', message: `Parse failed: ${err.message}`, keyword: 'parse', params: {} }]
    };
  }

  // Try to load the schema's top-level type for a single trivial assertion.
  // If schema is malformed or has no straightforward type, treat as PASS at the
  // structural level (the file parsed) and surface the limitation.
  let declaredType = null;
  try {
    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    if (typeof schema.type === 'string') {
      declaredType = schema.type;
    }
  } catch {
    // Schema unreadable in inline mode is non-fatal — parse-only passed.
  }

  if (declaredType) {
    const actualType = Array.isArray(data) ? 'array' : (data === null ? 'null' : typeof data);
    const matches = actualType === declaredType
      || (declaredType === 'integer' && actualType === 'number' && Number.isInteger(data))
      || (declaredType === 'object' && actualType === 'object' && !Array.isArray(data) && data !== null);
    if (!matches) {
      return {
        file: filePath,
        schema: schemaPath,
        status: 'FAIL',
        mode: 'inline',
        note: 'Structural check only; schema validation not performed.',
        errors: [{ path: '/', message: `Top-level type mismatch: schema declares "${declaredType}", file is "${actualType}"`, keyword: 'type', params: { expected: declaredType, actual: actualType } }]
      };
    }
  }

  return {
    file: filePath,
    schema: schemaPath,
    status: 'PASS',
    mode: 'inline',
    note: 'Structural check only; schema validation not performed.',
    errors: []
  };
}

// --- Main ---

const files = discoverFiles();
const results = [];
const summary = { total: files.length, passed: 0, failed: 0, skipped: 0 };

for (const filePath of files) {
  const schemaRef = getSchemaRef(filePath);
  if (!schemaRef) {
    summary.skipped++;
    continue;
  }

  let schema = resolveSchema(schemaRef, path.dirname(filePath));

  // Check for schema override when schema is missing
  const resolvedFilePath = path.resolve(filePath);
  if (schema && schema.type === 'missing' && schemaOverrides.has(resolvedFilePath)) {
    const overridePath = schemaOverrides.get(resolvedFilePath);
    if (fs.existsSync(overridePath)) {
      schema = { type: 'file', ref: schemaRef, resolved: overridePath };
    }
  }

  if (!schema || schema.type === 'url' || schema.type === 'missing') {
    const reason = schema?.type === 'url'
      ? `Remote schema not supported: ${schema.ref}`
      : `Schema not found: ${schema?.ref || 'unknown'}`;
    results.push({
      file: filePath,
      schema: schema?.ref || null,
      status: 'SKIPPED',
      reason
    });
    summary.skipped++;
    continue;
  }

  const result = inlineMode
    ? validateFileInline(filePath, schema.resolved)
    : validateFile(filePath, schema.resolved);
  results.push(result);

  if (result.status === 'PASS') {
    summary.passed++;
  } else {
    summary.failed++;
  }
}

const ok = summary.failed === 0;
const envelope = { ok, mode: inlineMode ? 'inline' : 'schema', results, summary };
if (inlineMode) {
  envelope.note = 'Structural check only; schema validation not performed. Install Node 18+ and ajv to enable full schema validation.';
}
console.log(JSON.stringify(envelope, null, 2));
process.exit(ok ? 0 : 1);
