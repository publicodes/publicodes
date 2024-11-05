import type { ProduitSlug } from './produits';

export const publicodesPackages: readonly PublicodesPackage[] = [
    {
        npm: '@incubateur-ademe/nosgestesclimat',
        maintainer: 'nos-gestes-climat',
        users: ['jagis']
    },
    {
        npm: '@incubateur-ademe/publicodes-acv-numerique',
        maintainer: 'nos-gestes-climat',
        users: ['impact-co2']
    },
    {
        npm: '@incubateur-ademe/publicodes-commun',
        maintainer: 'nos-gestes-climat',
        users: ['ekofest', 'impact-co2']
    },
    {
        npm: '@incubateur-ademe/publicodes-impact-livraison',
        maintainer: 'nos-gestes-climat',
        users: ['impact-co2']
    },
    {
        npm: '@socialgouv/modeles-social',
        maintainer: 'code-du-travail-numerique'
    },
    {
        npm: 'modele-social',
        maintainer: 'mon-entreprise',
        users: ['estime', 'karburan']
    },
    {
        npm: 'futureco-data',
        maintainer: 'futur-eco',
        users: ['nos-gestes-climat']
    },
    {
        npm: 'publicodes-evenements',
        maintainer: 'ekofest'
    },
    {
        npm: 'aides-velo',
        maintainer: 'mes-aides-vélo',
        users: ['aides-jeune', 'jagis']
    },
    {
        npm: 'exoneration-covid',
        maintainer: 'mon-entreprise'
    },
    {
        npm: '@betagouv/france-chaleur-urbaine-publicodes',
        maintainer: 'france-chaleur-urbaine'
    }, {
        npm: 'mesaidesreno',
        maintainer: 'mes-aides-reno'
    }
];

export type PublicodesPackage = {
    npm: string;
    maintainer: string;
    users?: ProduitSlug[];
};
