/**
 * Step 2: Analyze theme data and build a scope→color-level consensus map.
 *
 * For each scope in getMissingScopesList(), determines which COLOR_X bucket
 * (0-4) popular themes assign to it, by:
 *
 * 1. Clustering each theme's hex colors into 5 luminance levels (matching
 *    the COLOR_0..COLOR_4 scheme where 0 = brightest, 4 = dimmest)
 * 2. For each scope, recording which level each theme assigns
 * 3. Computing the consensus level across all themes
 *
 * Output: src/analysis/scope-color-map.json
 */

const { readJson, writeJson } = require('fs-extra')
const { resolve } = require('node:path')
const { colord, extend } = require('colord')
const lchPlugin = require('colord/plugins/lch')
const namesPlugin = require('colord/plugins/names')

extend([lchPlugin, namesPlugin])

const THEMES_DATA_DIR = resolve(__dirname, 'themes-data')
const BASE_PALETTE_PATH = resolve(__dirname, '../generate-palette/base-palette.js')

// The 5 Niketa color levels and their typical luminance ranges.
// These are semantic slots, not fixed hex values.
// 0 = brightest (entities, functions, keywords)
// 1 = medium-bright (strings, constants)
// 2 = medium (variables, support)
// 3 = medium-dim (storages, metas)
// 4 = dimmest (comments, invalid)
//
// We'll use luminance percentiles to map each theme's hex colors into
// these 5 bins.

const NUM_LEVELS = 5

/**
 * Get the relative luminance of a hex color (0 = darkest, 1 = brightest).
 * Uses the WCAG relative luminance formula.
 */
function getLuminance(hex) {
  const rgb = colord(hex).toRgb()
  const [r, g, b] = [rgb.r / 255, rgb.g / 255, rgb.b / 255].map(c => {
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * Load all fetched theme data.
 */
async function loadThemeData() {
  const summaryPath = resolve(THEMES_DATA_DIR, '_summary.json')
  const summary = await readJson(summaryPath)
  return summary.themes
}

/**
 * For a given theme's scope→foreground records, bin each unique hex color
 * into 5 luminance levels (0=brightest..4=dimmost).
 *
 * Strategy: Sort all unique hex colors by luminance, split into 5 equal
 * buckets (quintiles). This adapts to each theme's specific palette.
 */
function assignColorLevels(records) {
  // Collect unique hex colors
  const hexSet = new Set(records.map(r => r.foreground))
  const hexColors = [...hexSet]

  if (hexColors.length === 0) return {}

  // Compute luminance for each
  const withLuma = hexColors.map(hex => ({
    hex,
    luma: getLuminance(hex),
  }))

  // Sort by luminance (darkest first)
  withLuma.sort((a, b) => a.luma - b.luma)

  // Split into 5 equal bins
  // Each bin gets floor(N/5) colors, remainder distributed to middle bins
  const binSize = Math.floor(withLuma.length / NUM_LEVELS)
  const remainder = withLuma.length % NUM_LEVELS
  const bins = []
  let idx = 0
  for (let level = 0; level < NUM_LEVELS; level++) {
    const extra = level < remainder ? 1 : 0
    const size = binSize + extra
    bins[level] = withLuma.slice(idx, idx + size).map(x => x.hex)
    idx += size
  }

  // Build hex→level map
  // Level 4 = darkest (idx 0), Level 0 = brightest (idx 4)
  // But we want: 0 = brightest, 4 = dimmest
  const hexToLevel = {}
  for (let level = 0; level < NUM_LEVELS; level++) {
    // level 0 = brightest = last bin
    const brightnessLevel = NUM_LEVELS - 1 - level
    for (const hex of bins[level]) {
      hexToLevel[hex] = brightnessLevel
    }
  }

  return hexToLevel
}

/**
 * Build a scope→consensus color level map.
 */
async function buildConsensusMap() {
  const themes = await loadThemeData()
  const themeNames = Object.keys(themes)
  console.log(`Analyzing ${themeNames.length} themes...`)

  // For each theme, build hex→color-level mapping
  const themeColorMaps = {}
  for (const [name, records] of Object.entries(themes)) {
    themeColorMaps[name] = assignColorLevels(records)
    console.log(`  ${name}: ${Object.keys(themeColorMaps[name]).length} unique colors → 5 levels`)
  }

  // Get the missing scopes list from base-palette.js
  // We need to access getMissingScopesList but it's not exported,
  // so we eval the file
  const fs = require('fs')
  const basePaletteCode = fs.readFileSync(BASE_PALETTE_PATH, 'utf-8')
  const getMissingScopesMatch = basePaletteCode.match(/function getMissingScopesList\(\) \{[\s\S]*?return \[([\s\S]*?)\]/)
  
  let missingScopes = []
  if (getMissingScopesMatch) {
    // Parse the array content
    const arrayContent = getMissingScopesMatch[1]
    const scopeMatches = arrayContent.match(/'([^']*)'/g)
    if (scopeMatches) {
      missingScopes = scopeMatches.map(s => s.replace(/'/g, ''))
    }
  }
  console.log(`\nMissing scopes to analyze: ${missingScopes.length}`)

  // For each missing scope, collect which color level each theme assigns
  const scopeConsensus = {}

  for (const scope of missingScopes) {
    const levels = []
    const themeScores = {}

    for (const themeName of themeNames) {
      const records = themes[themeName]
      const colorMap = themeColorMaps[themeName]

      // Find this scope in the theme's records
      const match = records.find(r => r.scope === scope)
      if (match) {
        const level = colorMap[match.foreground]
        if (level !== undefined) {
          levels.push(level)
          themeScores[themeName] = level
        }
      }
    }

    if (levels.length > 0) {
      // Compute consensus: weighted mode
      const counts = {}
      for (const l of levels) {
        counts[l] = (counts[l] || 0) + 1
      }

      let maxCount = 0
      let consensusLevel = 0
      for (const [level, count] of Object.entries(counts)) {
        if (count > maxCount) {
          maxCount = count
          consensusLevel = Number(level)
        }
      }

      const confidence = maxCount / levels.length

      scopeConsensus[scope] = {
        consensusLevel,
        confidence: Math.round(confidence * 100) / 100,
        themeCount: levels.length,
        themeLevels: themeScores,
      }
    } else {
      // No theme uses this scope
      scopeConsensus[scope] = {
        consensusLevel: null,
        confidence: 0,
        themeCount: 0,
        themeLevels: {},
      }
    }
  }

  // Also analyze the already-categorized scopes to validate our method
  console.log('\nConsensus built.')
  const withConsensus = Object.values(scopeConsensus).filter(s => s.themeCount > 0).length
  const noConsensus = Object.values(scopeConsensus).filter(s => s.themeCount === 0).length
  console.log(`  Scopes with theme data: ${withConsensus}`)
  console.log(`  Scopes with NO theme data: ${noConsensus}`)

  // Print distribution of consensus levels
  const levelDist = {}
  for (const [scope, info] of Object.entries(scopeConsensus)) {
    if (info.consensusLevel !== null) {
      levelDist[info.consensusLevel] = (levelDist[info.consensusLevel] || 0) + 1
    }
  }
  console.log('\nColor level distribution (from themes):')
  for (let l = 0; l < NUM_LEVELS; l++) {
    console.log(`  Level ${l}: ${levelDist[l] || 0} scopes`)
  }

  // Save
  const outputPath = resolve(THEMES_DATA_DIR, '_scope-color-map.json')
  await writeJson(outputPath, scopeConsensus, { spaces: 2 })
  console.log(`\nSaved to ${outputPath}`)

  return scopeConsensus
}

buildConsensusMap().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
