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

const blogPosts = await getMarkdownPagesInfo<Metadata>(
    import.meta.glob('$routes/blog/**/+page.svelte.md')
);
blogPosts.forEach((page) => {
    if (page.metadata?.title === undefined) {
        throw new Error(`Missing blog post title in ${page.slug}`);
    }
});

blogPosts.sort((a, b) => {
    return new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime();
});

const lastBlogPostDate = new Date(blogPosts[0].metadata.date);

export { blogPosts, lastBlogPostDate };
