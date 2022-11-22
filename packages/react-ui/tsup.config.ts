import { defineConfig } from 'tsup'

export default defineConfig({
	entry: ['source/index.tsx'],
	format: ['cjs', 'esm', 'iife'],
	globalName: 'publicodesReact',
	sourcemap: true,
	clean: true,
	dts: true,
	inject: ['./react-shim.js'],
})
