import vitest from '@vitest/eslint-plugin'
import baseConfig from '../../eslint.config.js'
export default [
	...baseConfig,
	{
		files: ['src/**/*.test.ts'], // or any other pattern
		plugins: {
			vitest,
		},
		rules: vitest.configs.recommended.rules,
	},
]
