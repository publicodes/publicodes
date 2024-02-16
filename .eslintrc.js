module.exports = {
	env: {
		browser: true,
		es2021: true,
		node: true,
	},
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:react/recommended',
		'prettier',
	],
	overrides: [
		{
			env: {
				node: true,
			},
			files: ['.eslintrc.{js,cjs}'],
			parserOptions: {
				sourceType: 'script',
			},
		},
	],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
	},
	plugins: ['@typescript-eslint', 'react'],
	rules: {
		'react/react-in-jsx-scope': 'off',
		'@typescript-eslint/no-explicit-any': 'warn',
		'no-console': 'error',
		// The following rules makes sure that we use named import for styled-components (otherwise it will create a bug with ESM import)
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
}
