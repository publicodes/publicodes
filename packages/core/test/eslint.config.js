import globals from 'globals'
import baseConfig from '../eslint.config.js'
import vitest from '@vitest/eslint-plugin'

export default [
	...baseConfig,
	{
		plugins: {
			vitest,
		},
		rules: vitest.configs.recommended.rules,
	},
]
