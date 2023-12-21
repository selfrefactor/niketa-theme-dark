let FALLBACK = 'src/createMultipleTheme.spec.js'
const filePath = process.argv[2] ?? FALLBACK
const { lintFn } = await import('./lint-fn.js')

void async function lint() {
  lintFn(filePath)
}