import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [sveltekit()],
    optimizeDeps: {
        exclude: ['svelte-codemirror-editor', 'codemirror', '@codemirror/language-yaml' /* ... */]
    }
});
