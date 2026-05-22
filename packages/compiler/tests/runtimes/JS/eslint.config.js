import baseConfig from '../../../../../eslint.config.js'
import vitest from '@vitest/eslint-plugin'

export default [
	...baseConfig,
	{
		files: ['**/*.test.ts'],
		plugins: {
			vitest,
		},
		rules: {
			...vitest.configs.recommended.rules,
			'@typescript-eslint/no-unsafe-member-access': 'warn',
		},
	},
]
