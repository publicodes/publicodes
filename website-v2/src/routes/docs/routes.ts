type Page<Metadata = Record<string, unknown>> = {
    slug: string;
    metadata: Metadata;
};

export const docPages = (
    await Promise.all(
        Object.entries(import.meta.glob('./**/+page.svelte.md')).map(async ([path, page]) => {
            const metadata = (
                (await page()) as {
                    metadata: {
                        title: string;
                        order: number;
                    };
                }
            ).metadata;
            return {
                slug: path.replace('./', '/').replace('/+page.svelte.md', ''),
                metadata
            };
        })
    )
).filter((page) => page.metadata !== undefined) as Array<Page>;

export function getChildPage(slug: string) {
    return docPages
        .filter((page) => {
            return (
                page.slug.startsWith(slug) &&
                page.slug !== slug &&
                page.slug.split('/').length === slug.split('/').length + 1
            );
        })
        .sort(
            (b, a) =>
                (b.metadata.sidebar_position as number) - (a.metadata.sidebar_position as number)
        );
}
