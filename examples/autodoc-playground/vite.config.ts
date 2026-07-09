import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: [
			{
				find: '@publicodes/autodoc-core/styles/autodoc.css',
				replacement: fileURLToPath(
					new URL(
						'../../packages/autodoc-core/src/styles/autodoc.css',
						import.meta.url,
					),
				),
			},
		],
	},
})
