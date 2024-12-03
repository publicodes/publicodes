import reactPlugin from 'eslint-plugin-react'
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
			'@typescript-eslint/no-redundant-type-constituents': 'warn',
			'@typescript-eslint/no-base-to-string': 'warn',
			'@typescript-eslint/no-explicit-any': 'warn',
			'no-restricted-imports': [
				'error',
				{
					paths: [
						{
							name: 'styled-components',
							importNames: ['default'],
							message:
								'Please use named import : `import { styled } from "styled-component"` instead.',
						},
					],
				},
			],
		},
	},
	{
		files: ['**/*.{jsx,tsx}'],
		...reactPlugin.configs.flat.recommended,
	},
	{
		files: ['**/*.{jsx,tsx}'],
		...reactPlugin.configs.flat['jsx-runtime'],
	},
	{
		files: ['**/*.{jsx,tsx}'],
		languageOptions: {
			globals: {
				...globals.browser,
			},
		},
	},
]
