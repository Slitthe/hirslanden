import { copyFile, mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'

const src = 'src/styles/tokens.css'
const dest = 'dist/styles/tokens.css'

await mkdir(dirname(dest), { recursive: true })
await copyFile(src, dest)
console.log(`Copied ${src} -> ${dest}`)
