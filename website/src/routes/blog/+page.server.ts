import { blogPosts } from '$lib/model/blog-posts';

export function load() {
	return { blogPosts: blogPosts.filter((page) => page.metadata.draft !== true) };
}
