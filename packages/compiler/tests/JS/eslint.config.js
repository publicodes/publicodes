import baseConfig from '../../../../eslint.config.js'
import vitest from '@vitest/eslint-plugin'
import tseslint from 'typescript-eslint'

export default tseslint.config(...baseConfig, {
	files: ['**/*.test.ts'],
	plugins: {
		vitest,
	},
	rules: {
		...vitest.configs.recommended.rules,
		'@typescript-eslint/no-unsafe-member-access': 'warn',
	},
})
