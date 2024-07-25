import { getMarkdownPagesInfo } from '$lib/utils/get-markdown-page-info';

export type Metadata = {
    title: string;
    description: string;
    author: string;
    date: string;
    tags: string;
    icon: string;
    draft?: boolean;
    featured?: boolean;
};

const blogPosts = await getMarkdownPagesInfo<Metadata>(import.meta.glob('./**/+page.svelte.md'));

blogPosts.forEach((page) => {
    if (page.metadata?.title === undefined) {
        console.error(`Missing title in ${page.path}`);
    }
});

blogPosts.sort((a, b) => {
    return new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime();
});

export function load() {
    return { blogPosts: blogPosts.filter((page) => page.metadata.draft !== true) };
}
