import { blogPosts } from '../posts';

export function load({ route }) {
    return blogPosts.filter((post) => post.path === '/' + route.id.split('/').pop())[0]?.metadata;
}
