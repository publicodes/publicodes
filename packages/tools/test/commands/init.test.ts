import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { DEFAULT_BUILD_DIR } from '../../src'
import { basePackageJson, PackageJson } from '../../src/utils/pjson'
import { CLIExecutor, runInDir } from '../cli-utils'

const cli = new CLIExecutor()

describe('publicodes init', () => {
	it('should update existing package.json', async () => {
		await runInDir('tmp', async () => {
			execSync('npm init -y')

			const basePackageJson = JSON.parse(
				fs.readFileSync('package.json', 'utf-8'),
			) as PackageJson

			const { stdout } = await cli.execCommand('init -y')

			expect(stdout).toContain('Dependencies installed')
			expect(stdout).toContain('Files generated')
			expect(stdout).toContain('New to Publicodes?')

			const packageJson = JSON.parse(
				fs.readFileSync('package.json', 'utf-8'),
			) as PackageJson
			expect(packageJson).toMatchObject(pickStaticFields(basePackageJson))
			expect(packageJson).toMatchObject(commonPackageFields)

			expect(
				packageJson.devDependencies?.['@publicodes/tools'],
			).not.toBeUndefined()
			expect(fs.existsSync('node_modules')).toBe(true)
			expect(fs.existsSync('package-lock.json')).toBe(true)
			expect(fs.existsSync('README.md')).toBe(true)
			expect(fs.existsSync('src/salaire.publicodes')).toBe(true)
			expect(fs.existsSync('test/salaire.test.ts')).toBe(true)
		})
	})

	it('should update existing package.json but no install', async () => {
		await runInDir('tmp', async () => {
			execSync('npm init -y')

			const basePackageJson = JSON.parse(
				fs.readFileSync('package.json', 'utf-8'),
			) as PackageJson

			const { stdout } = await cli.execCommand('init -y --no-install')

			expect(stdout).toContain('Files generated')
			expect(stdout).toContain('New to Publicodes?')

			const packageJson = JSON.parse(
				fs.readFileSync('package.json', 'utf-8'),
			) as PackageJson
			expect(packageJson).toMatchObject(pickStaticFields(basePackageJson))

			expect(packageJson).toMatchObject(commonPackageFields)
			expect(
				packageJson.devDependencies?.['@publicodes/tools'],
			).not.toBeUndefined()

			expect(fs.existsSync('node_modules')).toBe(false)
			expect(fs.existsSync('package-lock.json')).toBe(false)
			expect(fs.existsSync('README.md')).toBe(true)
			expect(fs.existsSync('src/salaire.publicodes')).toBe(true)
		})
	})

	it('should create a new package.json', async () => {
		await runInDir('tmp', async (cwd) => {
			const { stdout } = await cli.execCommand('init -y')

			expect(stdout).toContain('Dependencies installed')
			expect(stdout).toContain('Files generated')
			expect(stdout).toContain('New to Publicodes?')

			const packageJson = JSON.parse(
				fs.readFileSync('package.json', 'utf-8'),
			) as PackageJson
			expect(packageJson).toMatchObject({
				...commonPackageFields,
				name: path.basename(cwd),
				version: '0.1.0',
				description: '',
				author: '',
				license: 'MIT',
			})
			expect(
				packageJson.devDependencies?.['@publicodes/tools'],
			).not.toBeUndefined()
			expect(fs.existsSync('node_modules')).toBe(true)
			expect(fs.existsSync('package-lock.json')).toBe(true)
			expect(fs.existsSync('README.md')).toBe(true)
			expect(fs.existsSync('src/salaire.publicodes')).toBe(true)
		})
	})
})

const commonPackageFields: Partial<PackageJson> = {
	type: 'module',
	main: `${DEFAULT_BUILD_DIR}/index.js`,
	types: `${DEFAULT_BUILD_DIR}/index.d.ts`,
	files: [DEFAULT_BUILD_DIR],
	peerDependencies: basePackageJson.peerDependencies,
	devDependencies: basePackageJson.devDependencies,
}

function pickStaticFields({
	license,
	name,
	version,
	author,
	description,
}: PackageJson) {
	return {
		license,
		name,
		version,
		author,
		description,
	}
}
