# Plan: Rebuild Palette Logic — Remove `getMissingScopesList()`, Align with Popular Themes

## Current State

- **`base-palette.js`** defines 10 semantic groups (`VARIABLES`, `KEYWORDS`, `PUNCTUATIONS`, `CONSTANTS`, `CSS`, `ENTITIES`, `STRINGS`, `SUPPORTS`, `METAS`, `STORAGES`), each subdivided into 5 levels (0–4).
- **`buildColors(mode)`** assembles one color's scope list by:
  1. Taking 1/5th of the `getMissingScopesList()` array (evenly split, ~140 scopes per color)
  2. Concatenating all 10 group arrays for that mode level
- **`COLOR_0`..`COLOR_4`** each call `buildColors(i)` + a few extra hardcoded scopes.
- **`getMissingScopesList()`** returns ~700 unstructured scope names that couldn't be categorized. They are blindly split 5 ways — a pure heuristic.
- **`generate-palette.js`** reads the 5 COLOR_X arrays and writes `palette.json` (each scope → a tokenColor entry with placeholder `COLOR_X`).
- **`generate-theme-data.js`** later replaces `COLOR_X` placeholders with real hex colors per theme.

**Size**: COLOR_0=233, COLOR_1=225, COLOR_2=226, COLOR_3=218, COLOR_4=232 = **1134 total scopes**.  
~700 of those (~62%) come from the un-categorized missing list.

---

## Goals

1. **Download several popular VS Code themes** and extract their `tokenColors` as reference data.
2. **Align the generated palette with popular theme conventions** — each scope should be placed in the COLOR_X slot that matches how popular themes color it.
3. **Remove `getMissingScopesList()`** — spread its members into the proper semantic groups (or directly into COLOR_X arrays), based on:
   - Scope-name semantics (e.g., `variable.xxx` → VARIABLES group)
   - Popular-theme consensus (e.g., `entity.name.function.rust` → COLOR_0 like `entity.name.function`)
4. **If a scope has no theme consensus** → assign to a sensible default color or remove it entirely.
5. **Keep `COLOR_X` as the base** — the 5-color architecture stays, only the *distribution* of scopes changes.

---

## Step 1 — Download Popular Themes

Create a script `src/analysis/fetch-popular-themes.js` that:

