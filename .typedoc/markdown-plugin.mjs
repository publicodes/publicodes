// @ts-check

import {
	MarkdownPageEvent,
	MarkdownRendererEvent,
} from 'typedoc-plugin-markdown'

/**
 * @param {import('typedoc-plugin-markdown').MarkdownApplication} app
 */

export function load(app) {
	app.renderer.on(MarkdownRendererEvent.BEGIN, (renderer) => {
		renderer.urls?.forEach((url) => {
			if (url.url.includes('index.md')) {
				url.url = url.url.replace(/index\.md$/, '+page.svelte.md')
			} else {
				url.url = url.url.replace(/(.*?)\.md$/, '$1/+page.svelte.md')
			}
			url.url = url.url.toLocaleLowerCase()
		})
	})

	app.renderer.on(MarkdownPageEvent.BEGIN, (page) => {
		page.frontmatter = {
			title: page.model?.name,
			sidebar_position: page.model?.name === 'publicodes' ? 1 : 5,
			// spread the existing frontmatter
			...page.frontmatter,
		}
	})

	app.renderer.on(MarkdownPageEvent.END, (page) => {
		page.contents = page.contents
			?.replaceAll('/index.md', '')
			.replaceAll('(index.md)', '(.)')
			.replaceAll('.md', '')
			// The link should work when the page is not `my-page/index.md` but just `/my-page`
			.replaceAll(
				/\[(.*?)\]\((?!http)(.*?)\)/g,
				`[$1](${page.url.split('/').at(-2) ?? '.'}/$2)`,
			)
			.replaceAll('(../', '(')
			// Fix escaping of < and >
			.replaceAll('\\<', '&amp;lt;')
			.replaceAll('\\>', '&amp;gt;')
			.toLocaleLowerCase()
	})
}
