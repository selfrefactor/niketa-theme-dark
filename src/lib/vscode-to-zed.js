/**
 * Convert a VS Code theme JSON (as produced by `yarn out`) into a
 * Zed theme family, following the Zed theme schema v0.2.0:
 * https://zed.dev/schema/themes/v0.2.0.json
 *
 * The conversion is lossy by design: VS Code's TextMate `tokenColors`
 * are folded into Zed's semantic `syntax` tags via SCOPE_MAP, and the
 * VS Code UI `colors` are mapped onto Zed's style keys via COLOR_PATHS.
 */

const COLOR_PATHS = [
  // [zedKey, vscodeKey] - only present vscodeKeys produce output
  ['background', 'editor.background'],
  ['editor.background', 'editor.background'],
  ['editor.foreground', 'editor.foreground'],
  ['text', 'editor.foreground'],
  ['text.muted', 'foreground'],
  ['text.accent', 'tab.activeForeground'],
  ['text.disabled', 'list.inactiveSelectionForeground'],
  ['icon', 'foreground'],
  ['icon.muted', 'sideBar.foreground'],
  ['icon.accent', 'tab.activeForeground'],
  ['icon.disabled', 'list.inactiveSelectionForeground'],
  ['border', 'sideBar.border'],
  ['border.variant', 'panel.border'],
  ['border.focused', 'editorGroup.focusedEmptyBorder'],
  ['border.selected', 'editor.rangeHighlightBorder'],
  ['element.background', 'button.secondaryBackground'],
  ['element.hover', 'toolbar.hoverBackground'],
  ['element.active', 'list.focusBackground'],
  ['element.selected', 'list.activeSelectionBackground'],
  ['element.disabled', 'checkbox.background'],
  ['ghost_element.hover', 'list.hoverBackground'],
  ['ghost_element.active', 'list.activeSelectionBackground'],
  ['ghost_element.selected', 'list.activeSelectionBackground'],
  ['elevated_surface.background', 'sideBarSectionHeader.background'],
  ['surface.background', 'sideBar.background'],
  ['panel.background', 'panel.background'],
  ['panel.focused_border', 'editorGroup.border'],
  ['panel.indent_guide', 'tree.indentGuidesStroke'],
  ['status_bar.background', 'statusBar.background'],
  ['title_bar.background', 'statusBar.background'],
  ['title_bar.inactive_background', 'tab.inactiveBackground'],
  ['toolbar.background', 'sideBar.background'],
  ['tab_bar.background', 'activityBar.activeBackground'],
  ['tab.active_background', 'tab.activeBackground'],
  ['tab.inactive_background', 'tab.inactiveBackground'],
  ['pane.focused_border', 'editorGroup.focusedEmptyBorder'],
  ['pane_group.border', 'editorGroup.border'],
  ['scrollbar.thumb.background', 'editorOverviewRuler.background'],
  ['scrollbar.track.background', 'editor.background'],
  ['search.match_background', 'editor.findMatchHighlightBackground'],
  ['editor.active_line.background', 'editor.lineHighlightBackground'],
  ['editor.highlighted_line.background', 'editor.lineHighlightBackground'],
  ['editor.line_number', 'editorLineNumber.foreground'],
  ['editor.active_line_number', 'editorLineNumber.activeForeground'],
  ['editor.document_highlight.read_background', 'editor.wordHighlightBackground'],
  ['editor.document_highlight.write_background', 'editor.wordHighlightStrongBackground'],
  ['editor.document_highlight.bracket_background', 'editorBracketMatch.background'],
  ['terminal.background', 'terminal.background'],
  ['terminal.foreground', 'terminal.foreground'],
  ['terminal.ansi.black', 'terminal.ansiBlack'],
  ['terminal.ansi.red', 'terminal.ansiRed'],
  ['terminal.ansi.green', 'terminal.ansiGreen'],
  ['terminal.ansi.yellow', 'terminal.ansiYellow'],
  ['terminal.ansi.blue', 'terminal.ansiBlue'],
  ['terminal.ansi.magenta', 'terminal.ansiMagenta'],
  ['terminal.ansi.cyan', 'terminal.ansiCyan'],
  ['terminal.ansi.white', 'terminal.ansiWhite'],
  ['terminal.ansi.bright_black', 'terminal.ansiBrightBlack'],
  ['terminal.ansi.bright_red', 'terminal.ansiBrightRed'],
  ['terminal.ansi.bright_green', 'terminal.ansiBrightGreen'],
  ['terminal.ansi.bright_yellow', 'terminal.ansiBrightYellow'],
  ['terminal.ansi.bright_blue', 'terminal.ansiBrightBlue'],
  ['terminal.ansi.bright_magenta', 'terminal.ansiBrightMagenta'],
  ['terminal.ansi.bright_cyan', 'terminal.ansiBrightCyan'],
  ['terminal.ansi.bright_white', 'terminal.ansiBrightWhite'],
  ['created', 'gitDecoration.addedResourceForeground'],
  ['deleted', 'gitDecoration.deletedResourceForeground'],
  ['modified', 'gitDecoration.modifiedResourceForeground'],
  ['renamed', 'gitDecoration.stageModifiedResourceForeground'],
  ['conflict', 'gitDecoration.conflictingResourceForeground'],
  ['ignored', 'gitDecoration.ignoredResourceForeground'],
  ['hidden', 'gitDecoration.ignoredResourceForeground'],
  ['error', 'problemsErrorIcon.foreground'],
  ['error.border', 'editorOverviewRuler.errorForeground'],
  ['warning', 'problemsWarningIcon.foreground'],
  ['warning.border', 'editorOverviewRuler.warningForeground'],
  ['info', 'problemsInfoIcon.foreground'],
  ['success', 'gitDecoration.addedResourceForeground'],
  ['hint', 'notifications.foreground'],
]

