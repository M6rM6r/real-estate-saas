import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const SCAN_EXT = new Set(['.ts', '.tsx', '.js', '.jsx'])
const IGNORE_DIRS = new Set(['.git', '.next', 'node_modules', 'coverage', 'out', 'build'])

const violations = []

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    if (IGNORE_DIRS.has(entry.name)) continue
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(fullPath)
      continue
    }
    if (!SCAN_EXT.has(path.extname(entry.name))) continue

    const content = fs.readFileSync(fullPath, 'utf8')
    const lines = content.split(/\r?\n/)
    lines.forEach((line, idx) => {
      if (/TODO|FIXME|XXX/i.test(line) && !/[@#][a-z0-9_-]+/i.test(line)) {
        violations.push(`${path.relative(ROOT, fullPath)}:${idx + 1} -> ${line.trim()}`)
      }
    })
  }
}

walk(ROOT)

if (violations.length > 0) {
  console.error('Done criteria failed. TODO/FIXME/XXX must include an owner tag like @owner:')
  for (const violation of violations) {
    console.error(`- ${violation}`)
  }
  process.exit(1)
}

console.log('Done criteria passed.')
