import { blogPosts } from './posts';

export function load() {
    return { blogPosts: blogPosts.filter((page) => page.metadata.draft !== true) };
}
