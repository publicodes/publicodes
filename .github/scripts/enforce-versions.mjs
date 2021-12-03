#!/usr/bin/env zx

// Ensure that all packages in the workspace have the same version.
const packagesVersions = (await fs.readdir('./packages')).map((name) => {
	const packageJson = fs.readJsonSync(`./packages/${name}/package.json`)
	return { name, version: packageJson.version }
})

if (new Set(packagesVersions.map(({ version }) => version)).size > 1) {
	console.table(packagesVersions)
	throw Error('Some packages have different versions')
}

// Ensure that current version is referenced in the Changelog.md
const packageVersion = packagesVersions[0].version
const changelog = await fs.readFile('./CHANGELOG.md')

if (!changelog.includes(`## ${packageVersion}\n`)) {
	throw Error(
		`Current version ${packageVersion} is not referenced in the CHANGELOG.md`
	)
}
