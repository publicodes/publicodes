import { defineConfig } from 'tsup'

export default defineConfig({
	entry: ['source/index.ts'],
	format: ['cjs', 'esm'],
	sourcemap: true,
	clean: true,
	dts: true,
})
