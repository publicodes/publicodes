import mochaPlugin from 'eslint-plugin-mocha'
import globals from 'globals'
import baseConfig from '../eslint.config.js'

export default [
	...baseConfig,
	{
		plugins: {
			vitest,
		},
		rules: vitest.configs.recommended.rules,
	},
]
