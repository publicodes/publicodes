/** @type {import('ts-jest').JestConfigWithTsJest} */

import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['./test/utils.test.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest', // The important part right here
  },
}

export default config
