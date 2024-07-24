/**
 * This file contains all the logic related to extracting data from the npm
 * packages.
 */

import type { Rule } from 'publicodes';

export type PublicodesPackage = {
    name: string;
    version: string;
    modified: Date;
    description: string;
    rules: Record<string, Rule>;
};

export type PublicodesPackages = PublicodesPackage[];

const watchedPackages = [
    '@incubateur-ademe/nosgestesclimat',
    '@incubateur-ademe/publicodes-acv-numerique',
    '@incubateur-ademe/publicodes-commun',
    '@incubateur-ademe/publicodes-impact-livraison',
    '@socialgouv/modeles-social',
    'exoneration-covid',
    'modele-social',
    'futureco-data',
    'publicodes-evenements'
];

const NPM_REGISTRY_URL = 'https://registry.npmjs.org';

const packages: PublicodesPackages = [];

export function getSortedPackages() {
    return packages.sort((a, b) => a.modified.getTime() - b.modified.getTime());
}

export async function updateWatchedPackages() {
    // if (packages.length === 0) {
    return Promise.all(
        watchedPackages.map(async (pkg) => {
            return await fetchPackage(pkg);
        })
    );
    // }
    // return packages;
}

export async function fetchPackage(name: string): Promise<PublicodesPackage> {
    const response = await fetch(`${NPM_REGISTRY_URL}/${name}`);
    const data = await response.json();
    const description = data.description.startsWith('<div') ? '' : data.description;

    return {
        name: data.name,
        version: Object.keys(data.versions).pop()!,
        modified: new Date(data.time.modified),
        description,
        // TODO: fetch the rules from the package
        rules: {}
    };
}
