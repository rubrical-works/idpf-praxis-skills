#!/usr/bin/env node
/**
 * load-entries.js — Selective entry loader for engage-exocortex
 *
 * Usage: node load-entries.js <type> <id1> [id2] [...]
 *   type: paradigm | structure | strategy
 *
 * Loads only the matched entries from the corresponding reference file.
 * Emits a warning when output exceeds the 10K token soft limit.
 *
 * Refs #158
 */
'use strict';

const fs = require('fs');
const path = require('path');

const RESOURCES_DIR = path.join(__dirname, '..', 'resources');

const TYPE_MAP = {
  paradigm: { file: 'paradigms.json', arrayKey: 'paradigms' },
  structure: { file: 'structures.json', arrayKey: 'families' },
  strategy: { file: 'strategies.json', arrayKey: 'strategies' }
};

const TOKEN_SOFT_LIMIT = 10000;
// Rough estimate: ~4 chars per token for JSON output
const CHARS_PER_TOKEN = 4;

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    outputError('Usage: node load-entries.js <paradigm|structure|strategy> <id1> [id2] [...]');
    process.exit(1);
  }

  const type = args[0].toLowerCase();
  const ids = args.slice(1);

  // Validate against colocated schema
  const schemaPath = path.join(__dirname, 'load-entries-input-schema.json');
  const validationError = validateInput({ type, ids }, schemaPath);
  if (validationError) {
    outputError(validationError);
    process.exit(1);
  }

  if (!TYPE_MAP[type]) {
    outputError(`Invalid type "${type}". Must be one of: paradigm, structure, strategy`);
    process.exit(1);
  }

  if (ids.length === 0) {
    outputError('No IDs provided. Provide at least one ID to load.');
    process.exit(1);
  }

  const { file, arrayKey } = TYPE_MAP[type];
  const filePath = path.join(RESOURCES_DIR, file);

  if (!fs.existsSync(filePath)) {
    outputError(`${file} not found at ${filePath}`);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const allEntries = data[arrayKey] || [];

  const entries = [];
  const unknownIds = [];

  for (const id of ids) {
    const entry = allEntries.find(e => e.id === id);
    if (entry) {
      entries.push(entry);
    } else {
      unknownIds.push(id);
    }
  }

  const outputJson = JSON.stringify(entries);
  const tokenEstimate = Math.ceil(outputJson.length / CHARS_PER_TOKEN);

  if (entries.length === 0) {
    const result = {
      ok: false,
      type,
      entries: [],
      unknownIds,
      tokenEstimate: 0,
      message: `No entries found for IDs: ${unknownIds.join(', ')}`
    };
    process.stdout.write(JSON.stringify(result, null, 2));
    process.exit(1);
  }

  const result = {
    ok: true,
    type,
    entries,
    unknownIds,
    tokenEstimate
  };

  if (tokenEstimate > TOKEN_SOFT_LIMIT) {
    result.warning = `Output exceeds soft limit: ~${tokenEstimate} tokens (limit: ${TOKEN_SOFT_LIMIT}). Consider loading fewer entries.`;
  }

  process.stdout.write(JSON.stringify(result, null, 2));
}

function validateInput(input, schemaPath) {
  try {
    const Ajv = require('ajv');
    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
    const ajv = new Ajv();
    const validate = ajv.compile(schema);
    if (!validate(input)) {
      return `Input validation failed: ${validate.errors.map(e => e.message).join(', ')}`;
    }
  } catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') return null;
    if (e.code === 'ENOENT') return null;
    throw e;
  }
  return null;
}

function outputError(message) {
  const result = { ok: false, error: message };
  process.stdout.write(JSON.stringify(result, null, 2));
}

main();
