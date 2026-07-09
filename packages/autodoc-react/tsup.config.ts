import { defineConfig } from 'tsup'

export default defineConfig({
	entry: ['src/index.ts'],
	format: ['cjs', 'esm'],
	sourcemap: true,
	clean: true,
	dts: true,
	esbuildOptions(options) {
		options.external = options.external ?? []
		;(options.external as string[]).push('*.css')
	},
})
