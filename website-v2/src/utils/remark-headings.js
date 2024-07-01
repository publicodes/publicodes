import GithubSlugger from 'github-slugger';

export function remarkHeadings() {
    let visit;
    let tree_to_string;
    return async function transformer(tree, vFile) {
        const slugs = new GithubSlugger();
        if (!visit) {
            tree_to_string = (await import('mdast-util-to-string')).toString;
            visit = (await import('unist-util-visit')).visit;
        }

        vFile.data.headings = [];

        visit(tree, 'heading', (node) => {
            vFile.data.headings.push({
                level: node.depth,
                title: tree_to_string(node),
                slug: slugs.slug(tree_to_string(node))
            });
        });

        if (!vFile.data.fm) vFile.data.fm = {};
        vFile.data.fm.headings = vFile.data.headings;
    };
}
