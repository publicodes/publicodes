import { lastBlogPostDate } from '$lib/model/blog-posts.js';

export const prerender = true;
export async function load() {
	return {
		lastBlogPostDate
	};
}
