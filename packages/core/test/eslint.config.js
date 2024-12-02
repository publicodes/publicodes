import mochaPlugin from 'eslint-plugin-mocha'
import globals from 'globals'
import baseConfig from '../eslint.config.js'

export default [
	...baseConfig,
	mochaPlugin.configs.flat.recommended, // or `mochaPlugin.configs.flat.all` to enable all
	{
		files: ['**/*.test.{js,ts}'],
		languageOptions: {
			globals: globals.node,
		},

		rules: {
			'@typescript-eslint/no-unused-vars': 'warn',
			'mocha/max-top-level-suites': 'warn',
			'no-irregular-whitespace': 'warn',
			'mocha/no-setup-in-describe': 'warn',
			'@typescript-eslint/no-unused-expressions': 'warn',
			'no-console': 'warn',
		},
	},
]
