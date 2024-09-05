import docsearch from '@docsearch/js';

import '@docsearch/css';

export function insertDocsearch(container: string | HTMLElement) {
    docsearch({
        appId: 'OQN5V7551H',
        apiKey: 'ca100e20061283a1c6424ceaf7b20382',
        indexName: 'publi',
        container,
        placeholder: 'Rechercher sur le site',
        translations: {
            button: {
                buttonText: 'Rechercher',
                buttonAriaLabel: 'Rechercher'
            },
            modal: {
                searchBox: {
                    resetButtonTitle: 'Effacer',
                    resetButtonAriaLabel: 'Effacer la recherche',
                    cancelButtonText: 'Annuler',
                    cancelButtonAriaLabel: 'Annuler',
                    searchInputLabel: 'Rechercher'
                },
                startScreen: {
                    recentSearchesTitle: 'Récent',
                    noRecentSearchesText: 'Aucune recherche récente',
                    saveRecentSearchButtonTitle: 'Enregistrer cette recherche',
                    removeRecentSearchButtonTitle: 'Supprimer cette recherche',
                    favoriteSearchesTitle: 'Favoris',
                    removeFavoriteSearchButtonTitle: 'Supprimer ce favori'
                },
                errorScreen: {
                    titleText: 'Impossible de charger les résultats',
                    helpText: 'Vous avez peut-être un problème de connexion.'
                },
                footer: {
                    selectText: 'sélectionner',
                    selectKeyAriaLabel: 'Entrée',
                    navigateText: 'naviguer',
                    navigateUpKeyAriaLabel: 'Flèche haut',
                    navigateDownKeyAriaLabel: 'Flèche bas',
                    closeText: 'fermer',
                    closeKeyAriaLabel: 'Échap',
                    searchByText: ''
                },
                noResultsScreen: {
                    noResultsText: 'Aucun résultat pour',
                    suggestedQueryText: 'Essayer avec',
                    reportMissingResultsText: 'Vous pensez qu’il devrait y avoir des résultats ?',
                    reportMissingResultsLinkText: 'Faites-le nous savoir'
                }
            }
        }
    });
}
