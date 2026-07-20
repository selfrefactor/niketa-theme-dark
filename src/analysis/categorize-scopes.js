/**
 * Step 3: Categorize missing scopes into semantic groups.
 *
 * For each scope from getMissingScopesList():
 *   Pass A: Semantic prefix matching → assign to group + level
 *   Pass B: Theme consensus override (from _scope-color-map.json)
 *   Pass C: Unclassified → drop or default
 *
 * Output: src/analysis/themes-data/_categorized-scopes.json
 *   Maps each group+level to its new scope list.
 */

const { readJson, writeJson } = require('fs-extra')
const { resolve } = require('node:path')
const fs = require('fs')

const THEMES_DATA_DIR = resolve(__dirname, 'themes-data')
const BASE_PALETTE_PATH = resolve(__dirname, '../generate-palette/base-palette.js')

// ── Pass A: Semantic prefix rules ──────────────────────────────────────

// Each rule: [prefix, group, defaultLevel, priority]
// Rules are checked in order; first match wins.
// Group can be one of: VARIABLES, KEYWORDS, PUNCTUATIONS, CONSTANTS, CSS,
//   ENTITIES, STRINGS, SUPPORTS, METAS, STORAGES
// Or a direct COLOR_X assignment (e.g., 'COLOR_4')
const PREFIX_RULES = [
  // ── VARIABLES ──
  { prefix: 'variable.other.readwrite', group: 'VARIABLES', level: 2 },
  { prefix: 'variable.other.object',     group: 'VARIABLES', level: 2 },
  { prefix: 'variable.other.constant',   group: 'VARIABLES', level: 2 },
  { prefix: 'variable.other.property',   group: 'VARIABLES', level: 2 },
  { prefix: 'variable.other.class',      group: 'VARIABLES', level: 2 },
  { prefix: 'variable.other.alias',      group: 'VARIABLES', level: 2 },
  { prefix: 'variable.other.block',      group: 'VARIABLES', level: 2 },
  { prefix: 'variable.other',            group: 'VARIABLES', level: 2 },
  { prefix: 'variable.language',         group: 'VARIABLES', level: 4 },
  { prefix: 'variable.readwrite',        group: 'VARIABLES', level: 2 },
  { prefix: 'variable.function',         group: 'VARIABLES', level: 2 },
  { prefix: 'variable.object',           group: 'VARIABLES', level: 2 },
  { prefix: 'variable.interpolation',    group: 'VARIABLES', level: 2 },
  { prefix: 'variable.type',             group: 'VARIABLES', level: 2 },
  { prefix: 'variable.c',                group: 'VARIABLES', level: 2 },
  { prefix: 'variable.graphql',          group: 'VARIABLES', level: 2 },
  { prefix: 'variable.line-break',       group: 'VARIABLES', level: 2 },
  { prefix: 'variable.parameter',        group: 'VARIABLES', level: 3 }, // parameters dimmer
  { prefix: 'variable.',                 group: 'VARIABLES', level: 2 },

  // ── KEYWORDS ──
  // Theme consensus: operators/control are bright (level 0-1)
  { prefix: 'keyword.operator',          group: 'KEYWORDS', level: 0 },
  { prefix: 'keyword.other',             group: 'KEYWORDS', level: 0 },
  { prefix: 'keyword.control',           group: 'KEYWORDS', level: 1 },
  { prefix: 'keyword.type',              group: 'KEYWORDS', level: 3 },
  { prefix: 'keyword.symbol',            group: 'KEYWORDS', level: 0 },
  { prefix: 'keyword.key',               group: 'KEYWORDS', level: 0 },
  { prefix: 'keyword.',                  group: 'KEYWORDS', level: 1 },

  // ── PUNCTUATIONS ──
  { prefix: 'punctuation.definition',    group: 'PUNCTUATIONS', level: 1 },
  { prefix: 'punctuation.separator',     group: 'PUNCTUATIONS', level: 0 },
  { prefix: 'punctuation.section',       group: 'PUNCTUATIONS', level: 0 },
  { prefix: 'punctuation.parenthesis',   group: 'PUNCTUATIONS', level: 0 },
  { prefix: 'punctuation.accessor',      group: 'PUNCTUATIONS', level: 0 },
  { prefix: 'punctuation.quasi',         group: 'PUNCTUATIONS', level: 0 },
  { prefix: 'punctuation.terminator',    group: 'PUNCTUATIONS', level: 0 },
  { prefix: 'punctuation.type',          group: 'PUNCTUATIONS', level: 0 },
  { prefix: 'punctuation.bracket',       group: 'PUNCTUATIONS', level: 0 },
  { prefix: 'punctuation.colon',         group: 'PUNCTUATIONS', level: 0 },
  { prefix: 'punctuation.dot',           group: 'PUNCTUATIONS', level: 0 },
  { prefix: 'punctuation.delimiter',     group: 'PUNCTUATIONS', level: 0 },
  { prefix: 'punctuation.parens',        group: 'PUNCTUATIONS', level: 0 },
  { prefix: 'punctuation.string',        group: 'PUNCTUATIONS', level: 1 },
  { prefix: 'punctuation.',              group: 'PUNCTUATIONS', level: 0 },
  { prefix: 'brackethighlighter.',       group: 'PUNCTUATIONS', level: 0 },
  { prefix: 'block.scope',               group: 'PUNCTUATIONS', level: 0 },
  { prefix: 'comment.punctuation',       group: 'PUNCTUATIONS', level: 1 },
  { prefix: 'beginning.punctuation',     group: 'PUNCTUATIONS', level: 1 },

  // ── CONSTANTS ──
  // Theme consensus: constants are mid-bright (level 2), not dim
  { prefix: 'constant.character',        group: 'CONSTANTS', level: 2 },
  { prefix: 'constant.numeric',          group: 'CONSTANTS', level: 2 },
  { prefix: 'constant.language',         group: 'CONSTANTS', level: 2 },
  { prefix: 'constant.other',            group: 'CONSTANTS', level: 2 },
  { prefix: 'constant.regexp',           group: 'CONSTANTS', level: 2 },
  { prefix: 'constant.escape',           group: 'CONSTANTS', level: 2 },
  { prefix: 'constant.keyword',          group: 'CONSTANTS', level: 2 },
  { prefix: 'constant.pathname',         group: 'CONSTANTS', level: 2 },
  { prefix: 'constant.type-constructor', group: 'CONSTANTS', level: 2 },
  { prefix: 'constant.asciidoc',         group: 'CONSTANTS', level: 2 },
  { prefix: 'constant.',                 group: 'CONSTANTS', level: 2 },
  { prefix: 'rgb-value',                 group: 'CONSTANTS', level: 2 },

  // ── ENTITIES ──
  { prefix: 'entity.name.function',      group: 'ENTITIES', level: 0 },
  { prefix: 'entity.name.class',         group: 'ENTITIES', level: 0 },
  { prefix: 'entity.name.type',          group: 'ENTITIES', level: 0 },
  { prefix: 'entity.name.tag',           group: 'ENTITIES', level: 0 },
  { prefix: 'entity.name.section',       group: 'ENTITIES', level: 0 },
  { prefix: 'entity.name.module',        group: 'ENTITIES', level: 0 },
  { prefix: 'entity.name.namespace',     group: 'ENTITIES', level: 2 }, // themes say level 2
  { prefix: 'entity.name.scope',         group: 'ENTITIES', level: 2 }, // themes say level 2
  { prefix: 'entity.name.variable',      group: 'ENTITIES', level: 0 },
  { prefix: 'entity.name.label',         group: 'ENTITIES', level: 0 },
  { prefix: 'entity.name.lifetime',      group: 'ENTITIES', level: 0 },
  { prefix: 'entity.name.record',        group: 'ENTITIES', level: 0 },
  { prefix: 'entity.name.role',          group: 'ENTITIES', level: 0 },
  { prefix: 'entity.name.package',       group: 'ENTITIES', level: 0 },
  { prefix: 'entity.name.filename',      group: 'ENTITIES', level: 0 },
  { prefix: 'entity.name.goto',          group: 'ENTITIES', level: 0 },
  { prefix: 'entity.name.constant',      group: 'ENTITIES', level: 0 },
  { prefix: 'entity.name.tag.wildcard',  group: 'ENTITIES', level: 2 }, // themes say level 2
  { prefix: 'entity.name.tag.yaml',      group: 'ENTITIES', level: 2 }, // themes say level 2
  { prefix: 'entity.name.type.class',    group: 'ENTITIES', level: 2 }, // themes say level 2
  { prefix: 'entity.name.variable.field', group: 'ENTITIES', level: 3 }, // themes say level 3
  { prefix: 'entity.name.variable.local', group: 'ENTITIES', level: 3 }, // themes say level 3
  { prefix: 'entity.name.',              group: 'ENTITIES', level: 0 },
  { prefix: 'entity.other.attribute-name.html', group: 'ENTITIES', level: 0 }, // themes say level 0
  { prefix: 'entity.other.attribute-name', group: 'ENTITIES', level: 2 },
  { prefix: 'entity.other.inherited-class', group: 'ENTITIES', level: 4 },
  { prefix: 'entity.other.alias',        group: 'ENTITIES', level: 2 },
  { prefix: 'entity.other.',             group: 'ENTITIES', level: 2 },
  { prefix: 'entity.global',             group: 'ENTITIES', level: 0 },
  { prefix: 'entity.',                   group: 'ENTITIES', level: 0 },
  { prefix: 'function.parameter',        group: 'VARIABLES', level: 1 }, // themes say level 1
  { prefix: 'function.support',          group: 'SUPPORTS', level: 2 },
  { prefix: 'function.',                 group: 'ENTITIES', level: 0 },
  { prefix: 'heading.',                  group: 'COLOR_1', level: 1 },
  { prefix: 'object',                    group: 'VARIABLES', level: 0 }, // themes say level 0

  // ── STRINGS ──
  { prefix: 'string.quoted',             group: 'STRINGS', level: 1 },
  { prefix: 'string.unquoted',           group: 'STRINGS', level: 1 },
  { prefix: 'string.interpolated',       group: 'STRINGS', level: 1 },
  { prefix: 'string.other',              group: 'STRINGS', level: 1 },
  { prefix: 'string.regexp',             group: 'STRINGS', level: 1 },
  { prefix: 'string.embedded',           group: 'STRINGS', level: 1 },
  { prefix: 'string.comment',            group: 'COLOR_4', level: 4 },
  { prefix: 'string.detected-link',      group: 'COLOR_1', level: 1 },
  { prefix: 'string.',                   group: 'STRINGS', level: 1 },

  // ── SUPPORTS ──
  // Theme consensus: support.type.primitive/swift/vb.asp are level 0, support.constant is level 2
  { prefix: 'support.function',          group: 'SUPPORTS', level: 2 },
  { prefix: 'support.class',             group: 'SUPPORTS', level: 2 },
  { prefix: 'support.type',              group: 'SUPPORTS', level: 2 },
  { prefix: 'support.type.primitive',    group: 'SUPPORTS', level: 0 },
  { prefix: 'support.type.swift',        group: 'SUPPORTS', level: 0 },
  { prefix: 'support.type.vb.asp',       group: 'SUPPORTS', level: 0 },
  { prefix: 'support.constant',          group: 'SUPPORTS', level: 2 }, // themes say level 2
  { prefix: 'support.variable',          group: 'SUPPORTS', level: 0 }, // themes say level 0
  { prefix: 'support.variable.property', group: 'SUPPORTS', level: 0 }, // themes say level 0
  { prefix: 'support.module',            group: 'SUPPORTS', level: 2 },
  { prefix: 'support.other',             group: 'SUPPORTS', level: 2 },
  { prefix: 'support.token',             group: 'SUPPORTS', level: 2 },
  { prefix: 'support.dictionary',        group: 'SUPPORTS', level: 2 },
  { prefix: 'support.directive',         group: 'SUPPORTS', level: 2 },
  { prefix: 'support.asciidoc',          group: 'SUPPORTS', level: 2 },
  { prefix: 'support.',                  group: 'SUPPORTS', level: 2 },

  // ── STORAGES ──
  // Theme consensus: storage/modifier are level 3 (dim)
  { prefix: 'storage.modifier',          group: 'STORAGES', level: 3 },
  { prefix: 'storage.type',              group: 'STORAGES', level: 3 },
  { prefix: 'storage.identifier',        group: 'STORAGES', level: 3 },
  { prefix: 'storage.control',           group: 'STORAGES', level: 3 },
  { prefix: 'storage.class',             group: 'STORAGES', level: 3 },
  { prefix: 'storage.',                  group: 'STORAGES', level: 3 },
  { prefix: 'import.storage',            group: 'STORAGES', level: 3 },

  // ── METAS ──
  { prefix: 'meta.function',             group: 'METAS', level: 2 },
  { prefix: 'meta.class',                group: 'METAS', level: 2 },
  { prefix: 'meta.method',               group: 'METAS', level: 2 },
  { prefix: 'meta.block',                group: 'METAS', level: 2 },
  { prefix: 'meta.tag',                  group: 'METAS', level: 2 },
  { prefix: 'meta.selector',             group: 'METAS', level: 2 },
  { prefix: 'meta.property',             group: 'METAS', level: 2 },
  { prefix: 'meta.structure',            group: 'METAS', level: 2 },
  { prefix: 'meta.definition',           group: 'METAS', level: 2 },
  { prefix: 'meta.declaration',          group: 'METAS', level: 2 },
  { prefix: 'meta.import',               group: 'METAS', level: 2 },
  { prefix: 'meta.require',              group: 'METAS', level: 2 },
  { prefix: 'meta.delimiter',            group: 'METAS', level: 2 },
  { prefix: 'meta.diff',                 group: 'METAS', level: 2 },
  { prefix: 'meta.separator',            group: 'METAS', level: 2 },
  { prefix: 'meta.group',                group: 'METAS', level: 2 },
  { prefix: 'meta.array',                group: 'METAS', level: 2 },
  { prefix: 'meta.object',               group: 'METAS', level: 2 },
  { prefix: 'meta.parameter',            group: 'METAS', level: 2 },
  { prefix: 'meta.export',               group: 'METAS', level: 2 },
  { prefix: 'meta.use',                  group: 'METAS', level: 2 },
  { prefix: 'meta.type',                 group: 'METAS', level: 2 },
  { prefix: 'meta.embedded',             group: 'METAS', level: 2 },
  { prefix: 'meta.scriptblock',          group: 'METAS', level: 2 },
  { prefix: 'meta.expression',           group: 'METAS', level: 2 },
  { prefix: 'meta.scope',                group: 'METAS', level: 2 },
  { prefix: 'meta.interpolation',        group: 'METAS', level: 2 },
  { prefix: 'meta.var',                  group: 'METAS', level: 2 },
  { prefix: 'meta.assertion',            group: 'METAS', level: 2 },
  { prefix: 'meta.hashtable',            group: 'METAS', level: 2 },
  { prefix: 'meta.interface',            group: 'METAS', level: 2 },
  { prefix: 'meta.symbol',               group: 'METAS', level: 2 },
  { prefix: 'meta.vector',               group: 'METAS', level: 2 },
  { prefix: 'meta.metadata',             class: 'METAS', level: 2 },
  { prefix: 'meta.member',               group: 'METAS', level: 2 },
  { prefix: 'meta.module',               group: 'METAS', level: 2 },
  { prefix: 'meta.preprocessor',         group: 'METAS', level: 2 },
  { prefix: 'meta.output',               group: 'METAS', level: 2 },
  { prefix: 'meta.generic',              group: 'METAS', level: 2 },
  { prefix: 'meta.instance',             group: 'METAS', level: 2 },
  { prefix: 'meta.link',                 group: 'METAS', level: 2 },
  { prefix: 'meta.',                     group: 'METAS', level: 2 },

  // ── CSS (already well-covered, but catch any extras) ──
  { prefix: 'sass.',                     group: 'CSS', level: 0 },
  { prefix: 'selector.',                 group: 'CSS', level: 0 },
  { prefix: 'interpolated.simple',       group: 'CSS', level: 0 },

  // ── Markup / Markdown extras ──
  // Theme consensus: headings are level 3, italic.markdown is level 1
  { prefix: 'markup.heading',            group: 'COLOR_1', level: 3 }, // themes level 3, but semantics say heading=prominent
  { prefix: 'markup.bold',               group: 'COLOR_0', level: 0 },
  { prefix: 'markup.italic',             group: 'COLOR_3', level: 3 },
  { prefix: 'markup.italic.markdown',    group: 'COLOR_3', level: 1 }, // themes say level 1
  { prefix: 'markup.list',               group: 'COLOR_0', level: 0 },
  { prefix: 'markup.raw',                group: 'COLOR_2', level: 2 },
  { prefix: 'markup.fenced_code',        group: 'COLOR_2', level: 0 }, // themes say level 0
  { prefix: 'markup.code',               group: 'COLOR_2', level: 2 },
  { prefix: 'markup.inline',             group: 'COLOR_2', level: 2 },
  { prefix: 'markup.underline',          group: 'COLOR_1', level: 1 },
  { prefix: 'markup.link',               group: 'COLOR_1', level: 1 },
  { prefix: 'markup.table',              group: 'COLOR_0', level: 0 },
  { prefix: 'markup.inserted',           group: 'COLOR_2', level: 2 },
  { prefix: 'markup.deleted',            group: 'COLOR_4', level: 4 },
  { prefix: 'markup.changed',            group: 'COLOR_3', level: 0 }, // themes say level 0
  { prefix: 'markup.highlight',          group: 'COLOR_1', level: 1 },
  { prefix: 'markup.admonition',         group: 'COLOR_2', level: 2 },
  { prefix: 'markup.macro',              group: 'COLOR_2', level: 2 },
  { prefix: 'markup.substitution',       group: 'COLOR_2', level: 2 },
  { prefix: 'markup.meta',               group: 'METAS', level: 2 },
  { prefix: 'markup.other',              group: 'COLOR_0', level: 0 },
  { prefix: 'markup.quote',              group: 'COLOR_3', level: 3 },
  { prefix: 'markup.ignored',            group: 'COLOR_4', level: 4 },
  { prefix: 'markup.untracked',          group: 'COLOR_4', level: 4 },
  { prefix: 'markup.mark',               group: 'COLOR_1', level: 1 },
  { prefix: 'markup.',                   group: 'COLOR_0', level: 0 },
  { prefix: 'md',                        group: 'COLOR_0', level: 0 },

  // ── Invalid / Error ──
  // Note: themes color errors bright (level 0-1). Keeping at level 4 is a Niketa design choice
  // (errors use a distinct palette in the theme, not just dimming).
  { prefix: 'invalid.illegal',           group: 'COLOR_4', level: 4 },
  { prefix: 'invalid.broken',            group: 'COLOR_4', level: 4 },
  { prefix: 'invalid.deprecated',        group: 'COLOR_4', level: 4 },
  { prefix: 'invalid.unimplemented',     group: 'COLOR_4', level: 4 },
  { prefix: 'invalid.',                  group: 'COLOR_4', level: 4 },
  { prefix: 'message.error',             group: 'COLOR_4', level: 4 },
  { prefix: 'carriage-return',           group: 'COLOR_4', level: 4 },
  { prefix: 'token.error-token',         group: 'COLOR_4', level: 4 },
  { prefix: 'token.warn-token',          group: 'COLOR_4', level: 0 }, // themes say level 0
  { prefix: 'token.info-token',          group: 'COLOR_2', level: 2 },
  { prefix: 'token.debug-token',         group: 'COLOR_2', level: 2 },
  { prefix: 'token.package',             group: 'COLOR_0', level: 3 }, // themes say level 3
  { prefix: 'token.storage',             group: 'STORAGES', level: 3 }, // themes say level 3
  { prefix: 'token.',                    group: 'COLOR_2', level: 2 },
  { prefix: 'todo.',                     group: 'COLOR_4', level: 4 },

  // ── Source / Text base ──
  { prefix: 'source.',                   group: 'COLOR_0', level: 0 },
  { prefix: 'text.',                     group: 'COLOR_0', level: 0 },
  { prefix: 'emphasis',                  group: 'COLOR_3', level: 3 },
  { prefix: 'strong',                    group: 'COLOR_0', level: 0 },
  { prefix: 'inline-color-decoration',   group: 'COLOR_0', level: 0 },
  { prefix: 'control.elements',          group: 'COLOR_0', level: 0 },

  // ── Special / Other ──
  { prefix: '*link*',                    group: 'COLOR_1', level: 1 },
  { prefix: '*uri*',                     group: 'COLOR_1', level: 1 },
  { prefix: '*url*',                     group: 'COLOR_1', level: 1 },
  { prefix: '>',                         group: 'PUNCTUATIONS', level: 0 },
  { prefix: 'JSXNested',                 group: 'COLOR_0', level: 0 },
  { prefix: 'less',                      group: 'COLOR_0', level: 0 },
  { prefix: 'accent.',                   group: 'COLOR_2', level: 2 },
  { prefix: 'namespace.',                group: 'METAS', level: 2 },
  { prefix: 'parameter.variable',        group: 'VARIABLES', level: 3 },
  { prefix: 'entity',                    group: 'ENTITIES', level: 0 },
  { prefix: 'constant',                  group: 'CONSTANTS', level: 4 },
  { prefix: 'keyword',                   group: 'KEYWORDS', level: 3 },
  { prefix: 'punctuation',               group: 'PUNCTUATIONS', level: 0 },
  { prefix: 'source',                    group: 'COLOR_0', level: 0 },
  { prefix: 'storage',                   group: 'STORAGES', level: 1 },
  { prefix: 'string',                    group: 'STRINGS', level: 1 },
  { prefix: 'support',                   group: 'SUPPORTS', level: 2 },
  { prefix: 'meta',                      group: 'METAS', level: 2 },
  { prefix: 'variable',                  group: 'VARIABLES', level: 2 },
  { prefix: 'markup',                    group: 'COLOR_0', level: 0 },
  { prefix: 'invalid',                   group: 'COLOR_4', level: 4 },
  { prefix: 'text',                      group: 'COLOR_0', level: 0 },
  { prefix: 'function',                  group: 'ENTITIES', level: 0 },
  { prefix: 'comment',                   group: 'COLOR_4', level: 4 },
  { prefix: 'tag',                       group: 'COLOR_0', level: 0 },
]

