// /src/routes/sitemap.xml/+server.ts
import * as sitemap from 'super-sitemap';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
	return await sitemap.response({
		origin: 'https://publi.codes',
		excludeRoutePatterns: ['/studio/.*']
	});
};
