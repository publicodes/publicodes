import { blogPosts } from '$lib/model/blog-posts.js';

export function load({ url }) {
	const metadata = blogPosts.find((page) => page.path === url.pathname)
		?.metadata;
	if (!metadata) {
		throw new Error(`No metadata found for ${url.pathname}`);
	}
	return metadata;
}
