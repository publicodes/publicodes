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
2. Remplacer les références à la précédente version par la nouvelle version dans les fichiers `package.json`
3. Laisser faire le CI, le paquet sera déployé effectivement une fois le commit mergé sur `master`

Pour vérifier que le script de publication fonctionne, il est possible d'éxecuter `npm publish --dry-run` en local.
