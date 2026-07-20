/**
 * E2E Screenshot Generator
 *
 * For each theme in themes/*.json, generates a VS Code-like screenshot
 * showing highlighted sample code (JS + HTML + CSS + JSON).
 *
 * Uses Shiki (TextMate grammar highlighting, same engine as VS Code)
 * and Puppeteer (headless Chromium) for the screenshot.
 *
 * Usage: node src/e2e-screenshots/generate-screenshots.js
 */

const { createHighlighter } = require('shiki')
const puppeteer = require('puppeteer-core')
const { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } = require('fs')
const { resolve, extname } = require('node:path')

const THEMES_DIR = resolve(__dirname, '../../themes')
const SAMPLES_DIR = resolve(__dirname, 'samples')
const RAW_SCREENS_DIR = resolve(__dirname, '../../screens/raw_screens')
const CHROMIUM_PATH = '/usr/bin/chromium'

// Sample files to highlight (language → file path)
const SAMPLE_FILES = [
  { lang: 'javascript', file: resolve(SAMPLES_DIR, 'sample.js') },
  { lang: 'html',       file: resolve(SAMPLES_DIR, 'sample.html') },
  { lang: 'css',        file: resolve(SAMPLES_DIR, 'sample.css') },
  { lang: 'json',       file: resolve(SAMPLES_DIR, 'sample.json') },
]

/**
 * Find Chromium executable path
 */
function findChromium() {
  const candidates = [
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/snap/bin/chromium',
  ]
  for (const p of candidates) {
    if (existsSync(p)) return p
  }
  // Try which command
  try {
    const { execSync } = require('child_process')
    const result = execSync('which chromium chromium-browser google-chrome 2>/dev/null', {
      encoding: 'utf-8',
    })
    const match = result.trim().split('\n')[0]
    if (match) return match
  } catch {}
  return '/usr/bin/chromium'
}

/**
 * Build a combined code sample from all sample files.
 */
function buildCombinedSample() {
  const parts = []
  for (const { lang, file } of SAMPLE_FILES) {
    const code = readFileSync(file, 'utf-8').trim()
    parts.push(`// ── ${lang.toUpperCase()} ──────────────────────────\n${code}`)
  }
  return parts.join('\n\n')
}

/**
 * Generate highlighted HTML for a theme using Shiki.
 */
async function generateHighlightedHtml(highlighter, themeJson, combinedCode) {
  const html = highlighter.codeToHtml(combinedCode, {
    lang: 'javascript', // primary language for combined code
    theme: themeJson,
  })
  return html
}

/**
 * Build a full HTML page with VS Code editor styling.
 */
function buildPageHtml(highlightedHtml, themeJson) {
  const bg = themeJson.colors?.['editor.background'] || '#1E1E1E'
  const fg = themeJson.colors?.['editor.foreground'] || '#D4D4D4'

  // Extract the inner content from shiki's <pre> output for more control
  // Shiki wraps in <pre class="shiki ..."><code>...</code></pre>
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: ${bg};
    display: flex;
    align-items: flex-start;
    justify-content: center;
    min-height: 720px;
    padding: 20px;
  }
  .editor-window {
    background: ${bg};
    border-radius: 8px;
    overflow: hidden;
    width: 1240px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  }
  .title-bar {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    background: ${bg};
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }
  .title-bar .dots {
    display: flex;
    gap: 6px;
    margin-right: 16px;
  }
  .title-bar .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }
  .title-bar .dot.red { background: #ff5f56; }
  .title-bar .dot.yellow { background: #ffbd2e; }
  .title-bar .dot.green { background: #27c93f; }
  .title-bar .filename {
    color: rgba(255,255,255,0.5);
    font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
    font-size: 13px;
  }
  .editor-content {
    padding: 12px 0;
  }
  pre.shiki {
    background: transparent !important;
    padding: 0 16px !important;
    margin: 0 !important;
    font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace !important;
    font-size: 14px !important;
    line-height: 1.6 !important;
    overflow: visible !important;
  }
  pre.shiki code {
    background: transparent !important;
  }
  .line-number {
    display: inline-block;
    width: 32px;
    text-align: right;
    margin-right: 16px;
    color: rgba(255,255,255,0.15);
    user-select: none;
  }
</style>
</head>
<body>
  <div class="editor-window">
    <div class="title-bar">
      <div class="dots">
        <div class="dot red"></div>
        <div class="dot yellow"></div>
        <div class="dot green"></div>
      </div>
      <span class="filename">sample.js</span>
    </div>
    <div class="editor-content">
      ${highlightedHtml}
    </div>
  </div>
</body>
</html>`
}

/**
 * Main: generate screenshots for all themes.
 */
async function generateAllScreenshots() {
  console.log('E2E Screenshot Generator')
  console.log('=' .repeat(50))

  // Ensure output dir
  if (!existsSync(RAW_SCREENS_DIR)) {
    mkdirSync(RAW_SCREENS_DIR, { recursive: true })
  }

  // Find chromium
  const chromiumPath = findChromium()
  console.log(`Chromium: ${chromiumPath}\n`)

  // Read all theme JSONs
  const themeFiles = readdirSync(THEMES_DIR)
    .filter(f => f.endsWith('.json'))
    .sort()

  if (themeFiles.length === 0) {
    console.error('No theme JSONs found in', THEMES_DIR)
    process.exit(1)
  }

  console.log(`Found ${themeFiles.length} themes\n`)

  // Build combined sample code
  const combinedCode = buildCombinedSample()

  console.log('Shiki will be initialized per-theme\n')

  // Launch browser once
  console.log('Launching browser...')
  const browser = await puppeteer.launch({
    executablePath: chromiumPath,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  })
  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 720 })

  console.log('Browser ready\n')

  let success = 0
  let failure = 0

  for (const themeFile of themeFiles) {
    const themeName = themeFile.replace('.json', '')
    const themePath = resolve(THEMES_DIR, themeFile)
    const outputPath = resolve(RAW_SCREENS_DIR, `${themeName}.png`)

    process.stdout.write(`  ${themeName}... `)

    try {
      // Read theme JSON
      const themeJson = JSON.parse(readFileSync(themePath, 'utf-8'))

      // Create per-theme highlighter to avoid cross-theme contamination
      const themeHighlighter = await createHighlighter({
        langs: ['javascript', 'html', 'css', 'json'],
        themes: [themeJson],
      })

      // Generate highlighted HTML
      const highlightedHtml = await generateHighlightedHtml(
        themeHighlighter,
        themeJson,
        combinedCode,
      )

      // Build full page HTML
      const pageHtml = buildPageHtml(highlightedHtml, themeJson)

      // Render and screenshot
      // Use goto with data URI instead of setContent to avoid navigation timeout
      const dataUri = 'data:text/html;base64,' + Buffer.from(pageHtml).toString('base64')
      await page.goto(dataUri, { waitUntil: 'load', timeout: 15000 })
      await page.screenshot({
        path: outputPath,
        fullPage: false,
      })

      success++
      console.log('✓')
    } catch (err) {
      failure++
      console.log(`✗ ${err.message}`)
    }
  }

  // Cleanup
  await browser.close()
  console.log(`\nDone! ${success} succeeded, ${failure} failed`)
  console.log(`Screenshots saved to ${RAW_SCREENS_DIR}`)
}

generateAllScreenshots().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
