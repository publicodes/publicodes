import GithubSlugger from 'github-slugger';
import { toString } from 'mdast-util-to-string';
import { visit } from 'unist-util-visit';
export function remarkHeadings() {
    return async function transformer(tree, vFile) {
        const slugs = new GithubSlugger();

        vFile.data.headings = [];

        visit(tree, 'heading', (node) => {
            vFile.data.headings.push({
                level: node.depth,
                title: toString(node),
                slug: slugs.slug(toString(node))
            });
        });

        if (!vFile.data.fm) vFile.data.fm = {};
        vFile.data.fm.headings = vFile.data.headings;
    };
}
