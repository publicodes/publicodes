export type Page = {
    slug: string;
    metadata: Metadata;
};

export type Metadata = {
    title: string;
    sidebar_position: number;
    menu_title: string;
    headings: Array<{ title: string; level: number; slug: string }>;
};

const docPages = (
    await Promise.all(
        Object.entries(import.meta.glob('./**/+page.svelte.md')).map(async ([path, page]) => {
            const pageContent = (await page()) as {
                metadata: Metadata;
            };
            const metadata = pageContent.metadata;
            metadata.headings = metadata.headings.filter((heading) => heading.level === 2);

            return {
                slug: path.replace('./', '/').replace('/+page.svelte.md', ''),
                metadata
            };
        })
    )
).filter((page) => page.metadata?.title !== undefined) as Array<Page>;

// TODO
// export const prerender = true;

export function load() {
    return { docPages };
}
