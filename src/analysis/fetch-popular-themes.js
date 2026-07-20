/**
 * Step 1: Fetch popular VS Code themes and extract their tokenColors.
 *
 * Downloads theme JSON from GitHub raw URLs.
 * Resolves "include" references (e.g., Dark+ includes dark_vs.json).
 * Extracts tokenColors, normalizes to {scope, foreground} records.
 * Saves each theme to src/analysis/themes-data/{name}.json
 */

const { writeJson, ensureDir } = require('fs-extra')
const { resolve, dirname } = require('node:path')
const { uniqBy } = require('rambdax')

const THEMES_DATA_DIR = resolve(__dirname, 'themes-data')

const THEME_SOURCES = [
  {
    name: 'dark-plus',
    label: 'Dark+ (built-in)',
    url: 'https://raw.githubusercontent.com/microsoft/vscode/main/extensions/theme-defaults/themes/dark_plus.json',
  },
  {
    name: 'one-dark-pro',
    label: 'One Dark Pro',
    url: 'https://raw.githubusercontent.com/Binaryify/OneDark-Pro/master/themes/OneDark-Pro.json',
  },
  {
    name: 'monokai',
    label: 'Monokai (built-in)',
    url: 'https://raw.githubusercontent.com/microsoft/vscode/master/extensions/theme-monokai/themes/monokai-color-theme.json',
  },
  {
    name: 'night-owl',
    label: 'Night Owl',
    url: 'https://raw.githubusercontent.com/sdras/night-owl-vscode-theme/main/themes/Night%20Owl-color-theme.json',
  },
  {
    name: 'tokyo-night',
    label: 'Tokyo Night',
    url: 'https://raw.githubusercontent.com/tokyo-night/tokyo-night-vscode-theme/master/themes/tokyo-night-color-theme.json',
  },
  {
    name: 'nord',
    label: 'Nord',
    url: 'https://raw.githubusercontent.com/nordtheme/visual-studio-code/develop/themes/nord-color-theme.json',
  },
  {
    name: 'synthwave',
    label: 'SynthWave 84',
    url: 'https://raw.githubusercontent.com/robb0wen/synthwave-vscode/master/themes/synthwave-color-theme.json',
  },
]

/**
 * Clean a JSON string that may have comments, trailing commas, control chars.
 *
 * SAFELY handles `//` inside JSON strings (e.g., "vscode://schemas/...") by
 * temporarily replacing strings with placeholders before stripping comments.
 */
function cleanJson(text) {
  // Step 1: Protect string contents by replacing them with placeholders
  const strings = []
  let protected = ''
  let i = 0
  while (i < text.length) {
    if (text[i] === '"') {
      const start = i
      i++ // skip opening quote
      while (i < text.length) {
        if (text[i] === '\\') {
          i += 2 // skip escaped char
          continue
        }
        if (text[i] === '"') break
        i++
      }
      i++ // skip closing quote
      strings.push(text.slice(start, i))
      protected += `__STR${strings.length - 1}__`
    } else {
      protected += text[i]
      i++
    }
  }

  // Step 2: Strip comments (now safe — all strings are placeholders)
  let cleaned = protected
    .replace(/\/\/.*$/gm, '')        // single-line comments
    .replace(/\/\*[\s\S]*?\*\//g, '')  // multi-line comments
    .replace(/,\s*([}\]])/g, '$1')  // trailing commas
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '')  // control chars
    .replace(/^\uFEFF/, '')           // BOM

  // Step 3: Restore strings
  for (let k = 0; k < strings.length; k++) {
    cleaned = cleaned.replace(`__STR${k}__`, strings[k])
  }

  return cleaned
}

/**
 * Parse a JSON string that may have comments/trailing commas.
 */
function parseThemeJson(text) {
  return JSON.parse(cleanJson(text))
}

/**
 * Fetch a URL with retries, return text.
 */
