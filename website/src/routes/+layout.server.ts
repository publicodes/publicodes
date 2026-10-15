import type { LayoutServerLoad } from './$types';

export const prerender = true;
export const trailingSlash = 'always';

export const load: LayoutServerLoad = () => {
	return {};
};
