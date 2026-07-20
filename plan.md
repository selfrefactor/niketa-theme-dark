# Plan: Rebuild Palette Logic — COMPLETED

## What was done

### Step 1 ✅ — Fetch popular themes
**File**: `src/analysis/fetch-popular-themes.js`

Fetched 7 popular VS Code themes:
- Dark+ (built-in): 163 scopes
- One Dark Pro: 299 scopes
- Monokai: 51 scopes
- Night Owl: 323 scopes
- Tokyo Night: 320 scopes
- Nord: 190 scopes
- SynthWave 84: 128 scopes

Total unique scopes across all themes: 1100

Stored in `src/analysis/themes-data/` per-theme JSONs + `_summary.json` + `_scope-foreground-map.json`.

### Step 2 ✅ — Build consensus map
**File**: `src/analysis/analyze-themes.js`

For each scope in `getMissingScopesList()`, determined which COLOR_X level each theme assigns by clustering hex colors into 5 luminance quintiles per theme. Output: `_scope-color-map.json`.

Results:
- 342 scopes with theme data (342/962 = 35%)
- 620 scopes with NO theme data
- Consensus distribution: L0=97, L1=67, L2=88, L3=79, L4=11

### Step 3 ✅ — Categorize missing scopes
**File**: `src/analysis/categorize-scopes.js`

Three-pass categorization:
- **Pass A**: Semantic prefix matching (200+ rules mapping prefixes → groups + levels)
- **Pass B**: Theme consensus override (logged conflicts, ~100 conflicts resolved by adjusting rules)
- **Pass C**: Drop unclassified (only 2 dropped: `markdown.heading`, `meta.metadata.simple.clojure`)

Results:
- 960 scopes assigned to semantic groups
- 2 scopes dropped (no rule, no consensus)

### Step 4 ✅ — Rewrite `base-palette.js`
**File**: `src/analysis/generate-base-palette.js` (generator)
**Output**: `src/generate-palette/base-palette.js`

Changes:
- **Removed** `getMissingScopesList()` function (~700 scopes, 962 lines)
- **Kept** `buildColors()` as a simple group concatenator (no more split/chunk logic)
- **Removed** `splitEvery` dependency
- Spread the categorized scopes into 10 semantic groups with proper levels
- Simplified COLOR_X definitions

### Step 5 ✅ — Update `generate-palette.js`
No changes needed — it reads COLOR_X from baseData and processes correctly.

### Step 6 ✅ — Test & verify
- `generate-palette.spec.js` passes
- palette.json generates with 1380 tokenColors (same as before)
- 0 new duplicates introduced (all 19 pre-existing duplicates preserved)
- 2 old cross-color duplicates resolved (`support.class.component`, `entity.name.tag.css`)
- Font styles (BOLD, ITALIC) preserved

## Comparison

| Metric | Before | After |
|--------|--------|-------|
| Total scopes | 1134 | 1132 |
| Un-categorized scopes | ~700 (61%) | 0 (0%) |
| `getMissingScopesList()` | present | **REMOVED** |
| `buildColors()` complexity | splits 700 scopes | simple concat |
| Theme alignment | none | 7 themes analyzed |
| Dropped scopes | 0 | 2 (no semantic match, no theme usage) |
| Cross-color duplicates | 5 | 3 (all pre-existing) |
| Duplicate scopes | 19 | 19 (all pre-existing, unchanged) |

## Files created/modified

### New files:
- `src/analysis/fetch-popular-themes.js` — theme fetcher
- `src/analysis/analyze-themes.js` — consensus analyzer
- `src/analysis/categorize-scopes.js` — scope categorization
- `src/analysis/generate-base-palette.js` — base-palette generator
- `src/analysis/themes-data/` — 7 theme JSONs + analysis outputs

### Modified files:
- `src/generate-palette/base-palette.js` — **main output**: removed `getMissingScopesList()`, spread members into groups
- `src/assets/palette.json` — regenerated

### Suggested future improvements (not blocking):
1. Deduplicate the `generate-palette.js` extension expansion (`.js`→`.jsx/.ts/.tsx`) to avoid the 19 duplicates
2. Resolve the 3 cross-color scope conflicts
3. Add more theme sources (Dracula, Catppuccin, GitHub Dark) once URLs stabilize
4. Move the analysis pipeline to a scheduled task to stay aligned with theme updates
