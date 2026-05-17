#!/usr/bin/env node
/**
 * validate-output.js — orchestration-layer validator for spar-exocortex
 *
 * Validates a subagent output JSON against its bundled schema. Used by the
 * orchestration primary path (Pattern 4 Layer 1). The no-Node fallback path
 * documented in SKILL.md performs the same checks inline.
 *
 * Usage:
 *   node validate-output.js <schema-name> < output.json
 *   node validate-output.js <schema-name> --file output.json
 *   node validate-output.js <schema-name> --baseline baseline.json output.json
 *     (last form: cross-validates challenger against baseline for anti-overlap)
 *
 * schema-name is one of: baseline | attacker | challenger | execution-result |
 *                       judge | proposal-template
 *
 * Exit codes:
 *   0 = valid
 *   1 = invalid (errors emitted as JSON to stdout)
 *   2 = usage / configuration error
 *
 * Output envelope (on both pass and fail):
 *   { ok: boolean, schema: string, errors: [{ path, message }] }
 *
 * Refs #216
 */
'use strict';

const fs = require('fs');
const path = require('path');

const SCHEMA_DIR = path.join(__dirname, '..', 'resources');
const SCHEMA_FILES = {
  'baseline': 'baseline-schema.json',
  'attacker': 'attacker-output-schema.json',
  'challenger': 'challenger-report-schema.json',
  'execution-result': 'execution-result-schema.json',
  'judge': 'judge-output-schema.json',
  'proposal-template': 'proposal-template-schema.json'
};

function emit(envelope) {
  process.stdout.write(JSON.stringify(envelope, null, 2));
}

function fail(message, code) {
  emit({ ok: false, error: message });
  process.exit(code || 2);
}

function parseArgs(argv) {
  const args = { schema: null, output: null, baseline: null, fromStdin: true };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!args.schema) {
      args.schema = a;
    } else if (a === '--file') {
      args.output = argv[++i];
      args.fromStdin = false;
    } else if (a === '--baseline') {
      args.baseline = argv[++i];
    } else if (!a.startsWith('--')) {
      args.output = a;
      args.fromStdin = false;
    }
  }
  return args;
}

function readStdin() {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => { data += chunk; });
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', reject);
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.schema || !SCHEMA_FILES[args.schema]) {
    fail(`Unknown schema "${args.schema}". Use one of: ${Object.keys(SCHEMA_FILES).join(', ')}`, 2);
  }

  const schemaPath = path.join(SCHEMA_DIR, SCHEMA_FILES[args.schema]);
  if (!fs.existsSync(schemaPath)) {
    fail(`Schema file not found: ${schemaPath}`, 2);
  }

  let Ajv;
  try {
    // Draft 2020-12 entrypoint — bundled schemas use $schema:
    // https://json-schema.org/draft/2020-12/schema. The default `require('ajv')`
    // doesn't include 2020-12 meta-schemas.
    Ajv = require('ajv/dist/2020');
  } catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') {
      // Pattern 4 (#216): ajv-missing on Node-present hosts is a hard-fail
      // with the diagnostic that names both remediation paths.
      fail('ajv module not found. Install with `npm install ajv` (in this skill directory or globally) to enable schema validation, or use the orchestration fallback path documented in SKILL.md (Pattern 4 Layer 1 fallback).', 2);
    }
    throw e;
  }

  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  const ajv = new Ajv({ allErrors: true, strict: false });
  const validate = ajv.compile(schema);

  let raw;
  try {
    raw = args.fromStdin ? await readStdin() : fs.readFileSync(args.output, 'utf8');
  } catch (e) {
    fail(`Could not read output: ${e.message}`, 2);
  }

  let output;
  try {
    output = JSON.parse(raw);
  } catch (e) {
    emit({ ok: false, schema: args.schema, errors: [{ path: '$', message: `JSON parse error: ${e.message}` }] });
    process.exit(1);
  }

  const ok = validate(output);
  const errors = ok ? [] : (validate.errors || []).map(e => ({
    path: e.instancePath || '$',
    message: e.message + (e.params ? ' ' + JSON.stringify(e.params) : '')
  }));

  // Cross-schema anti-overlap check for challenger vs baseline.
  if (args.schema === 'challenger' && args.baseline) {
    try {
      const baseline = JSON.parse(fs.readFileSync(args.baseline, 'utf8'));
      const sameComplexity = output.targetComplexity === baseline.targetComplexity;
      const sameInvariant = output.invariantChoice === baseline.invariantChoice;
      if (sameComplexity && sameInvariant) {
        errors.push({
          path: '$.targetComplexity / $.invariantChoice',
          message: `challenger duplicates baseline on BOTH targetComplexity ("${output.targetComplexity}") and invariantChoice ("${output.invariantChoice}") — at least one must differ`
        });
      }
    } catch (e) {
      errors.push({ path: '$', message: `Could not read baseline for cross-check: ${e.message}` });
    }
  }

  emit({ ok: errors.length === 0, schema: args.schema, errors });
  process.exit(errors.length === 0 ? 0 : 1);
}

main().catch(e => { fail(`Unexpected error: ${e && e.message}`, 2); });
