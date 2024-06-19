import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';

/** @type {import('mdsvex').MdsvexOptions} */
const mdsvexOptions = {
    extensions: ['.svelte.md']
    // highlight: {
    // 	highlighter: async (code, lang = 'text') => {
    // 		const highlighter = await getHighlighter({ theme: 'github-light' });
    // 		const html = escapeSvelte(highlighter.codeToHtml(code, { lang }));
    // 		return `{@html \`${html}\` }`;
    // 	}
    // }
};
/** @type {import('@sveltejs/kit').Config} */
const config = {
    // Consult https://kit.svelte.dev/docs/integrations#preprocessors
    // for more information about preprocessors
    preprocess: [vitePreprocess(), mdsvex(mdsvexOptions)],

    kit: {
        // adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
        // If your environment is not supported, or you settled on a specific environment, switch out the adapter.
        // See https://kit.svelte.dev/docs/adapters for more information about adapters.
        adapter: adapter()
    },
    extensions: ['.svelte', '.svelte.md']
};

export default config;
