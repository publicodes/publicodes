// @ts-check

import { ReflectionKind } from 'typedoc'
import {
	MarkdownPageEvent,
	MarkdownRendererEvent,
} from 'typedoc-plugin-markdown'

/**
 * @param {import('typedoc-plugin-markdown').MarkdownApplication} app
 */

export function load(app) {
	app.renderer.on(MarkdownRendererEvent.BEGIN, (renderer) => {
		renderer.pages?.forEach((page) => {
			if (page.url.includes('index.md')) {
				page.url = page.url.replace(/index\.md$/, '+page.svelte.md')
			} else {
				page.url = page.url.replace(/(.*?)\.md$/, '$1/+page.svelte.md')
			}
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
		switch (page.model?.kind) {
			case ReflectionKind.Project:
			case ReflectionKind.Module:
			case ReflectionKind.Namespace:
				break
			default:
				page.contents = page.contents.replaceAll(
					/\[(.*?)\]\((?!http)(?!#)(.*?)\)/g,
					`[$1](../$2)`,
				)
				break
		}
		page.contents = page.contents
			?.replaceAll('/index.md', '')
			.replaceAll('(index.md)', '(.)')
			.replaceAll('.md', '')
			// Fix escaping of < , > and { }
			.replaceAll('\\<', '&amp;lt;')
			.replaceAll('\\>', '&amp;gt;')

			.replaceAll('\\{', '&amp;#123;')
			.replaceAll('\\}', '&amp;#125;')

			.replaceAll(/\\\`(.*)\\\`/g, '`&#96;$1&#96;`')

		// .replaceAll(/\\\{(.*)\\\}/g, '{&#39;&#123;$1&#125;&#39;}')
	})
}
