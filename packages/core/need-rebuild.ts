import { existsSync, readFileSync, writeFileSync } from 'fs'
import { getPackageDeps } from '@rushstack/package-deps-hash'

const path = '.deps.json'

const deps = Object.fromEntries(getPackageDeps('./source'))
const depsEntries = Object.entries(deps)

const existingDeps =
	existsSync(path) ? JSON.parse(readFileSync(path, { encoding: 'utf8' })) : {}
const existingDepsEntries = Object.entries(existingDeps)

const fileChanged =
	depsEntries.length !== existingDepsEntries.length ||
	depsEntries.findIndex(
		([a, b], i) =>
			existingDepsEntries[i][0] !== a || existingDepsEntries[i][1] !== b,
	)

if (fileChanged === true || fileChanged > -1) {
	writeFileSync(path, JSON.stringify(deps, null, 2))

	console.log('File changed detected, rebuild needed...')
	if (typeof fileChanged === 'number') {
		console.log('=>', depsEntries[fileChanged][0])
	}

	process.exit(1)
}
console.log('No file changed, rebuild is not needed!')
