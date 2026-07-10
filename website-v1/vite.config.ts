import dsv from '@rollup/plugin-dsv';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
export default defineConfig({
	plugins: [dsv(), sveltekit()],
	optimizeDeps: {
		exclude: [
			'svelte-codemirror-editor',
			'codemirror',
			'@codemirror/language-yaml' /* ... */
		]
	},
	server: {
		fs: {
			allow: ['./tailwind.config.js']
		}
	}
});
