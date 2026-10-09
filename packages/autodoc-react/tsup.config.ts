import { cpSync } from 'node:fs'
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
	async onSuccess() {
		cpSync('src/blocks/blocks.css', 'dist/blocks.css')
	},
})
