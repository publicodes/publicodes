export const publicodesPackages: readonly PublicodesPackage[] = [
    {
        npm: '@incubateur-ademe/nosgestesclimat',
        maintener: 'nos-gestes-climat'
    },
    {
        npm: '@incubateur-ademe/publicodes-acv-numerique',
        maintener: 'nos-gestes-climat',
        users: ['impact-co2']
    },
    {
        npm: '@incubateur-ademe/publicodes-commun',
        maintener: 'nos-gestes-climat',
        users: ['ekofest', 'impact-co2']
    },
    {
        npm: '@incubateur-ademe/publicodes-impact-livraison',
        maintener: 'nos-gestes-climat',
        users: ['impact-co2']
    },
    {
        npm: '@socialgouv/modeles-social',
        maintener: 'code-du-travail-numerique'
    },
    {
        npm: 'modele-social',
        maintener: 'mon-entreprise',
        users: ['estime', 'karburan']
    },
    {
        npm: 'futureco-data',
        maintener: 'futur-eco',
        users: ['nos-gestes-climat']
    },
    {
        npm: 'publicodes-evenements',
        maintener: 'ekofest'
    },
    {
        npm: 'aides-velo',
        maintener: 'mes-aides-vélo',
        users: ['aides-jeune']
    },
    {
        npm: 'exoneration-covid',
        maintener: 'mon-entreprise'
    }
];

export type PublicodesPackage = {
    npm: string;
    maintener: string;
    users?: string[];
};
