import { cpSync, mkdirSync } from 'node:fs'
import { defineConfig } from 'tsup'

export default defineConfig({
	entry: ['src/index.ts', 'src/ast/index.ts', 'src/examples/index.ts'],
	format: ['cjs', 'esm'],
	sourcemap: true,
	clean: true,
	dts: true,
	async onSuccess() {
		mkdirSync('dist/styles', { recursive: true })
		cpSync('src/styles/autodoc.css', 'dist/styles/autodoc.css')
	},
})