async function fetchText(url) {
  let retries = 2
  while (retries >= 0) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(15000),
      })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      return await response.text()
    } catch (err) {
      if (retries === 0) throw err
      retries--
      await new Promise(r => setTimeout(r, 2000))
    }
  }
  throw new Error('Max retries exceeded')
}

/**
 * Resolve a relative path against a base URL.
 */
function resolveUrl(baseUrl, relativePath) {
  const base = baseUrl.substring(0, baseUrl.lastIndexOf('/'))
  return `${base}/${relativePath.replace(/^\.\//, '')}`
}

/**
 * Normalize a single token color entry into an array of {scope, foreground} records.
 */
function normalizeTokenColor(entry) {
  const scopeRaw = entry.scope || entry.textMateScope || []
  const scopes = Array.isArray(scopeRaw) ? scopeRaw : [scopeRaw]
  const foreground = entry.settings?.foreground

  if (!foreground || !foreground.startsWith('#')) {
    return []
  }

  return scopes.map(s => ({
    scope: String(s).trim(),
    foreground,
  }))
}

/**
 * Normalize the full tokenColors array from a theme.
 */
function normalizeTokenColors(tokenColors) {
  if (!Array.isArray(tokenColors)) return []
  const records = tokenColors.flatMap(normalizeTokenColor)
  return uniqBy(r => r.scope, records)
}

/**
 * Fetch a theme JSON and extract normalized tokenColors.
 * Resolves "include" references recursively.
 */
async function fetchTheme(source) {
  process.stdout.write(`  ${source.label}... `)
  try {
    const text = await fetchText(source.url)
    let theme
    try {
      theme = parseThemeJson(text)
    } catch (err) {
      // If still fails, log but continue with empty
      console.log(`✗ JSON parse error: ${err.message}`)
      return []
    }

    // Resolve "include" references (e.g., Dark+ includes dark_vs.json)
    if (theme.include) {
      try {
        const includeUrl = resolveUrl(source.url, theme.include)
        const includeText = await fetchText(includeUrl)
        const includeTheme = parseThemeJson(includeText)
        const includeTokenColors = includeTheme.tokenColors || []
        // Merge: include's tokenColors come first, theme's override
        theme.tokenColors = [...includeTokenColors, ...(theme.tokenColors || [])]
      } catch (err) {
        process.stdout.write(`(include ${theme.include} failed: ${err.message}) `)
      }
    }

    const records = normalizeTokenColors(theme.tokenColors || [])
    console.log(`${records.length} records`)
    return records
  } catch (err) {
    console.log(`✗ ${err.message}`)
    return []
  }
}

/**
 * Main: fetch all themes and save to disk.
 */
async function main() {
  console.log('Fetching popular VS Code themes...\n')
  await ensureDir(THEMES_DATA_DIR)

  const allScopesByTheme = {}

  for (const source of THEME_SOURCES) {
    const records = await fetchTheme(source)
    allScopesByTheme[source.name] = records

    const filePath = resolve(THEMES_DATA_DIR, `${source.name}.json`)
    await writeJson(filePath, records, { spaces: 2 })
  }

  // Save merged summary
  const summaryPath = resolve(THEMES_DATA_DIR, '_summary.json')
  await writeJson(summaryPath, { themes: allScopesByTheme }, { spaces: 2 })

  // Build a per-scope map of which themes assign which foreground colors
  const scopeMap = {}
  for (const [themeName, records] of Object.entries(allScopesByTheme)) {
    for (const { scope, foreground } of records) {
      if (!scopeMap[scope]) scopeMap[scope] = {}
      scopeMap[scope][themeName] = foreground
    }
  }

  const scopeMapPath = resolve(THEMES_DATA_DIR, '_scope-foreground-map.json')
  await writeJson(scopeMapPath, scopeMap, { spaces: 2 })

  console.log('\nDone! Summary:')
  for (const [name, records] of Object.entries(allScopesByTheme)) {
    console.log(`  ${name}: ${records.length} scope records`)
  }
  console.log(`\nTotal unique scopes across all themes: ${Object.keys(scopeMap).length}`)
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
