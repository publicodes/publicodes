import { defineConfig } from 'tsup'

export default defineConfig({
	entry: ['source/index.ts'],
	format: ['cjs', 'esm', 'iife'],
	globalName: 'publicodes',
	sourcemap: true,
	clean: true,
})
