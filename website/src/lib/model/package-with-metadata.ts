/**
 * This file contains all the logic related to extracting data from the npm
 * packages.
 */

import { produits } from '$data/produits';
import { publicodesPackages, type PublicodesPackage } from '$data/publicodes-packages';

export type PublicodesPackageWithMetadata = PublicodesPackage & {
    name: string;
    version: string;
    modified: Date;
    description: string;
    rules: Record<string, unknown>;
};

const NPM_REGISTRY_URL = 'https://registry.npmjs.org';

export const publicodesPackagesWithMetadataPromise: Promise<PublicodesPackageWithMetadata[]> =
    Promise.all(publicodesPackages.map(fetchPackageMetadata)).then((packages) =>
        packages.sort((a, b) => b.modified.getTime() - a.modified.getTime())
    );

async function fetchPackageMetadata(
    pkg: PublicodesPackage
): Promise<PublicodesPackageWithMetadata> {
    const response = await fetch(`${NPM_REGISTRY_URL}/${pkg.npm}`);
    const data = await response.json();
    const description = data.description.startsWith('<div') ? '' : data.description;
    const maintener = produits.find((produit) => produit.slug === pkg.maintainer);
    if (!maintener) {
        throw new Error(`Maintainer ${pkg.maintainer} not found in projets.json`);
    }
    return {
        ...pkg,
        maintainer: maintener.name,
        name: data.name,
        version: Object.keys(data.versions).pop()!,
        modified: new Date(data.time.modified),
        description,
        // TODO: fetch the rules from the package
        rules: {}
    };
}
