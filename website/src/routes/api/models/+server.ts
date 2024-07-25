import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { updateWatchedPackages } from '$lib/package-library/npm';

export const GET: RequestHandler = async () => {
    const packages = await updateWatchedPackages();

    packages.sort((a, b) => {
        return b.modified.getTime() - a.modified.getTime();
    });

    return json(packages);
};
