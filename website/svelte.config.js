import { preprocessMeltUI, sequence } from '@melt-ui/pp';
import staticAdapter from '@sveltejs/adapter-static';
import nodeAdapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { escapeSvelte, mdsvex } from 'mdsvex';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';
import { getSingletonHighlighter } from 'shiki';
import { remarkHeadings } from './src/lib/utils/remark-headings.js';

const highlighter = await getSingletonHighlighter({
	themes: ['one-light'],
	langs: [
		'yaml',
		'javascript',
		'typescript',
		'html',
		'jsx',
		'bash',
		'elm',
		'json'
	]
});

/** @type {import('mdsvex').MdsvexOptions}*/
const mdsvexOptions = {
	extensions: ['.svelte.md'],
	rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
	remarkPlugins: [remarkHeadings],
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

function adapter() {
	switch (process.env.WEBSITE_ADAPTER) {
		case 'static':
			return staticAdapter({
				// default options are shown. On some platforms
				// these options are set automatically — see below
				pages: 'build',
				assets: 'build',
				fallback: undefined,
				precompress: false,
				strict: true
			});
	}
	return nodeAdapter();
}

/** @type {import('@sveltejs/kit').Config}*/
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: sequence([
		vitePreprocess(),
		mdsvex(mdsvexOptions),
		preprocessMeltUI()
	]),
	kit: {
		// See https://kit.svelte.dev/docs/adapters for more information about
		// adapters.
		adapter: adapter(),
		alias: {
			$data: './src/data',
			$routes: './src/routes'
		},
		prerender: {
			handleMissingId: ({ path, id, message }) => {
				if (
					id === 'getunitkey' &&
					path === '/docs/api/publicodes/functions/parseUnit'
				) {
					return;
				}
				if (
					id === 'formatunit' &&
					path === '/docs/api/publicodes/functions/serializeUnit'
				) {
					return;
				}

				throw new Error(message);
			}
		}
	},
	extensions: ['.svelte', '.svelte.md']
};
export default config;
