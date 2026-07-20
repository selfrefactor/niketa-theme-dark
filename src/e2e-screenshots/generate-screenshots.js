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
 * Build a full HTML page with VS Code editor + sidebar styling.
 *
 * Layout:
 * ┌─ Title bar ─────────────────────────┐
 * │ ● ● ●  sample.js                   │
 * ├─── Sidebar ───┬── Editor ──────────┤
 * │ EXPLORER      │  highlighted code  │
 * │ ├─ src/       │                    │
 * │ │ ├─ sample   │                    │
 * │ │ ├─ utils    │                    │
 * │ │ └─ styles   │                    │
 * │ ├─ tests/     │                    │
 * │ └─ package    │                    │
 * ├─── Status bar ─────────────────────┤
 * │ main  │ JS │ UTF-8 │ Sp: 2        │
 * └────────────────────────────────────┘
 */
function buildPageHtml(highlightedHtml, themeJson) {
  const editorBg = themeJson.colors?.['editor.background'] || '#1E1E1E'
  const editorFg = themeJson.colors?.['editor.foreground'] || '#D4D4D4'
  const sidebarBg = themeJson.colors?.['sideBar.background'] || editorBg
  const sidebarFg = themeJson.colors?.['sideBar.foreground'] || '#CCCCCC'
  const sidebarTitleBg = themeJson.colors?.['sideBarTitle.background'] || sidebarBg
  const sidebarTitleFg = themeJson.colors?.['sideBarTitle.foreground'] || '#888888'
  const activityBarBg = themeJson.colors?.['activityBar.background'] || sidebarBg
  const statusBarBg = themeJson.colors?.['statusBar.background'] || '#007ACC'
  const statusBarFg = themeJson.colors?.['statusBar.foreground'] || '#FFFFFF'
  const lineHighlight = themeJson.colors?.['editor.lineHighlightBackground'] || 'rgba(255,255,255,0.05)'

  // File tree structure for the sidebar
  const fileTree = `
    <div class="section-header">EXPLORER</div>
    <div class="tree">
      <div class="tree-item dir open">
        <span class="arrow">▾</span>
        <span class="icon folder-open">📂</span>
        <span>niketa-theme-dark</span>
      </div>
      <div class="tree-children">
        <div class="tree-item dir open">
          <span class="arrow">▾</span>
          <span class="icon folder-open">📂</span>
          <span>src</span>
        </div>
        <div class="tree-children">
          <div class="tree-item dir">
            <span class="arrow">▸</span>
            <span class="icon folder">📁</span>
            <span>assets</span>
          </div>
          <div class="tree-item dir">
            <span class="arrow">▸</span>
            <span class="icon folder">📁</span>
            <span>generate-palette</span>
          </div>
          <div class="tree-item file active">
            <span class="icon file">📄</span>
            <span>sample.js</span>
          </div>
          <div class="tree-item file">
            <span class="icon file">📄</span>
            <span>utils.js</span>
          </div>
          <div class="tree-item file">
            <span class="icon file">📄</span>
            <span>styles.css</span>
          </div>
        </div>
        <div class="tree-item dir">
          <span class="arrow">▸</span>
          <span class="icon folder">📁</span>
          <span>themes</span>
        </div>
        <div class="tree-item file">
          <span class="icon file">📄</span>
          <span>package.json</span>
        </div>
      </div>
    </div>`

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: #0d1117;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  .editor-window {
    border-radius: 10px;
    overflow: hidden;
    width: 1240px;
    box-shadow: 0 16px 48px rgba(0,0,0,0.4);
  }

  /* ── Title bar ── */
  .title-bar {
    display: flex;
    align-items: center;
    padding: 10px 16px;
    background: ${editorBg};
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  .title-bar .dots {
    display: flex;
    gap: 8px;
    margin-right: 20px;
  }
  .title-bar .dot {
    width: 13px;
    height: 13px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .title-bar .dot.red { background: #ff5f56; }
  .title-bar .dot.yellow { background: #ffbd2e; }
  .title-bar .dot.green { background: #27c93f; }
  .title-bar .filename {
    color: rgba(255,255,255,0.4);
    font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace;
    font-size: 13px;
  }

  /* ── Body: sidebar + editor ── */
  .window-body {
    display: flex;
    flex-direction: row;
    height: 560px;
  }

  /* ── Sidebar ── */
  .sidebar {
    width: 260px;
    background: ${sidebarBg};
    color: ${sidebarFg};
    border-right: 1px solid rgba(255,255,255,0.06);
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
  }
  .sidebar .section-header {
    padding: 10px 16px 6px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.5px;
    color: ${sidebarTitleFg};
    text-transform: uppercase;
  }
  .sidebar .tree {
    padding: 0 0 0 8px;
    flex: 1;
    overflow: auto;
  }
  .tree-item {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    font-size: 13px;
    line-height: 24px;
    cursor: default;
    color: ${sidebarFg};
    white-space: nowrap;
  }
  .tree-item .arrow {
    width: 16px;
    text-align: center;
    font-size: 10px;
    opacity: 0.6;
    flex-shrink: 0;
  }
  .tree-item .icon {
    width: 16px;
    text-align: center;
    font-size: 13px;
    flex-shrink: 0;
  }
  .tree-item.active {
    background: rgba(255,255,255,0.08);
    color: #fff;
  }
  .tree-item.active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: #0078d4;
  }
  .tree-children {
    padding-left: 20px;
  }
  .dir .arrow {
    visibility: visible;
  }

  /* ── Editor ── */
  .editor-pane {
    flex: 1;
    background: ${editorBg};
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .editor-tabs {
    display: flex;
    background: rgba(0,0,0,0.1);
    border-bottom: 1px solid rgba(255,255,255,0.06);
    padding: 0;
  }
  .editor-tab {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    font-size: 12px;
    color: rgba(255,255,255,0.4);
    border-right: 1px solid rgba(255,255,255,0.06);
    cursor: default;
  }
  .editor-tab.active {
    background: ${editorBg};
    color: ${editorFg};
    border-bottom: 1px solid ${editorBg};
    margin-bottom: -1px;
  }
  .editor-tab .tab-icon {
    font-size: 11px;
  }
  .editor-tab .tab-close {
    opacity: 0.4;
    font-size: 14px;
    margin-left: 4px;
  }
  .editor-content {
    flex: 1;
    overflow: auto;
    padding: 8px 0;
  }
  .editor-content pre.shiki {
    background: transparent !important;
    padding: 0 16px !important;
    margin: 0 !important;
    font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace !important;
    font-size: 13px !important;
    line-height: 1.7 !important;
  }
  .editor-content pre.shiki code {
    background: transparent !important;
  }

  /* ── Status bar ── */
  .status-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 2px 12px;
    background: ${statusBarBg};
    color: ${statusBarFg};
    font-size: 12px;
    height: 24px;
  }
  .status-bar .status-left,
  .status-bar .status-right {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .status-bar .status-item {
    opacity: 0.8;
  }
</style>
</head>
<body>
  <div class="editor-window">
    <!-- Title bar -->
    <div class="title-bar">
      <div class="dots">
        <div class="dot red"></div>
        <div class="dot yellow"></div>
        <div class="dot green"></div>
      </div>
      <span class="filename">sample.js — niketa-theme-dark</span>
    </div>

    <!-- Body: sidebar + editor -->
    <div class="window-body">
      <!-- Sidebar -->
      <div class="sidebar">
        ${fileTree}
      </div>

      <!-- Editor -->
      <div class="editor-pane">
        <div class="editor-tabs">
          <div class="editor-tab active">
            <span class="tab-icon">📄</span>
            sample.js
            <span class="tab-close">×</span>
          </div>
          <div class="editor-tab">
            <span class="tab-icon">📄</span>
            utils.js
            <span class="tab-close">×</span>
          </div>
          <div class="editor-tab">
            <span class="tab-icon">📄</span>
            styles.css
            <span class="tab-close">×</span>
          </div>
        </div>
        <div class="editor-content">
          ${highlightedHtml}
        </div>
      </div>
    </div>

    <!-- Status bar -->
    <div class="status-bar">
      <div class="status-left">
        <span class="status-item">main</span>
        <span class="status-item">◎</span>
      </div>
      <div class="status-right">
        <span class="status-item">JavaScript</span>
        <span class="status-item">UTF-8</span>
        <span class="status-item">Spaces: 2</span>
        <span class="status-item">Ln 1, Col 1</span>
      </div>
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