1. Maintains a list of popular VS Code theme npm packages:
   - `one-dark-pro` (One Dark Pro)
   - `monokai-theme` (Monokai)
   - `dracula-theme` (Dracula Official)
   - `github-theme` (GitHub Theme)
   - `night-owl` (Night Owl)
   - `material-theme` (Material Theme)
   - `tokyo-night` (Tokyo Night)
   - `catppuccin` (Catppuccin)
   - `synthwave-vscode` (SynthWave '84)
   - `nord-visual-studio-code` (Nord)
   - `palette.json` from VS Code's built-in Dark+ theme

2. For each theme:
   - Install the package into a temp directory (or read from `node_modules` of a scratch project)
   - Find the theme JSON file(s) inside the package
   - Extract the `tokenColors` array
   - Normalize: for each entry, record `{ scope, settings.foreground }` (handling multi-scope strings)
   - Save to `src/analysis/themes-data/`

**Key detail**: Many themes use `#hex` colors directly. We need to cluster these hex values into 5 buckets (matching COLOR_0..COLOR_4 semantics) by comparing against the *current* Niketa theme colors — or by using luminance/hue clustering. See Step 2.

---

## Step 2 — Build a Scope-to-Color-Level Consensus

Create a module `src/analysis/analyze-themes.js` that:

1. **Color clustering**: For each theme, we need to map its hex colors to our 5 COLOR levels.
   - Approach A: Use the actual Niketa theme COLORS (from `themes-colors.js`) as anchor points. For each theme hex, find the nearest Niketa COLOR_X by delta-E or luminance distance.
   - Approach B: Cluster all theme colors into 5 groups by luminance (our colors are ordered: 0=brightest, 4=dimmes). This works because most themes have a "bright for keywords/entities, dim for comments" structure.

2. **Scope aggregation**: For each scope:
   - Collect the COLOR_X assignment from each theme
   - Weight: prefer themes with higher install counts
   - Compute a consensus color level (mode average)
   - Record confidence score (e.g., 0.8 if 8/10 themes agree)

3. **Output**: `src/analysis/scope-color-map.json` — a JSON object:
   ```json
   {
     "entity.name.function.rust": { "consensusColor": 0, "confidence": 0.9, "themes": ["dracula", "monokai", ...] },
     "entity.name.function.cpp":  { "consensusColor": 0, "confidence": 0.85, "themes": [...] },
     ...
   }
   ```

---

## Step 3 — Categorize Missing Scopes Into Semantic Groups

For each scope in the current `getMissingScopesList()`, run three passes:

### Pass A — Semantic prefix matching
Map scope prefixes to their likely target group using a rule engine:

| Prefix pattern → Group | Level hint |
|---|---|
| `variable.` → `VARIABLES` | inferred from suffix |
| `keyword.` → `KEYWORDS` | inferred from suffix |
| `punctuation.` → `PUNCTUATIONS` | inferred from suffix |
| `constant.` → `CONSTANTS` | inferred from suffix |
| `entity.` → `ENTITIES` | inferred from suffix |
| `string.` → `STRINGS` | inferred from suffix |
| `support.` → `SUPPORTS` | inferred from suffix |
| `storage.` → `STORAGES` | inferred from suffix |
| `meta.` → `METAS` | inferred from suffix |
| `markup.` → markdown-related (extra) | level from consensus |
| `invalid.` → `COLOR_4` (error/dim) | 4 |
| `comment.` → `COLOR_4` | 4 |
| `source.` → base text color | 0 |
| `text.` → base text color | 0 |
| `heading.` → `COLOR_1` (headings) | 1 |
| `token.` → debug/info tokens | 4 |
| `brackethighlighter.` → `PUNCTUATIONS` | inferred |
| `block.scope.` → `PUNCTUATIONS` | inferred |
| `emphasis` → `COLOR_3` (italic) | 3 |
| `strong` → bold text | 0 |

For levels (0-4), use suffix hints:
- `.BOLD` → add `BOLD` font-style, level same as base
- `.ITALIC` → add `ITALIC` font-style, level same as base
- `.UNDERLINE` → add `UNDERLINE` font-style
- No suffix → level from theme consensus or group default

### Pass B — Theme consensus override
Where the semantic assignment disagrees with the popular-theme consensus (Step 2), prefer the theme consensus and report the discrepancy.

### Pass C — Unclassified items
Scopes with no semantic match AND no theme consensus → drop them (or assign to `COLOR_0` as fallback). Log these for review.

---

## Step 4 — Rewrite `base-palette.js`

Structural changes:

1. **Remove `getMissingScopesList()` function entirely.**

2. **Spread its items into the semantic groups** (`VARIABLES`, `KEYWORDS`, `PUNCTUATIONS`, `CONSTANTS`, `CSS`, `ENTITIES`, `STRINGS`, `SUPPORTS`, `METAS`, `STORAGES`) with appropriate levels (0-4).

3. **Remove `buildColors()` function** entirely — it's no longer needed since all scopes will be pre-categorized.

4. **Simplify COLOR_X definitions** — each becomes:
   ```js
   const COLOR_0 = [
     ...CSS[0], ...CONSTANTS[0], ...ENTITIES[0], ...KEYWORDS[0],
     ...METAS[0], ...PUNCTUATIONS[0], ...STORAGES[0], ...STRINGS[0],
     ...SUPPORTS[0], ...VARIABLES[0],
     // extra scopes specific to COLOR_0
     'markup', 'source.go', 'source.js', 'text.html.derivative',
   ]
   // ... same for COLOR_1 through COLOR_4
   ```

5. **Deduplicate** — some scopes may appear both in the old categorized groups AND in the missing list. Use a `Set` or `uniq` per group.

---

## Step 5 — Update `generate-palette.js`

The `generatePalette()` function already works correctly — it reads `baseData.COLOR_0..COLOR_4` and processes each scope. No changes needed unless we want to add new features.

---

## Step 6 — Suggested Improvements (Optional)

### 6.1 — Deduplicate `.js` extension logic
Currently `pushToTokenColors()` in `generate-palette.js` automatically generates `.jsx/.ts/.tsx` copies for any scope ending in `.js`. This is hardcoded. Consider:
- Making the extension list configurable
- Adding `.jsx/.ts/.tsx` variants for more scope patterns (e.g., `.css`, `.json`)
- Moving this logic into `base-palette.js` so the base data is complete

### 6.2 — Font-style inheritance
Some scopes in the missing list have `.BOLD`, `.ITALIC` suffixes (e.g., `keyword.control.module.js.BOLD`). The current code strips the suffix before creating the tokenColor and adds `fontStyle`. This is fine but could be documented more clearly.

### 6.3 — Add a "removed scopes" log
When dropping scopes with no consensus, write them to a log file for future review. The log becomes a source for adding new group entries later.

### 6.4 — Add a "merge scopes" feature
Some themes use a single tokenColor with an array of scopes. The current code creates one entry per scope. Consider honoring multi-scope entries to reduce palette size.

### 6.5 — Add CSS variable/custom-media scopes
Modern CSS (postcss, etc.) has `custom-property`, `custom-media`, etc. scopes that are missing entirely.

---

## Execution Order

```
1.  Create src/analysis/ directory
2.  Write fetch-popular-themes.js     → downloads and extracts tokenColors
3.  Run fetch-popular-themes.sh       → populates src/analysis/themes-data/
4.  Write analyze-themes.js            → produces scope-color-map.json
5.  Run analyze-themes.js              → generates consensus data
6.  Manually review scope-color-map.json → verify/cluster quality
7.  Edit base-palette.js:
    a. Remove getMissingScopesList()
    b. Remove buildColors()
    c. Spread missing scopes into semantic groups
    d. Simplify COLOR_X definitions
8.  Run generate-palette.spec.js       → produces new palette.json
9.  Diff palette.json against old      → verify scope counts per color
10. Run full test suite (yarn test)    → ensure themes still generate
11. Manual review: open a VS Code theme file and spot-check highlighting
```

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Theme download fails (rate limits, network) | Include a fallback: parse the built-in Dark+ theme from VS Code's GitHub (no network needed) |
| Color clustering is inaccurate | Use multiple clustering methods (luminance, hue, reference-anchored) and compare results |
| ~700 scopes to review manually | Automate the semantic prefix matching (Pass A) — manual review only for conflicts |
| Existing theme users see changes | The *distribution* of scopes across colors changes, but the 5-color architecture stays. Regenerate all themes and bump minor version. |
| Some scopes are genuinely un-categorizable | Drop them with a log entry. They had no semantic match AND no theme uses them → they're dead weight. |
