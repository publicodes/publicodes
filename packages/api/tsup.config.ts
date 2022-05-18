import { defineConfig } from 'tsup'

export default defineConfig([
	{
		entry: ['source/index.ts'],
		format: ['cjs', 'esm'],
		target: 'es2022',
		clean: true,
		dts: true,
		onSuccess: 'yarn copy:openapi',
	},
])
