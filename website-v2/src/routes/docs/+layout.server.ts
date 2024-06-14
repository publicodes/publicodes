import { getMarkdownPagesInfo } from '$lib/utils/get-markdown-page-info';

export type Metadata = {
    title: string;
    sidebar_position: number;
    menu_title: string;
};

const docPages = await getMarkdownPagesInfo<Metadata>(import.meta.glob('./**/+page.svelte.md'));
docPages.forEach((page) => {
    if (page.metadata?.title === undefined) {
        console.error(`Missing title in ${page.path}`);
    }
});

export function load() {
    return { docPages };
}
