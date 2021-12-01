# Comment contribuer ?

Merci de prendre le temps de contribuer ! 🎉

Voici quelques informations pour démarrer :

## Rapport de bug, nouvelles fonctionnalités

Nous utilisons GitHub pour suivre tous les bugs et discussions sur les nouvelles fonctionnalités. Pour rapporter un bug ou proposer une évolution vous pouvez [ouvrir une nouvelle discussion](https://github.com/betagouv/publicodes/discussions). N'hésitez pas à utiliser la recherche pour vérifier si le sujet n'est pas déjà traité dans une discussion ouverte. Si vous avez identifié une coquille ou une petite amélioration vous pouvez ouvrir une « Pull Request » directement !

## Site web https://publi.codes

Le site public est développé avec le framework [Docursaurus](https://docusaurus.io/) et hebergé sur [Netlify](https://netlify.com/).

## Publier une nouvelle version sur NPM

Voici la marche à suivre pour publier une nouvelle version :

1. Renseigner les modifications dans `CHANGELOG.md`
2. Remplacer les références à la précédente version par la nouvelle version dans les packages.json
3. Ajouter tous les changements dans un commit avec le message suivant :
    ```
     📦 Publicodes v1.0.0-beta.<n>
    ```
    > **Important** Le message doit être exactement celui-ci (emoji compris), car le script de déploiement automatique sur le CI se base sur ce dernier.
4. Laisser faire le CI, une fois le commit mergé sur master, le paquet sera déployé effectivement
