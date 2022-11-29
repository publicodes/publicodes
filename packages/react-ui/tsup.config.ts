import { defineConfig } from 'tsup'

export default defineConfig({
	entry: ['source/index.tsx'],
	format: ['cjs', 'esm'],
	globalName: 'publicodesReact',
	sourcemap: true,
	clean: true,
	dts: true,
})
