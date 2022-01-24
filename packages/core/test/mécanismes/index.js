import fs from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const _dirname = dirname(fileURLToPath(import.meta.url))
let mecanismsTestFiles = fs
	.readdirSync(_dirname)
	.filter((name) => name.endsWith('.yaml'))

export default mecanismsTestFiles.map((name) => [
	name.replace(/\.\/|\.yaml/g, ''),
	fs.readFileSync(join(_dirname, name), 'utf8'),
])
