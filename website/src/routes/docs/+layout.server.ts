import { getMarkdownPagesInfo } from '$lib/utils/get-markdown-page-info';

export type Metadata = {
    title: string;
    sidebar_position: number;
    menu_title: string;
};

const docPages = await getMarkdownPagesInfo<Metadata>(
    import.meta.glob('$routes/docs/**/+page.svelte.md')
);

docPages.forEach((page) => {
    if (page.metadata?.title === undefined) {
        throw new Error(`Missing title in ${page.path}`);
    }
});

export function load({ url }) {
    const metadata = docPages.find((page) => page.path === url.pathname)?.metadata;
    return {
        menuEntries: docPages.filter((page) => page.path.split('/').length <= 4),
        ...metadata
    };
}
