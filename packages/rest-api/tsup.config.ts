import { defineConfig } from 'tsup'

export default defineConfig([
	{
		entry: ['src/index.ts'],
		format: ['cjs', 'esm'],
		target: 'es2020',
		clean: true,
		dts: true,
		onSuccess: 'yarn copy:openapi',
	},
])