// ── Determine target group+level for a scope ─────────────────────────

function categorizeScope(scope, consensus) {
  // Pass A: prefix matching
  let bestRule = null
  for (const rule of PREFIX_RULES) {
    if (scope === rule.prefix || scope.startsWith(rule.prefix)) {
      bestRule = rule
      break
    }
  }

  // Pass B: Theme consensus override
  const consensusInfo = consensus[scope]
  const hasConsensus = consensusInfo && consensusInfo.themeCount > 0

  // Determine resolved group and level
  let group
  let level

  if (bestRule) {
    group = bestRule.group
    level = bestRule.level
  } else {
    group = null
    level = null
  }

  // If theme consensus exists and we have a rule, log conflicts
  if (hasConsensus && bestRule) {
    const consensusLevel = consensusInfo.consensusLevel
    if (consensusLevel !== null && Math.abs(consensusLevel - level) > 1) {
      console.log(
        `  ⚠ CONFLICT: "${scope}" → rule says level ${level} (${group}), ` +
        `themes say level ${consensusLevel} (conf=${consensusInfo.confidence})`
      )
    }
  }

  // If no rule but theme consensus exists, use consensus
  if (!bestRule && hasConsensus && consensusInfo.consensusLevel !== null) {
    group = 'COLOR_' + consensusInfo.consensusLevel
    level = consensusInfo.consensusLevel
  }

  return { group, level, hasConsensus }
}

