const fs = require('node:fs')
const path = require('node:path')

const root = process.cwd()
const standaloneDir = path.join(root, '.next', 'standalone')
const assetDirectories = [
  [path.join(root, '.next', 'static'), path.join(standaloneDir, '.next', 'static')],
  [path.join(root, 'public'), path.join(standaloneDir, 'public')],
]

for (const [source, destination] of assetDirectories) {
  if (!fs.existsSync(source)) continue
  fs.cpSync(source, destination, { recursive: true, force: true })
}