const ACCENT_SOURCES = [
  'editor.rangeHighlightBorder',
  'editorBracketHighlight.foreground1',
  'editorBracketHighlight.foreground2',
  'editorBracketHighlight.foreground3',
  'editorBracketHighlight.foreground4',
  'editorLineNumber.activeForeground',
  'statusBarItem.remoteBackground',
  'terminalCursor.foreground',
  'textLink.foreground',
]

/**
 * TextMate scope -> Zed syntax tag.
 *
 * Every pattern is a dotted prefix: it matches a scope when the scope
 * starts with the pattern followed by `.` or `_`. The longest matching
 * pattern wins, so `variable.other.property` outranks `variable.other`;
 * ties keep the earlier entry, so list more specific tags first.
 */
const SCOPE_MAP = {
  'comment.doc': ['comment.block.documentation'],
  comment: [
    'comment.block',
    'comment.line',
    'comment.unparsed',
    'comment.punctuation',
    'punctuation.definition.comment',
    'comment',
    'todo',
  ],
  'string.special': ['string.symbol', 'string.interpolation'],
  'string.escape': ['constant.character.escape', 'string.escape', 'constant.escape'],
  'string.regexp': ['string.regexp'],
  string: [
    'string.quoted.double',
    'string.quoted.single',
    'string.quoted.docstring',
    'string.quoted',
    'string.template',
    'string.unquoted',
    'string.interpolated',
    'string.embedded',
    'string.comment',
    'string.regexp.character-class',
    'string',
  ],
  link_text: ['string.other.link.title', 'string.other.link.description', 'markup.underline.link.image', 'meta.link'],
  link_uri: [
    'string.detected-link',
    'string.other.link',
    'markup.underline.link',
    'markup.other.url',
    'constant.other.reference.link',
    'support.function.url',
  ],
  number: [
    'constant.numeric',
    'unit.css',
    'unit.less',
    'unit.sass',
    'unit.scss',
    'constant.character.numeric',
  ],
  boolean: ['constant.language.boolean'],
  'constant.builtin': ['constant.language', 'support.constant'],
  constant: [
    'constant.character',
    'constant.other',
    'constant.keyword',
    'constant.pathname',
    'constant.regexp',
    'constant.type-constructor',
    'rgb-value',
    'inline-color-decoration',
    'accent.xi',
    'entity.global',
    'entity.name.constant',
    'variable.other.constant',
    'variable.object.constant',
    'constant',
  ],
  'keyword.control': [
    'keyword.control',
    'keyword.control.conditional',
    'keyword.control.repeat',
    'keyword.control.loop',
    'keyword.control.flow',
    'keyword.control.class',
    'keyword.control.def',
    'keyword.control.module',
    'keyword.control.default',
    'storage.modifier.import',
    'import.storage',
  ],
  'keyword.directive': [
    'keyword.control.directive',
    'keyword.control.at-rule',
    'keyword.other.preprocessor',
    'keyword.other.important',
    'meta.preprocessor',
    'meta.directive',
    'markup.macro',
    'support.directive',
  ],
  'keyword.storage': ['storage', 'storage.modifier', 'storage.control', 'storage.identifier', 'token.storage'],
  keyword: ['keyword.symbol', 'keyword.type', 'keyword.other', 'keyword', 'control.elements'],
  operator: [
    'keyword.operator',
    'punctuation.operator',
    'punctuation.accessor',
    'punctuation.dot',
    'punctuation.other.period',
    'operator',
  ],
  'function.method': ['entity.name.method', 'entity.name.function.method', 'meta.method.identifier'],
  'function.macro': ['entity.name.function.macro'],
  'function.builtin': ['function.support.builtin', 'function.support.core', 'support.function'],
  'function.decorator': ['tag.decorator', 'support.token.decorator', 'meta.function.decorator'],
  function: [
    'entity.name.function',
    'entity.name.function-call',
    'entity.name.scope-resolution.function',
    'function.css',
    'function.less',
    'function.sass',
    'function.scss',
    'meta.function-call',
    'meta.function.definition',
    'meta.function',
    'meta.method-call',
    'meta.method.declaration',
    'function',
  ],
  'type.interface': ['entity.name.type.interface', 'storage.type.interface', 'meta.type.interface', 'meta.interface'],
  'type.super': ['entity.other.inherited-class', 'entity.name.type.super'],
  'type.builtin': [
    'support.type',
    'storage.type.core',
    'support.class.builtin',
    'storage.class',
    'support.type.primitive',
  ],
  type: [
    'entity.name',
    'entity',
    'object',
    'entity.name.type',
    'entity.name.class',
    'entity.name.instance',
    'storage.type',
    'support.class',
    'meta.definition.type',
    'token.storage.type',
    'variable.type.elm',
    'meta.function.type',
  ],
  'tag.attribute': [
    'entity.other.attribute-name',
    'entity.other.attribute',
    'entity.name.tag.class',
    'entity.name.tag.id',
  ],
  tag: [
    'entity.name.tag',
    'meta.tag',
    'tag',
    'JSXNested',
    'token.package',
    'expression.ng',
  ],
  namespace: [
    'entity.name.namespace',
    'entity.name.module',
    'entity.name.type.module',
    'entity.name.type.namespace',
    'entity.name.package',
    'meta.namespace',
    'meta.module',
    'namespace.open',
    'support.module',
    'support.other.namespace',
    'support.orther.namespace',
    'support.other.module',
    'meta.declaration.module',
    'meta.module-reference',
    'meta.module.name',
  ],
  import: ['meta.import', 'meta.use', 'meta.require'],
  variable: [
    'variable.other',
    'variable.object',
    'variable.readwrite',
    'variable.parameter',
    'variable.function',
    'variable.interpolation',
    'entity.name.variable',
    'variable',
    'meta.parameter',
    'token.variable',
    'text.variable',
    'variable.less',
    'variable.css',
    'variable.sass',
    'variable.scss',
    'variable.graphql',
    'function.parameter',
    'parameter.variable.function',
    'entity.other.alias',
    'meta.var.expr',
    'meta.variables.graphql',
    'meta.definition.variable',
  ],
  'variable.special': [
    'variable.language',
    'variable.other.special',
    'support.variable',
    'support.other.variable',
    'variable.other.member',
    'variable.other.object',
    'meta.object-literal.key',
  ],
  self: ['variable.language.this', 'variable.language.self', 'variable.language.super', 'keyword.other.this'],
  property: [
    'support.type.property-name',
    'support.type.property',
    'support.dictionary',
    'variable.other.property',
    'variable.object.property',
    'support.variable.property',
    'meta.property-name',
    'meta.property-list',
    'meta.property-value',
    'meta.property.object',
    'meta.definition.property',
    'meta.selector',
    'selector.sass',
    'sass.script.maps',
    'constant.other.object.key',
    'entity.other.ng-binding',
    'entity.name.record.field.accessor',
    'property',
  ],
  embedded: [
    'meta.embedded',
    'meta.template.expression',
    'meta.interpolation',
    'punctuation.section.embedded',
    'string.embedded',
    'interpolated.simple.source',
    'source.embedded',
  ],
  error: [
    'invalid',
    'invalid.broken',
    'invalid.deprecated',
    'invalid.illegal',
    'invalid.unimplemented',
    'invalid.xi',
    'message.error',
    'token.error-token',
  ],
  warning: ['token.warn-token', 'markup.changed', 'markup.untracked'],
  hint: ['token.info-token', 'token.debug-token'],
  heading: [
    'markup.heading',
    'entity.name.section',
    'heading.1.markdown',
    'heading.2.markdown',
    'heading.3.markdown',
    'heading.4.markdown',
    'markup.admonition',
  ],
  emphasis: ['markup.italic', 'emphasis'],
  strong: ['markup.bold', 'strong'],
  strikethrough: ['markup.deleted', 'markup.substitution'],
  underline: ['markup.underline'],
  label: ['entity.name.label', 'entity.name.goto-label', 'entity.name.filename', 'entity.name.lifetime', 'entity.name.role', 'constant.other.reference.label'],
  punctuation: [
    'punctuation.definition',
    'punctuation.accessor',
    'punctuation',
    'punctuation.other',
    'punctuation.type',
    'punctuation.colon',
    'meta.separator',
  ],
  'punctuation.brackets': [
    'punctuation.section',
    'punctuation.bracket',
    'meta.brace',
    'punctuation.parenthesis',
    'punctuation.parens',
    'brackethighlighter',
    'block.scope',
    'meta.delimiter',
    'meta.group',
    'function.brace',
  ],
  'punctuation.delimiter': [
    'punctuation.separator',
    'punctuation.terminator',
    'punctuation.definition.parameters',
    'punctuation.definition.arguments',
    'punctuation.definition.array',
    'punctuation.definition.string',
  ],
  'punctuation.list_marker': [
    'punctuation.definition.list',
    'beginning.punctuation.definition.list',
    'markup.list.bullet',
  ],
  'punctuation.special': [
    'punctuation.special',
    'punctuation.definition.template-expression',
    'punctuation.definition.variable',
    'punctuation.definition.heading',
    'beginning.punctuation.definition.quote',
    'punctuation.quasi.element',
    'punctuation.definition.bold',
    'punctuation.definition.italic',
  ],
  'diff.plus': ['markup.inserted'],
  'diff.minus': ['markup.deleted'],
  'text.literal': ['markup.raw', 'markup.inline.raw', 'markup.code', 'markup.fenced_code', 'markup.quote'],
}