// ── Main ─────────────────────────────────────────────────────────────

async function main() {
  // Read the current base-palette.js to extract existing groups
  const basePaletteCode = fs.readFileSync(BASE_PALETTE_PATH, 'utf-8')

  // Extract existing group arrays
  const groupNames = ['VARIABLES', 'KEYWORDS', 'PUNCTUATIONS', 'CONSTANTS', 'CSS',
    'ENTITIES', 'STRINGS', 'SUPPORTS', 'METAS', 'STORAGES']

  const existingGroups = {}
  for (const name of groupNames) {
    existingGroups[name] = {}
    for (let level = 0; level < 5; level++) {
      existingGroups[name][level] = []
    }
  }

  // Parse existing group content from the source
  // We'll use a simpler approach: eval the file and read group vars
  // But they're local vars. Let's use a different approach.
  // Actually, we can just parse the array literals.

  // For now, let's focus on the new scopes and output a JSON we can use
  // to manually construct the new base-palette.js

  // Read consensus map
  const consensusPath = resolve(THEMES_DATA_DIR, '_scope-color-map.json')
  let consensus = {}
  try {
    consensus = await readJson(consensusPath)
  } catch {
    consensus = {}
  }

  // Extract missing scopes from the source
  const missingMatch = basePaletteCode.match(/function getMissingScopesList\(\) \{[\s\S]*?return \[([\s\S]*?)\]/)
  const missingScopes = []
  if (missingMatch) {
    const arrayContent = missingMatch[1]
    const scopeMatches = arrayContent.match(/'([^']*)'/g)
    if (scopeMatches) {
      missingScopes.push(...scopeMatches.map(s => s.replace(/'/g, '')))
    }
  }
  console.log(`Processing ${missingScopes.length} missing scopes...\n`)

  // Categorize each scope
  const categorized = {
    drop: [],
    noRuleNoConsensus: [],
    byGroup: {},
    directColor: { 0: [], 1: [], 2: [], 3: [], 4: [] },
  }

  for (const scope of missingScopes) {
    const { group, level, hasConsensus } = categorizeScope(scope, consensus)

    if (!group) {
      categorized.noRuleNoConsensus.push(scope)
      continue
    }

    if (group.startsWith('COLOR_')) {
      const colorIdx = Number(group.replace('COLOR_', ''))
      categorized.directColor[colorIdx].push(scope)
    } else {
      if (!categorized.byGroup[group]) {
        categorized.byGroup[group] = {}
      }
      if (!categorized.byGroup[group][level]) {
        categorized.byGroup[group][level] = []
      }
      categorized.byGroup[group][level].push(scope)
    }
  }

  // Print summary
  console.log('\n=== Categorization Summary ===\n')

  let totalAssigned = 0
  for (const [group, levels] of Object.entries(categorized.byGroup)) {
    let groupTotal = 0
    for (let l = 0; l < 5; l++) {
      const items = levels[l] || []
      if (items.length > 0) {
        groupTotal += items.length
      }
    }
    totalAssigned += groupTotal
    console.log(`  ${group}: ${groupTotal} scopes`)
    for (let l = 0; l < 5; l++) {
      const items = levels[l] || []
      if (items.length > 0) {
        console.log(`    level ${l}: ${items.length} scopes`)
      }
    }
  }

  for (let i = 0; i < 5; i++) {
    const items = categorized.directColor[i]
    if (items.length > 0) {
      totalAssigned += items.length
      console.log(`  COLOR_${i} (direct): ${items.length} scopes`)
    }
  }

  console.log(`\n  Total assigned: ${totalAssigned}`)
  console.log(`  No rule & no consensus (DROP): ${categorized.noRuleNoConsensus.length}`)

  // Save the categorized output
  const outputPath = resolve(THEMES_DATA_DIR, '_categorized-scopes.json')
  await writeJson(outputPath, categorized, { spaces: 2 })
  console.log(`\nSaved to ${outputPath}`)

  // Also save the full mapping for base-palette generation
  const fullMap = {}
  for (const [group, levels] of Object.entries(categorized.byGroup)) {
    for (let l = 0; l < 5; l++) {
      const items = levels[l] || []
      for (const scope of items) {
        fullMap[scope] = { group, level: l }
      }
    }
  }
  for (let i = 0; i < 5; i++) {
    for (const scope of categorized.directColor[i]) {
      fullMap[scope] = { group: `COLOR_${i}`, level: i }
    }
  }
  for (const scope of categorized.noRuleNoConsensus) {
    fullMap[scope] = { group: 'DROP', level: null }
  }

  const mapPath = resolve(THEMES_DATA_DIR, '_scope-full-map.json')
  await writeJson(mapPath, fullMap, { spaces: 2 })

  // Print the scopes to drop
  if (categorized.noRuleNoConsensus.length > 0) {
    console.log(`\n=== Scopes to DROP (${categorized.noRuleNoConsensus.length}) ===`)
    for (const scope of categorized.noRuleNoConsensus) {
      console.log(`  - '${scope}'`)
    }
  }
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
