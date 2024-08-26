import { preprocessMeltUI, sequence } from '@melt-ui/pp';
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
/** @type {import('mdsvex').MdsvexOptions}*/
const mdsvexOptions = {
    extensions: ['.svelte.md'],
    rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
    remarkPlugins: [remarkHeadings],
    layout: {
        blog: new URL('./src/routes/blog/(article)/article-layout.svelte', import.meta.url).pathname
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
            const html = escapeSvelte(
                highlighter.codeToHtml(code, {
                    lang,
                    theme: 'one-light'
                })
            );
            return `{@html \`${html}\` }`;
        }
    }
};
/** @type {import('@sveltejs/kit').Config}*/
const config = {
    // Consult https://kit.svelte.dev/docs/integrations#preprocessors
    // for more information about preprocessors
    preprocess: sequence([vitePreprocess(), mdsvex(mdsvexOptions), preprocessMeltUI()]),
    kit: {
        // adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
        // If your environment is not supported, or you settled on a specific environment, switch out the adapter.
        // See https://kit.svelte.dev/docs/adapters for more information about adapters.
        adapter: netlifyAdapter(),
        alias: {
            $data: './src/data'
        }
    },
    extensions: ['.svelte', '.svelte.md']
};
export default config;
