import { cp } from 'node:fs/promises'

// Copy the whole styles dir verbatim (tokens.css, fonts.css, fonts/*.woff2) so the
// shipped tokens.css @import './fonts.css' and its url('./fonts/...') resolve in dist.
const src = 'src/styles'
const dest = 'dist/styles'

await cp(src, dest, { recursive: true })
console.log(`Copied ${src} -> ${dest}`)
