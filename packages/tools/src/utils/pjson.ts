import fs from 'fs'
import { DEFAULT_BUILD_DIR } from '../commons'
import { execSync } from 'child_process'

export type PackageJson = {
	name: string
	version: string
	description: string
	main?: string
	type?: string
	types?: string
	files?: string[]
	// TODO: infer from the git config
	repository?: {
		url: string
		type: string
	}
	author: string
	license: string
	scripts?: {
		[key: string]: string
	}
	peerDependencies?: {
		[key: string]: string
	}
	dependencies?: {
		[key: string]: string
	}
	devDependencies?: {
		[key: string]: string
	}
	publishConfig?: {
		access: string
	}
	publicodes?: {
		files?: string[]
		output?: string
		situations?: string[]
	}
}

export const basePackageJson: PackageJson = {
	name: '',
	version: '0.1.0',
	description: '',
	author: '',
	type: 'module',
	main: `${DEFAULT_BUILD_DIR}/index.js`,
	types: `${DEFAULT_BUILD_DIR}/index.d.ts`,
	license: 'MIT',
	files: [DEFAULT_BUILD_DIR],
	peerDependencies: {
		// TODO: how to get the latest version of publicodes?
		publicodes: '^' + getLastVersion('publicodes'),
	},
	devDependencies: {
		'@publicodes/tools': '^' + getLastVersion('@publicodes/tools'),
	},
	scripts: {
		compile: 'publicodes compile',
		dev: 'publicodes dev',
	},
}

export function readPackageJson(): PackageJson | undefined {
	try {
		return JSON.parse(fs.readFileSync('package.json', 'utf-8')) as PackageJson
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
	} catch (e) {
		return undefined
	}
}

function getLastVersion(pkg: string): string {
	try {
		return execSync(`npm show ${pkg} version`, {
			encoding: 'utf-8',
		}).trim()
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
	} catch (e) {
		return 'latest'
	}
}
