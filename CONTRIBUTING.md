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


## Développement local

Pour développer en local, il faut installer les dépendances avec `yarn` puis lancer `yarn dev`. Le site de la doc sera alors disponible sur `http://localhost:3001`, et tous les changements de `publicodes` et `@publicodes/react` seront automatiquement recompilés.

Si vous souhaitez uniquement travailler un package / workspace en particulier, vous pouvez lancer la commande `yarn -T turbo run dev` depuis le dossier du package en question.

Plus globalement, vous pouvez utiliser `yarn -T turbo run <command>` pour lancer une commande dans un package en particulier. Par exemple pour lancer le type-checking dans `@publicodes/react-ui` : `yarn -T turbo run test:type`. Cela compilera automatiquement les dépendances nécessaires (`publicodes` dans ce cas).

Pour en savoir plus, [voir la doc de TurboRepo](https://turbo.build/repo)