const FONT_WEIGHTS = { bold: 700 }

/** Scope containers that carry no color of their own and should be skipped silently. */
const CONTAINER_PREFIXES = [
  'source.',
  'text.',
  'meta.',
  'markup.table',
  'markup.other.command',
  'markup',
  'markup.list',
  'markup.link',
  'markup.highlight',
  'support.other',
  'less',
  'md',
]

/** Bare template-marker scopes left over in the palette (e.g. `*link*`). */
const SKIP_EXACT = new Set([
  'source',
  'object',
  '>',
  '<',
  'meta',
  'support',
  'support.asciidoc',
  'support.other',
  'carriage-return',
  '*link*',
  '*uri*',
  '*url*',
])

let _rules
function rules() {
  if (!_rules) {
    _rules = []
    for (const [tag, patterns] of Object.entries(SCOPE_MAP)) {
      for (const pattern of patterns) {
        _rules.push({ tag, pattern })
      }
    }
  }
  return _rules
}

function matchScope(scope) {
  let best = null
  for (const rule of rules()) {
    const len = rule.pattern.length
    let ok = false
    if (scope === rule.pattern) ok = true
    else if (scope.startsWith(rule.pattern)) {
      const next = scope[len]
      ok = next === '.' || next === '_'
    }
    if (ok && (!best || len > best.score)) {
      best = { tag: rule.tag, score: len }
    }
  }
  return best ? best.tag : null
}

