# Palette Refactor Plan

## Current Architecture

- `base-palette.js` — 10 category objects (`VARIABLES`, `KEYWORDS`, `PUNCTUATIONS`, `CONSTANTS`, `CSS`, `ENTITIES`, `STRINGS`, `SUPPORTS`, `METAS`, `STORAGES`), each keyed 0–4 (one per color bucket). `buildColors(mode)` concatenates them plus a chunk of `getMissingScopesList()`.
- `COLOR_0`..`COLOR_4` — each is `[...buildColors(N), ...extraScopes]`.
- `getMissingScopesList()` — ~960 scopes split *evenly* across the 5 buckets with **zero semantic reasoning**.
- `generate-palette.js` — flattens `baseData` into VS Code `tokenColors`; `.js`-suffix scopes get auto-expanded to `.ts`, `.tsx`, `.jsx`.
- `themes-colors.js` / `themes-colors-light.js` — each theme is an array of 5 hex colours that map 1:1 to `COLOR_0`..`COLOR_4`.
- `generate-theme-data.js` — resolves `COLOR_0`..`COLOR_4` symbolic names to actual hex values for each theme.

---

## Phase 1 — Download Reference Themes

1. Create `scripts/fetch-reference-themes.mjs` that downloads tokenColors from popular VS Code themes (One Dark, Monokai, Dracula, Nord, GitHub, Material, Solarized, Catppuccin, Tokyo Night, Gruvbox).
2. Store each as `reference-themes/<name>.json` (gitignored).
3. For each theme, build a map `scope → hex` (use last-wins for duplicates within a theme; across themes keep all).

---

## Phase 2 — Align with Popular Themes

1. Create `scripts/classify-missing-scopes.mjs` that reads `getMissingScopesList()` and the reference themes.
2. For each scope in the missing list, check which reference themes assign a color to it. Map the hex to the closest `COLOR_X` (0–4) via distance in the theme's palette.
3. **Classification rules**:
   - If a reference theme assigns the scope → use that `COLOR_X`.
   - Across all themes, take the **majority vote**.
   - If no theme assigns it → infer from the scope name pattern (e.g. `entity.name.function.*` → `ENTITIES`, `keyword.operator.*` → `KEYWORDS`). If the pattern is unclassifiable, **drop it**.
4. Output a CSV `scope → category → target COLOR_X` for review.

---

## Phase 3 — Remove `getMissingScopesList()`

### 3.1 — Redistribute scopes

For every scope from Phase 2 that maps to a named category, add it to the right key (0–4) in the right object:
- `entity.name.function.*` → `ENTITIES[N]`
- `keyword.operator.*` → `KEYWORDS[N]`
- `punctuation.*` → `PUNCTUATIONS[N]`
- `support.*` → `SUPPORTS[N]`
- etc.

### 3.2 — Eliminate the function

- Delete `getMissingScopesList()` and its call in `buildColors()`.
- Delete `buildColors()` itself — it was only ever needed to splice missing scopes.
- `COLOR_X` becomes a direct concat of the category objects + the extras:

```js
const COLOR_0 = [...VARIABLES[0], ...KEYWORDS[0], ...PUNCTUATIONS[0], ...CONSTANTS[0], ...CSS[0], ...ENTITIES[0], ...STRINGS[0], ...SUPPORTS[0], ...METAS[0], ...STORAGES[0], 'markup', 'source.go', 'source.js', 'text.html.derivative']
```

### 3.3 — Scopes with no category match

If Phase 2 cannot map a scope to any category, **remove it** — either it's obsolete (no current theme colors it) or truly uncategorizable.

---

## Phase 4 — Additional Improvements

### 4.1 — Deduplication guard

Add a build-time check: if the same scope string appears in more than one `COLOR_X`, throw. Currently `buildColors` can produce duplicates because a scope may exist in both a category and `getMissingScopesList()`.

### 4.2 — Broader language extension expansion

`generate-palette.js` hard-codes `.js → [.jsx, .ts, .tsx]`. Make it a configurable map so `.py`, `.rb`, `.go` etc. also expand:

```js
const EXTENSION_MAP = { '.js': ['.jsx', '.ts', '.tsx'], '.c': ['.cpp', '.h'], … }
```

### 4.3 — Verify mode

Add a `--verify` CLI flag to `generate-palette.js` that compares the generated palette against reference themes and reports divergence (e.g. "your COLOR_2 assigns `keyword.control.flow` but 7/10 reference themes assign it to COLOR_1").

### 4.4 — Test improvements

- Add a test that `COLOR_0..COLOR_4` sets have no overlap.
- Add a test that `getMissingScopesList()` is empty after the refactor (ensures completeness).
- Add a test that the generated `palette.json` matches expected scope counts.

### 4.5 — Remove `rambdax` dependency

`splitEvery`, `defaultTo` are only used for the `getMissingScopesList()` chunking. After removal, these imports go away.

---

## Execution Order

```
Phase 1 (fetch) → Phase 2 (classify) → Phase 3 (refactor base-palette.js) → Phase 4 (verify/improve)
```

Phases 1 and 2 are run-once analysis; Phase 3 is the permanent code change.
