const { BACK_COLOR } = require('./back-color.js')
const { CHROME_COLOR } = require('./common.js')
const { listColors } = require('./list-colors.js')
const { otherColors } = require('./other-colors.js')
const { sidebarColors } = require('./sidebar-colors.js')

const scrollbarColors = {
  'editorOverviewRuler.addedForeground': '#47ffa0',
  'editorOverviewRuler.background': BACK_COLOR,
  'editorOverviewRuler.border': '#7f7f7f4d',
  'editorOverviewRuler.bracketMatchForeground': '#40C4FF40',
  'editorOverviewRuler.commonContentForeground': '#474e6c',
  'editorOverviewRuler.currentContentForeground': '#535664',
  'editorOverviewRuler.deletedForeground': '#E040FBa0',
  'editorOverviewRuler.errorForeground': '#FF5252',
  'editorOverviewRuler.findMatchForeground': '#a9b1d6a4',
  'editorOverviewRuler.incomingContentForeground': '#859900a0',
  'editorOverviewRuler.infoForeground': '#FFFF00a0',
  'editorOverviewRuler.modifiedForeground': '#40C4FFa0',
  'editorOverviewRuler.rangeHighlightForeground': '#a9b1d689',
  'editorOverviewRuler.selectionHighlightForeground': '#a9b1d644',
  'editorOverviewRuler.warningForeground': '#FFAB40',
  'editorOverviewRuler.wordHighlightForeground': '#bb9af755',
  'editorOverviewRuler.wordHighlightStrongForeground': '#bb9af766',
}
const TRANSPARENCY = '22'
const MATCH_OPACITY = '2'

const selectionColors = {
  'editor.findMatchBackground': `#ccc${MATCH_OPACITY}`,
  'editor.findMatchHighlightBackground': `#888${MATCH_OPACITY}`,
  'editor.findRangeHighlightBackground': `#fff${MATCH_OPACITY}`,
  'editor.inactiveSelectionBackground': `#aba${MATCH_OPACITY}`,
  'editor.selectionBackground': `#555`,
  'editor.selectionHighlightBackground': `#505`,
  'editor.wordHighlightBackground': `#add${MATCH_OPACITY}`,
  'editor.wordHighlightStrongBackground': `#aee${MATCH_OPACITY}`,
  'peekViewEditor.matchHighlightBackground': `#888${MATCH_OPACITY}`,
  'terminal.selectionBackground': '#ffffff',
}

function newColors() {
  return {
    'notebook.outputContainerBackgroundColor': '#000',
    'peekViewEditor.matchHighlightBackground': `#aaab9c${TRANSPARENCY}`,
  }
}

const bracketColors = {
  'editorBracketHighlight.foreground1': '#c9a86a',
  'editorBracketHighlight.foreground2': '#aaee11',
  'editorBracketHighlight.foreground3': '#ffd700',
  'editorBracketHighlight.foreground4': '#00ff00',
  'editorBracketHighlight.foreground5': '#FFAB40',
  'editorBracketHighlight.foreground6': '#64e986',
  'editorBracketMatch.background': `#1fffff${TRANSPARENCY}`,
  'editorBracketMatch.border': BACK_COLOR,
}
const tabColors = {
  'tab.activeBackground': BACK_COLOR,
  'tab.activeBorder': BACK_COLOR,
  'tab.activeForeground': '#f2aa44',
  'tab.border': '#cacaca',
  'tab.inactiveBackground': '#444c',
  'tab.inactiveForeground': '#f2aa4499',
  'tab.unfocusedActiveBackground': CHROME_COLOR,
  'tab.unfocusedActiveBorder': CHROME_COLOR,
  'tab.unfocusedActiveForeground': '#aa769b',
}
const gitColors = {
  'gitDecoration.addedResourceForeground': '#ff1',
  'gitDecoration.conflictingResourceForeground': '#6c6cc4',
  'gitDecoration.deletedResourceForeground': '#c74e39',
  'gitDecoration.ignoredResourceForeground': '#8c8c8c',
  // this dark is conflicting with dark background of inactive tabs
  'gitDecoration.modifiedResourceForeground': '#f6cbc1',
  'gitDecoration.stageDeletedResourceForeground': '#e477e4',
  'gitDecoration.stageModifiedResourceForeground': '#e4e4e4',
  'gitDecoration.submoduleResourceForeground': '#8db9e2',
  'gitDecoration.untrackedResourceForeground': '#c2aa4d',
}

function getChromeColors() {
  return {
    'editor.background': BACK_COLOR,
    ...newColors(),
    ...otherColors,
    ...sidebarColors,
    ...bracketColors,
    ...tabColors,
    ...scrollbarColors,
    ...selectionColors,
    ...listColors,
    ...gitColors,
  }
}

exports.getChromeColors = getChromeColors
