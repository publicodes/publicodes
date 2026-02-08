import eslint from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import tseslint from 'typescript-eslint'

export default tseslint.config(
	eslint.configs.recommended,
	tseslint.configs.recommendedTypeChecked,
	{
		// Allow ESLint to understand TypeScript project references
		languageOptions: {
			parserOptions: {
				projectService: true,
				// projectService: {
				// 	defaultProject: 'tsconfig.json',
				// },
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
	{
		rules: {
			'no-console': 'error',
		},
	},
	eslintConfigPrettier,
	{
		ignores: [
			'build/',
			'dist/',
			'examples/',
			'**/eslint.config.js',
			'.yarn',
			'.typedoc/',
			'**/rolldown.config.js',
			'packages/*/bin/',
			'packages/compiler/**/runtimes/javascript.js',
			'packages/compiler/benchmark/',
		],
	},
)
