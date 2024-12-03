import vitest from '@vitest/eslint-plugin'
export default [
	{
		files: ['./**/*.test.ts'], // or any other pattern
		plugins: {
			vitest,
		},
		rules: {
			...vitest.configs.recommended.rules, // you can also use vitest.configs.all.rules to enable all rules
			'vitest/max-nested-describe': ['error', { max: 3 }], // you can also modify rules' behavior using option like this
		},
	},
]
