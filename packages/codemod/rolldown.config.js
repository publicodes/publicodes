import { defineConfig } from 'rolldown'

export default defineConfig([
	{
		input: 'src/codemod-v2.ts',
		platform: 'node',
		output: {
			file: 'bin/codemod-v2.js',
		},
	},
])
