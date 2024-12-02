import globals from 'globals'
import eslintBaseConfig from '../../eslint.config.js'
export default [
	...eslintBaseConfig,
	{
		rules: {
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-unsafe-argument': 'warn',
			'@typescript-eslint/no-unsafe-assignment': 'warn',
			'@typescript-eslint/no-unsafe-member-access': 'warn',
			'@typescript-eslint/no-unsafe-call': 'warn',
			'@typescript-eslint/no-unsafe-return': 'warn',
			'@typescript-eslint/no-empty-object-type': 'warn',
			'@typescript-eslint/require-await': 'warn',
		},
	},
	{
		languageOptions: {
			globals: globals.node,
		},
	},
]
