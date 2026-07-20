# E2E Screenshot Test — COMPLETED

## What was created

### Screenshot pipeline

| Step | Script | What it does |
|------|--------|-------------|
| 1️⃣ Generate | `src/e2e-screenshots/generate-screenshots.js` | For each of the 9 themes, uses Shiki to highlight sample JS/HTML/CSS/JSON code, renders it in a VS Code-like HTML page, and screenshots with Puppeteer + Chromium |
| 2️⃣ Populate | `src/e2e-screenshots/populate-screens.js` | Copies raw screens to `screens/` with dot_case names matching package.json themes |
| 3️⃣ Test | `src/e2e-screenshots/generate-screenshots.spec.js` | Jest spec verifying PNGs exist and are >10KB |

### Sample code files (`src/e2e-screenshots/samples/`)

- `sample.js` — modern JS: imports, classes, async/await, template literals, console
- `sample.html` — HTML5: semantic tags, attributes, embedded script
- `sample.css` — CSS: custom properties, selectors, animations, media queries
- `sample.json` — structured JSON with strings, arrays, objects

### NPM scripts

```json
"screenshots": "node src/e2e-screenshots/generate-screenshots.js",
"screenshots:full": "yarn screenshots && node src/e2e-screenshots/populate-screens.js"
```

### Dependencies added
- `shiki@^4.3.1` — TextMate syntax highlighting (same engine as VS Code)
- `puppeteer-core@^25.3.0` — headless Chrome screenshot (uses system `/usr/bin/chromium`)

## How it works

1. `generate-screenshots.js` creates a per-theme Shiki highlighter, loads the theme JSON, highlights combined sample code
2. The highlighted HTML is embedded in a styled page mimicking VS Code's editor window (title bar with dots, filename, editor background)
3. Puppeteer opens the page via data URI and takes a 1280×720 screenshot
4. PNGs are saved to `screens/raw_screens/{ThemeName}.png`
5. `populate-screens.js` reads the sorted raw screens and copies to `screens/{theme.name}.png`

## Result

- 9/9 themes generated successfully
- All PNGs are valid (verified header + size > 10KB)
- File sizes: ~92KB each
- Also fixed README: replaced CurbYourEnthusiasm (no longer exists) with HomeMovies

## Usage

```bash
# Full pipeline: generate + populate
yarn screenshots:full

# Just generate
yarn screenshots

# Just copy raw→screens
node src/e2e-screenshots/populate-screens.js
```

## Run this after theme changes

Whenever you change theme colors (e.g., after running `yarn out:dark`), run:
```bash
yarn out:dark && yarn screenshots:full
```
This keeps README screenshots in sync with actual theme output.
