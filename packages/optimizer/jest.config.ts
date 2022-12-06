/** @type {import('ts-jest').JestConfigWithTsJest} */

import type { Config } from 'jest'

const config: Config = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	testPathIgnorePatterns: ['./test/utils.test.ts'],
}

export default config
