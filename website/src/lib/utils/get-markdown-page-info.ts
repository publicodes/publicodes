export type Page<Metadata> = {
    path: string;
    metadata: Metadata & {
        headings: Array<{ title: string; level: number; slug: string }>;
        description: string;
    };
};

export function getMarkdownPagesInfo<Metadata>(
    globImport: Record<string, () => Promise<unknown>>
): Promise<Array<Page<Metadata>>> {
    return Promise.all(
        Object.entries(globImport).map(async ([path, page]) => {
            const pageContent = (await page()) as {
                metadata: Page<Metadata>['metadata'];
            };
            const metadata = pageContent.metadata;
            metadata.headings = metadata.headings.filter((heading) => heading.level === 2);

            return {
                path: path
                    .replace('./', '/')
                    .replace('/+page.svelte.md', '')
                    .replace(/\(.*\)\//g, ''),
                metadata
            };
        })
    );
}
