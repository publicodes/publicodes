import { publicodesPackagesWithMetadataPromise } from '$lib/model/package-with-metadata';

export async function load() {
    return { packages: await publicodesPackagesWithMetadataPromise };
}