/** Take the innermost token scope out of combined scopes (`a > b`, `a b`). */
function innermostScope(scope) {
  const parts = String(scope).split(/[>\s]+/).filter(Boolean)
  return parts.length > 0 ? parts[parts.length - 1] : ''
}

function isContainerScope(scope) {
  return CONTAINER_PREFIXES.some(prefix => scope.startsWith(prefix))
}

function resolveTag(scope) {
  return matchScope(innermostScope(scope))
}

function fontStyleFrom(settings) {
  const fontStyle = settings.fontStyle
  if (!fontStyle) return null
  const style = {}
  for (const part of fontStyle.split(/\s+/)) {
    if (part === 'italic') style.font_style = 'italic'
    else if (part === 'bold') style.font_weight = FONT_WEIGHTS.bold
  }
  return Object.keys(style).length ? style : null
}

function convertSyntax(tokenColors) {
  const syntax = {}
  const unmatched = []
  for (const tokenColor of tokenColors) {
    const settings = tokenColor.settings || {}
    const scopes = Array.isArray(tokenColor.scope) ? tokenColor.scope : [tokenColor.scope]
    const fontStyle = fontStyleFrom(settings)
    for (const rawScope of scopes) {
      const scope = innermostScope(rawScope)
      const tag = matchScope(scope)
      if (!tag) {
        const skip =
          scope === '' ||
          SKIP_EXACT.has(scope) ||
          SKIP_EXACT.has(String(rawScope)) ||
          isContainerScope(String(rawScope)) ||
          isContainerScope(scope)
        if (skip) continue
        unmatched.push(rawScope)
        continue
      }
      const current = syntax[tag] || { color: settings.foreground }
      if (fontStyle) Object.assign(current, fontStyle)
      syntax[tag] = current
    }
  }
  return { syntax, unmatched }
}

