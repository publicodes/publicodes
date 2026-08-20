import { blogPosts } from '$lib/model/blog-posts.js';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ url }) => {
	const metadata = blogPosts.find(
		(page) => page.path === url.pathname
	)?.metadata;

	if (!metadata) {
		throw new Error(`No metadata found for ${url.pathname}`);
	}

	return metadata;
};
