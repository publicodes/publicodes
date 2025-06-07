import { lastBlogPostDate } from '$lib/model/blog-posts.js';
import type { LayoutServerLoad } from './$types';

export const prerender = true;

export const load: LayoutServerLoad = ({}) => {
	return {
		lastBlogPostDate
	};
};
