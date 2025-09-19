import { defineConfig } from 'rolldown'

export default defineConfig({
	input: 'src/bin/index.ts',
	platform: 'node',
	output: {
		file: 'bin/publicodes.js',
	},
})