function expandHex(hex) {
  if (/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.test(hex)) {
    return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
  }
  if (/^#([0-9a-f])([0-9a-f])([0-9a-f])([0-9a-f])$/i.test(hex)) {
    return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}${hex[4]}${hex[4]}`
  }
  return hex
}

function hexWithAlpha(hex, alpha) {
  const full = expandHex(hex)
  return /^#[0-9a-f]{6}$/i.test(full) ? `${full}${alpha}` : hex
}

function convertColors(vscodeColors) {
  const style = { 'background.appearance': 'opaque' }
  for (const [zedKey, vscodeKey] of COLOR_PATHS) {
    const value = vscodeColors[vscodeKey]
    if (value) style[zedKey] = value
  }
  // The light theme collection defines no editor.foreground; fall back to the
  // global `foreground` (what VS Code displays as default text).
  if (!style['editor.foreground'] && vscodeColors.foreground) {
    style['editor.foreground'] = vscodeColors.foreground
    if (!style.text) style.text = vscodeColors.foreground
  }
  // status color backgrounds (catppuccin-style alpha variants)
  for (const status of ['created', 'deleted', 'modified', 'renamed', 'conflict', 'ignored', 'hidden']) {
    if (!style[status]) continue
    style[`${status}.border`] = style[status]
    style[`${status}.background`] = hexWithAlpha(style[status], '26')
  }
  // accents used for cursor/selection/active highlights
  const accents = []
  for (const source of ACCENT_SOURCES) {
    const value = vscodeColors[source]
    if (value && !accents.includes(value)) accents.push(value)
    if (accents.length >= 6) break
  }
  if (accents.length > 0) style.accents = accents
  return style
}

/**
 * @param {object} vscodeTheme - a `themes/*.json` file produced by `yarn out`
 * @param {object} options
 * @param {string} options.familyName - e.g. "Niketa Dark"
 * @param {string} options.author - e.g. "selfrefactor"
 * @returns {{ theme: object, unmatched: string[] }} the single-theme family + scopes that could not be mapped
 */
function convertTheme(vscodeTheme, { familyName, author }) {
  const appearance = vscodeTheme.type === 'light' ? 'light' : 'dark'
  const { syntax, unmatched } = convertSyntax(vscodeTheme.tokenColors || [])
  const style = convertColors(vscodeTheme.colors || {})
  style.syntax = syntax
  const theme = {
    name: vscodeTheme.name,
    appearance,
    style,
  }
  const family = {
    $schema: 'https://zed.dev/schema/themes/v0.2.0.json',
    name: familyName,
    author,
    themes: [theme],
  }
  return { theme: family, unmatched }
}

exports.convertTheme = convertTheme
exports.COLOR_PATHS = COLOR_PATHS
exports.SCOPE_MAP = SCOPE_MAP
exports.resolveTag = resolveTag