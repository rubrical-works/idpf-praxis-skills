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
// minProperties, minimum, maximum, pattern, $ref (#/$defs/...), $defs,
// allOf.
//
// $ref is an early return: keywords sitting alongside a $ref are NOT
// applied. That is why the strict/lenient split (#286) composes with
// allOf rather than a $ref carrying a sibling `required` -- the sibling
// would be silently dropped and the strict entry point would stop
// requiring anything.

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
  if (Array.isArray(schema.allOf)) {
    for (const sub of schema.allOf) validate(sub, data, root, pathStr, errors);
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

// `root` is where $ref resolves from. It defaults to `schema` so whole-schema
// callers are unchanged, and is passed explicitly when validating against a
// sub-schema entry point such as #/$defs/override, whose own object carries
// no $defs to resolve against (#286).
function validateSchema(schema, data, root) {
  const errors = [];
  validate(schema, data, root || schema, '', errors);
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

// Override-declared languages are consulted BEFORE bundled ones (#301).
//
// detectLanguage returns the first entry claiming a matching extension, and
// this map's insertion order is that precedence order. Appending override keys
// after the bundled map -- the previous behaviour -- put any entry declaring a
// claimed extension (.js, .ts, .py, ...) behind the bundled entry that already
// claimed it, so it was never consulted. The entry validated, merged, and had
// no observable effect of any kind.
//
// A single spread cannot express this. `{ ...overrideLangs, ...bundledLangs }`
// gives override keys their position but lets bundled VALUES win on collision,
// which is the opposite of the documented same-key behaviour. The map is
// therefore built explicitly: override entries first with their own
// definitions, then the bundled entries no same-key override replaced.
function mergeConfig(conventions, override) {
  const merged = {
    languages: {},
    ignoredSourcePatterns: [...(conventions.ignoredSourcePatterns || [])],
    excludePaths: [...(conventions.excludePaths || [])],
    // The annotation grammar the flow reader consults (#311). Bundled only: the
    // grammar is an upstream definition, not a per-project knob.
    flowAnnotation: conventions.flowAnnotation || null,
    minTestCoverageRatio: 0
  };
  if (!override) {
    merged.languages = { ...conventions.languages };
    return merged;
  }
  if (override.additionalLanguages) {
    for (const [name, def] of Object.entries(override.additionalLanguages)) {
      merged.languages[name] = def;
    }
  }
  // Same-key overrides already occupy their key above, so skipping them here
  // preserves wholesale replacement rather than restoring the bundled entry.
  for (const [name, def] of Object.entries(conventions.languages)) {
    if (!(name in merged.languages)) merged.languages[name] = def;
  }
  if (Array.isArray(override.ignoredSourcePatterns)) {
    merged.ignoredSourcePatterns.push(...override.ignoredSourcePatterns);
  }
  // Concatenated, not replaced — same treatment as ignoredSourcePatterns, so a
  // project adds to the bundled list rather than silently dropping it (#309).
  if (Array.isArray(override.excludePaths)) {
    merged.excludePaths.push(...override.excludePaths);
  }
  if (typeof override.minTestCoverageRatio === 'number') {
    merged.minTestCoverageRatio = override.minTestCoverageRatio;
  }
  return merged;
}

// Entries that can never match, in the merged map's own precedence order (#301).
//
// An entry is unreachable when EVERY one of its sourceExtensions is already
// claimed by an entry ahead of it: detectLanguage returns on the first match,
// so no file can ever reach it. Partial shadowing is not reported -- an entry
// keeping even one unclaimed extension still matches files carrying it.
//
// Deliberately stated as a property of position, not of origin: it makes no
// bundled-versus-override distinction, so two override entries colliding with
// each other are caught by the same check, as is a bundled entry a broad
// override has fully shadowed. Precedence alone fixes today's instance; this
// is what stops the next one being silent (#301).
function findUnreachableLanguages(languages) {
  const unreachable = [];
  const claimedBy = new Map(); // extension -> name of the first entry claiming it
  for (const [name, def] of Object.entries(languages)) {
    const exts = (def && def.sourceExtensions) || [];
    // Resolved up front rather than inside the predicate: .every()
    // short-circuits, so accumulating the shadower from within it would depend
    // on where it stopped.
    const owners = exts.map((ext) => claimedBy.get(ext) || null);
    if (exts.length > 0 && owners.every(Boolean)) {
      unreachable.push({ name, shadowedBy: owners[0] });
    }
    for (const ext of exts) {
      if (!claimedBy.has(ext)) claimedBy.set(ext, name);
    }
  }
  return unreachable;
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

// True when SOME language entry claims this file's extension, regardless of
// whether that language's excludePatterns then reject the file.
//
// detectLanguage returns null for two unrelated reasons -- no language claims
// the extension, or one does and excludePatterns rejected the file -- and the
// unrecognized-extension diagnostic must separate them. A .d.ts file is
// rejected by typescript's excludePatterns, but '.ts' IS a recognized
// extension; reporting it as unrecognized would say the audit has no entry for
// TypeScript. Same for **/*_test.go under go (#299).
function extensionIsClaimed(file, languages) {
  for (const def of Object.values(languages)) {
    for (const ext of def.sourceExtensions) {
      if (file.endsWith(ext)) return true;
    }
  }
  return false;
}

// The map key for a file the audit could not classify: its extension, or the
// explicit '(none)' sentinel. Makefile, LICENSE and extensionless scripts take
// the same !lang path as a .vue file and would otherwise have nowhere to go in
// an extension-keyed map. '(none)' cannot collide with a real extension, which
// a pseudo-extension like '.none' could (#299).
function unrecognizedKey(file) {
  const ext = path.extname(file);
  return ext === '' ? '(none)' : ext;
}

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

// ---------- self-exclusion ----------

// True when `file` is itself a test under one of its language's patterns.
//
// Compared as a glob with {stem} left open, NOT by equality against an
// expanded candidate. expandTestPatterns substitutes the file's own stem,
// and path.basename('foo.test.js', '.js') is 'foo.test' -- so the candidate
// it builds is 'foo.test.test.js', which can never equal the file being
// tested. The old equality guard was therefore unreachable for every file
// carrying a compound test suffix (#284).
//
// Deliberately narrow: this changes the guard only. expandTestPatterns is
// shared with the pairing path, so altering its stem derivation would also
// change the expected test path of every dotted source filename in every
// language (src/app.config.ts would expect src/app.test.ts).
function looksLikeTest(file, testPatterns) {
  if (!Array.isArray(testPatterns)) return false;
  const dir = path.dirname(file);
  const dirNorm = dir === '.' ? '' : dir;
  return testPatterns.some((p) => {
    const glob = p
      .replaceAll('{dir}', dirNorm)
      .replaceAll('{stem}', '*')
      .replace(/^\/+/, '');
    return globToRegex(glob).test(file);
  });
}

// ---------- pairing scope (#293) ----------

// The test-shape globs for one source file's OWN directory: {dir} bound to
// that directory and {stem} left open. This is the sayable form of "some test
// in this package covers this file", which no testPatterns entry can express —
// expandTestPatterns substitutes {stem} from the source, so a literal * in the
// stem position would be abusing the placeholder rather than declaring intent.
// Globs marking where this language's flow specs live, or [] when the language
// declares no flow class. A flow spec pairs by annotation, never by filename, so
// these locations are excluded from module pairing (#310).
function flowLocations(langDef) {
  const flow = langDef && langDef.classes && langDef.classes.flow;
  return (flow && Array.isArray(flow.locations)) ? flow.locations : [];
}

// Read the flow declaration out of a spec's LEADING comment block (#311).
//
// Only the leading block is read, per the grammar's readFrom. A tag deeper in
// the file is prose — a fixture string, a comment inside a test case — and
// reading further would let it silently pair a spec. The block ends at the
// first line that is neither blank nor a comment, at the close of a `/* */`
// comment, or at a blank line once the block has started.
//
// A recognised tag carrying no value is MALFORMED: it is collected and
// reported, never thrown, and well-formed tags beside it still read. An
// unrecognised @tag is not malformed — it is simply prose.
function parseFlowAnnotations(content, grammar) {
  const empty = { covers: [], flow: null, malformed: [], declared: false };
  if (typeof content !== 'string') return empty;
  const recognised = new Set(((grammar && grammar.tags) || []).map((t) => t.tag));
  if (recognised.size === 0) return empty;

  const block = [];
  let inBlockComment = false;
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (inBlockComment) {
      block.push(trimmed);
      if (trimmed.includes('*/')) break;
      continue;
    }
    if (trimmed === '') {
      if (block.length) break;
      continue;
    }
    if (trimmed.startsWith('/*')) {
      block.push(trimmed);
      if (trimmed.includes('*/')) break;
      inBlockComment = true;
      continue;
    }
    if (trimmed.startsWith('//') || trimmed.startsWith('#')) {
      block.push(trimmed);
      continue;
    }
    break;
  }

  const covers = [];
  let flow = null;
  const malformed = [];
  for (const raw of block) {
    const text = raw
      .replace(/^\/\*+/, '')
      .replace(/\*+\/\s*$/, '')
      .replace(/^\*+/, '')
      .replace(/^\/\//, '')
      .replace(/^#/, '')
      .trim();
    const m = text.match(/(@[A-Za-z][\w-]*)(?:\s+(\S.*))?$/);
    if (!m) continue;
    const tag = m[1];
    if (!recognised.has(tag)) continue;
    const value = (m[2] || '').trim();
    if (!value) {
      malformed.push(tag);
      continue;
    }
    if (tag === '@covers') covers.push(value);
    else if (tag === '@flow') flow = value;
  }
  return { covers, flow, malformed, declared: covers.length > 0 || flow !== null };
}

// One-line hint naming the recognised tags, attached to every undeclared flow
// spec so the report says what to do rather than only what is missing (#311).
function flowDeclarationHint(grammar) {
  const tags = ((grammar && grammar.tags) || []).map((t) => `${t.tag} <${t.value}>`);
  return tags.length
    ? `Declare what this spec covers in its leading comment block: ${tags.join(' or ')}.`
    : 'Declare what this spec covers in its leading comment block.';
}

function readFlowDeclaration(projectRoot, file, grammar) {
  try {
    return parseFlowAnnotations(fs.readFileSync(path.join(projectRoot, file), 'utf8'), grammar);
  } catch {
    // Unreadable spec is undeclared, never fatal — the audit is advisory.
    return { covers: [], flow: null, malformed: [], declared: false };
  }
}

// Classify a test file into module / flow / contract (#310).
//
// Runs BEFORE detectLanguage, deliberately: since #308 a language's own
// excludePatterns reject its test shapes, so a test file returns null from
// detectLanguage and never reaches the looksLikeTest branch further down. A
// classifier placed there would see nothing.
//
// Matching is by location-blind test shape (testShapeGlobs), so a spec counts
// as a test wherever it sits. Flow is checked before contract, and both before
// module, because the classes narrow: a spec in a flow location is a flow spec
// even when its filename also stem-matches a source, which is the whole point
// of the flow class.
function classifyTestFile(file, languages) {
  for (const [name, def] of Object.entries(languages || {})) {
    if (!matchAny(file, testShapeGlobs(def.testPatterns))) continue;
    const classes = def.classes || {};
    if (classes.flow && matchAny(file, flowLocations(def))) {
      return { language: name, klass: 'flow' };
    }
    if (classes.contract && matchAny(file, classes.contract.exempt)) {
      return { language: name, klass: 'contract' };
    }
    return { language: name, klass: 'module' };
  }
  return null;
}

function directoryTestGlobs(file, testPatterns) {
  const dir = path.dirname(file);
  const dirNorm = dir === '.' ? '' : dir;
  return (testPatterns || []).map((p) =>
    p.replaceAll('{dir}', dirNorm).replaceAll('{stem}', '*').replace(/^\/+/, '')
  );
}

// True when the source file's own directory contains any file matching the
// language's test shape. Reads one directory, never recurses: the scope is the
// package, which is also the unit `go test -cover` reports in.
function directoryHasTest(projectRoot, file, testPatterns) {
  const dir = path.dirname(file);
  const abs = path.join(projectRoot, dir === '.' ? '' : dir);
  let entries;
  try {
    entries = fs.readdirSync(abs, { withFileTypes: true });
  } catch (_) {
    return false;
  }
  for (const e of entries) {
    if (!e.isFile()) continue;
    const rel = dir === '.' ? e.name : `${dir}/${e.name}`;
    if (looksLikeTest(rel, testPatterns)) return true;
  }
  return false;
}

// A language pairs per source file unless it declares otherwise. Absence of
// the key is the current behaviour, so every language but `go` is untouched.
function pairsByDirectory(langDef) {
  return langDef && langDef.pairingScope === 'directory';
}

// ---------- layout recognition ----------

// The language's test patterns with BOTH placeholders opened up: {stem} to a
// filename wildcard and {dir} to any directory. Used to ask whether a project
// contains any test at all in this language's convention.
function testShapeGlobs(testPatterns) {
  return (testPatterns || []).map((p) =>
    p.replaceAll('{dir}', '**').replaceAll('{stem}', '*').replace(/^\/+/, '')
  );
}

// True when the project contains at least one file matching the language's
// test-shape globs anywhere. Cached per language: the walk is a filesystem
// scan, and without the cache it would run once per source file (#285).
//
// This is what separates "no test was written" from "the tool does not
// understand this layout". The naive alternative -- treat a source as
// undetermined when no expanded candidate has an existing parent directory --
// is deliberately NOT used: nine of the ten bundled languages carry at least
// one {dir}/-rooted pattern, and a source file's own directory always exists,
// so that rule could never fire for them. It would have shipped as dead code,
// which is the defect class this audit already had once (#284).
function projectUsesLanguageConvention(projectRoot, lang, cache, dirCache = null) {
  if (cache.has(lang.name)) return cache.get(lang.name);
  const found = testShapeGlobs(lang.def.testPatterns).some((g) =>
    walkAndMatch(projectRoot, globToRegex(g), '', 0, dirCache)
  );
  cache.set(lang.name, found);
  return found;
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

// `excludeGlobs` drops candidate matches that sit in one of the language's flow
// locations (#310). Applied where globs resolve to real paths, not to the
// candidate strings: a candidate such as tests/**/{stem}.test.ts is itself a
// glob, so comparing it against tests/flows/** as text would never match.
function testFileExists(projectRoot, expanded, dirCache = null, excludeGlobs = []) {
  for (const candidate of expanded) {
    if (!candidate.includes('*') && matchAny(candidate, excludeGlobs)) continue;
    if (candidate.includes('*')) {
      // Glob candidate — walk projectRoot and match. Limited usage; do a
      // shallow check via fs walk under the first non-glob ancestor.
      const re = globToRegex(candidate);
      // Cheap version: check if any file under projectRoot matches.
      // For audit purposes, pattern matching against actual file list is fine.
      // Use a bounded walker, sharing one run's directory listings (#296).
      if (walkAndMatch(projectRoot, re, '', 0, dirCache, excludeGlobs)) return true;
    } else {
      const abs = path.join(projectRoot, candidate);
      if (fs.existsSync(abs)) return true;
    }
  }
  return false;
}

// Directory listings are memoized for the life of one audit run (#296). A glob
// candidate is expanded per source file -- tests/**/test_mod0.py,
// tests/**/test_mod1.py -- so the candidate STRINGS differ and caching match
// results buys nothing; what repeats is the readdirSync of the same
// directories, once per candidate per source. #285's guard measures exactly
// that, and adding the first glob-bearing patterns to python is what made it
// bite. The tree does not change during a run, so one listing per directory is
// sufficient and strictly cheaper than before.
function cachedReaddir(abs, dirCache) {
  if (dirCache && dirCache.has(abs)) return dirCache.get(abs);
  let entries;
  try {
    entries = fs.readdirSync(abs, { withFileTypes: true });
  } catch (_) {
    entries = [];
  }
  if (dirCache) dirCache.set(abs, entries);
  return entries;
}

function walkAndMatch(root, re, current = '', depth = 0, dirCache = null, excludeGlobs = []) {
  if (depth > 8) return false;
  const entries = cachedReaddir(path.join(root, current), dirCache);
  if (entries.length === 0) return false;
  for (const e of entries) {
    if (e.name === 'node_modules' || e.name === '.git' || e.name === 'dist' || e.name === 'build') continue;
    const rel = current ? `${current}/${e.name}` : e.name;
    if (e.isDirectory()) {
      if (walkAndMatch(root, re, rel, depth + 1, dirCache, excludeGlobs)) return true;
    } else if (re.test(rel) && !matchAny(rel, excludeGlobs)) {
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
    errors = validateSchema(schema.$defs.override, override, schema);
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
  const undetermined = [];
  const unrecognizedExtensions = {};
  const layoutCache = new Map();
  // One directory-listing cache for the whole run (#296).
  const dirCache = new Map();
  // Unpaired sources are DEFERRED, not classified in place (#295). The
  // missing-versus-undetermined decision needs to know whether this language
  // paired anywhere in the project, and that is unknowable until the loop ends.
  // Deferring re-partitions an array already in memory; deciding in place would
  // need a second filesystem walk.
  const pending = [];
  const pairedByLanguage = new Map();
  let totalSources = 0;
  let pairedSources = 0;
  // Per-class tallies (#310). Flow declarations are read by the annotation
  // reader (#311); until that ships no spec can be declared, so every flow spec
  // counts as undeclared — reported plainly rather than presented as a zero
  // that might be mistaken for "none found".
  const classTally = { flowDeclared: 0, flowUndeclared: 0, contractDeclared: 0 };
  const flowDeclarations = [];
  const flowUndeclaredSpecs = [];
  const malformedAnnotations = [];

  for (const file of newFiles) {
    if (matchAny(file, merged.ignoredSourcePatterns)) continue;
    // The project's own "not expected to have tests" list (#309): golden files,
    // fixture trees, generated sources, scratch directories. Applied here, beside
    // ignoredSourcePatterns and before language detection, so a matching path is
    // neither counted as a source nor reported as unpaired. Deliberately NOT a
    // per-language switch: every non-matching source in the same language still
    // pairs, and still reports as unpaired when it has no test.
    if (matchAny(file, merged.excludePaths)) continue;
    // Classify test files before source detection (#310) — see classifyTestFile
    // for why this cannot live in the looksLikeTest branch below.
    const testClass = classifyTestFile(file, merged.languages);
    if (testClass) {
      if (testClass.klass === 'flow') {
        const parsed = readFlowDeclaration(projectRoot, file, merged.flowAnnotation);
        for (const text of parsed.malformed) malformedAnnotations.push({ file, text });
        if (parsed.declared) {
          classTally.flowDeclared += 1;
          flowDeclarations.push({ file, covers: parsed.covers, flow: parsed.flow });
        } else {
          classTally.flowUndeclared += 1;
          flowUndeclaredSpecs.push({ file, hint: flowDeclarationHint(merged.flowAnnotation) });
        }
      } else if (testClass.klass === 'contract') {
        classTally.contractDeclared += 1;
      }
      continue;
    }
    const lang = detectLanguage(file, merged.languages);
    if (!lang) {
      // Only a genuinely unclaimed extension is a gap. An excludePatterns
      // rejection is a recorded decision, like ignoredSourcePatterns above,
      // and both stay out of this map.
      if (!extensionIsClaimed(file, merged.languages)) {
        const key = unrecognizedKey(file);
        unrecognizedExtensions[key] = (unrecognizedExtensions[key] || 0) + 1;
      }
      continue;
    }
    // Skip files that are themselves tests (matched as sources only by extension)
    if (looksLikeTest(file, lang.def.testPatterns)) {
      continue;
    }
    totalSources += 1;

    let paired = false;
    if (lang.def.inlineTests && hasInlineTests(path.join(projectRoot, file))) {
      paired = true;
    } else if (pairsByDirectory(lang.def)) {
      // Directory scope subsumes the per-file case: an eponymous
      // {stem}_test.go also matches the directory's test shape.
      if (directoryHasTest(projectRoot, file, lang.def.testPatterns)) paired = true;
    } else {
      const expanded = expandTestPatterns(file, lang.def.testPatterns);
      // A spec in a flow location pairs by annotation, not by stem, so it must
      // not pair its stem-mate as a module test either (#310 AC3).
      if (testFileExists(projectRoot, expanded, dirCache, flowLocations(lang.def))) paired = true;
    }

    if (paired) {
      pairedSources += 1;
      pairedByLanguage.set(lang.name, (pairedByLanguage.get(lang.name) || 0) + 1);
    } else {
      pending.push({ file, lang });
    }
  }

  // Second pass: classify the deferred sources now that project-wide pairing
  // counts are known (#295).
  //
  // The #285 mechanism asked only "does this project contain a file shaped like
  // this language's tests?". Shape and location are independent axes and it
  // measured only the first: testShapeGlobs opens {dir} to **, so any language
  // carrying a {dir}-anchored pattern produces a location-blind glob such as
  // **/*.test.js. A project whose tests are correctly named but filed where the
  // patterns cannot reach therefore SATISFIED the check, and every one of its
  // sources was reported as missing a test -- coverage 0 for a well-tested
  // project, while a project with no tests at all got coverage 1. The two
  // populations received each other's verdicts.
  //
  // The location axis is "tests of this language exist AND none of this
  // language's sources paired anywhere". Deliberately project-wide, not
  // per-file: a project that pairs somewhere understands its own layout, so an
  // unpaired source there is genuinely missing a test (partial credit rather
  // than all-or-nothing). A monorepo pairing in one package and not another
  // still reports missingTests for the unreachable package; improving that
  // needs per-subtree classification.
  for (const { file, lang } of pending) {
    // Report the expectation the scope actually used. Under directory scope
    // an expanded per-file candidate would name a file the audit never
    // required, which reads as a demand for one test file per source — the
    // assumption #293 removed.
    const candidates = pairsByDirectory(lang.def)
      ? directoryTestGlobs(file, lang.def.testPatterns)
      : expandTestPatterns(file, lang.def.testPatterns);
    const testsExist = projectUsesLanguageConvention(projectRoot, lang, layoutCache, dirCache);
    const pairedAnywhere = (pairedByLanguage.get(lang.name) || 0) > 0;
    if (!testsExist || !pairedAnywhere) {
      undetermined.push({ file, language: lang.name, checked: candidates });
    } else {
      missingTests.push({ file, language: lang.name, expected: candidates });
    }
  }

  // Undetermined sources leave the denominator: coverage describes only the
  // files the audit actually understood. A project whose layout is unreadable
  // therefore reports coverage 1 alongside a non-empty undetermined[], which
  // is the honest reading -- see SKILL.md, this changes what coverage means
  // for any caller comparing it to a floor (#285).
  const determinedSources = pairedSources + missingTests.length;
  const coverage = determinedSources === 0 ? 1 : pairedSources / determinedSources;
  return {
    ok: true,
    newSources: totalSources,
    pairedSources,
    missingTests,
    undetermined,
    undeterminedCount: undetermined.length,
    // Three classes, each with its own denominator (#310). The top-level fields
    // above are unchanged and carry the MODULE class, so a consumer reading only
    // them is unaffected by this release.
    //
    // module.coverage is present only when module.sources > 0: a language with
    // no module sources has nothing to divide, and reporting 0% there would say
    // "nothing is tested" about a project that was never meant to have module
    // tests. Absence is the honest report; the top-level coverage keeps its own
    // long-standing 1.0-on-empty behaviour for compatibility.
    classes: {
      module: totalSources === 0
        ? { sources: 0, paired: 0, unpaired: missingTests.length }
        : {
          sources: totalSources,
          paired: pairedSources,
          unpaired: missingTests.length,
          coverage: Number(coverage.toFixed(4))
        },
      // declarations/undeclaredSpecs are per-path detail beside the counts
      // (#311). The counts keep the shape #310 shipped; an undeclared spec is
      // reported by path with a hint naming the tags, in its own bucket rather
      // than among module orphans — a different problem with a different fix.
      flow: {
        declared: classTally.flowDeclared,
        undeclared: classTally.flowUndeclared,
        declarations: flowDeclarations,
        undeclaredSpecs: flowUndeclaredSpecs
      },
      contract: { declared: classTally.contractDeclared }
    },
    coverage: Number(coverage.toFixed(4)),
    minTestCoverageRatio: merged.minTestCoverageRatio || 0,
    // Always present, even when empty, so a consumer can read it
    // unconditionally rather than testing for the field first (#299). A
    // container rather than a top-level field: #301 adds its own entry kind
    // here instead of a second field meaning "something the audit ignored".
    diagnostics: {
      unrecognizedExtensions,
      unreachableLanguageEntries: findUnreachableLanguages(merged.languages),
      // A malformed annotation is reported, never thrown (#311): the audit
      // completes and names the file and the offending text. Always present.
      malformedAnnotations
    }
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
  findUnreachableLanguages,
  globToRegex,
  matchAny,
  detectLanguage,
  extensionIsClaimed,
  unrecognizedKey,
  expandTestPatterns,
  looksLikeTest,
  parseFlowAnnotations,
  flowDeclarationHint,
  classifyTestFile,
  testShapeGlobs,
  directoryTestGlobs,
  directoryHasTest,
  pairsByDirectory,
  hasInlineTests,
  audit,
  // exposed for tests
  _paths: { SKILL_DIR, CONVENTIONS_PATH, SCHEMA_PATH }
};
