import { type PublicodesPackages } from '$lib/package-library/npm';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
    // NOTE: do we really need to have API calls or can we just fetch data directly?
    const res = await fetch(`/api/models`);
    const packages: PublicodesPackages = await res.json();

    return { packages };
};
