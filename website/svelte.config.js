import netlifyAdapter from '@sveltejs/adapter-netlify';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { escapeSvelte, mdsvex } from 'mdsvex';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';
import { getSingletonHighlighter } from 'shiki';
import { remarkHeadings } from './src/lib/utils/remark-headings.js';

const highlighter = await getSingletonHighlighter({
    themes: ['one-light'],
    langs: ['yaml', 'javascript', 'typescript', 'html', 'jsx', 'bash']
});

/** @type {import('mdsvex').MdsvexOptions} */
const mdsvexOptions = {
    extensions: ['.svelte.md'],
    rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
    remarkPlugins: [remarkHeadings],
    layout: {
        blog: './src/routes/blog/(article)/article-layout.svelte'
    },
    highlight: {
        highlighter: async (code, lang = 'text', metastring) => {
            if (lang && lang.startsWith('publicodes')) {
                const withTitle = (metastring || '').match(/title=".*?"/);
                const withRule = (metastring || '').match(/selectedRuleInDoc="(.*?)"/);
                // FIXME: this is causing bug in the scroll
                return `<PublicodesEditor
    code={\`${code.replaceAll('`', '\\`')}\`}
    ${withTitle ? withTitle[0] : ''}
    ${withRule ? withRule[0] : ''}
/>`;
            }
            const html = escapeSvelte(highlighter.codeToHtml(code, { lang, theme: 'one-light' }));
            return `{@html \`${html}\` }`;
        }
    }
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
        adapter: netlifyAdapter()
    },
    extensions: ['.svelte', '.svelte.md']
};

export default config;
