import { defineConfig } from 'tsup'

export default defineConfig([
	{
		entry: ['source/index.ts'],
		format: ['cjs', 'esm'],
		globalName: 'publicodes_api',
		target: 'es2022',
		clean: true,
		dts: true,
		onSuccess: 'yarn copy:openapi',
	},
])
