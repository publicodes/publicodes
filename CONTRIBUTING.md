# Comment contribuer ?

Merci de prendre le temps de contribuer ! 🎉

Voici quelques informations pour démarrer :

## Rapport de bug, nouvelles fonctionnalités

Nous utilisons GitHub pour suivre tous les bugs et discussions sur les nouvelles fonctionnalités.

- Pour rapporter un bug vous pouvez [ouvrir une issue](https://github.com/publicodes/publicodes/issues).
- Pour proposer une nouvelle fonctionalité, préférez les [discussions](https://github.com/publicodes/publicodes/discussions).
- N'hésitez pas à utiliser la recherche pour vérifier si le sujet n'est pas déjà traité dans une discussion ouverte.

### Pull Request

Vous pouvez proposer une amélioration directement en ouvrant une Pull Request. Que ce soit pour corriger une coquille, améliorer la documentation ou ajouter une nouvelle fonctionnalité au langage, nous sommes réactifs et nous serons ravis de vous aider à intégrer votre contribution.

## Développement local

Pour développer en local, il faut installer les dépendances avec `yarn` puis lancer `yarn dev`. Le site de la doc sera alors disponible en local et tous les changements de `publicodes` et `@publicodes/react` seront automatiquement recompilés.

### TurboRepo

> TurboRepo est un outil qui permet de gérer des workspaces avec des dépendances partagées. Cela permet de simplifier le développement en ne recompilant que les packages nécessaires.

Vous pouvez installer TurboRepo avec `npm install -g turbo`. L'autre solution est d'utiliser `npx` pour lancer les commandes.

Si vous souhaitez uniquement travailler un package / workspace en particulier, vous pouvez lancer la commande `turbo run dev` depuis le dossier du package en question.

Plus globalement, vous pouvez utiliser `turbo run <command>` pour lancer une commande dans un package en particulier. Par exemple pour lancer le type-checking dans `@publicodes/react-ui` : `turbo run test:type`. Cela compilera automatiquement les dépendances nécessaires (`publicodes` dans ce cas).

Pour en savoir plus, [voir la doc de TurboRepo](https://turbo.build/repo)

### Site web https://publi.codes

Le site public est développé avec [Svelte](https://kit.svelte.dev/) et hebergé sur [Netlify](https://netlify.com/).

## Ajouter un nouveau mécanisme

Les mécanismes sont les briques de base du langage publicodes. Il y en existe plusieurs types :

- **Les opération de base**, (addition, soustraction, conditions, etc.) qui sont implémentées directement en JavaScript dans le fichier [`operation.ts`](https://github.com/betagouv/publicodes/blob/master/packages/core/src/mecanisms/operation.ts). Leur syntaxe est définie dans une [grammaire nearley](https://github.com/betagouv/publicodes/blob/master/packages/core/src/grammar.ne)
- **Les mécanismes de base**, qui sont des mécanismes implémentés directement en JavaScript. Des conditions, ou tout autre mécanisme « complexe » qui ne peut pas être implémenté en publicodes (inversion numérique, contexte, etc.)
  - Exportent une fonction `parse` qui prend en entrée le noeud yaml du mécanisme et retourne un `ASTNode`
  - Exportent une fonction `evaluate` qui prend en entrée l`ASTNode` et l'évalue
  - Spécifient l'[inférence de type](https://github.com/betagouv/publicodes/blob/master/packages/core/src/inferNodeType.ts).
- **Les mécanismes composés**, qui sont des mécanismes implémentés en publicodes, en composant des mécanismes de base. Il s'agit par exemple des mécanismes `somme`, `produit`, `toutes les possibilités`, etc.

### Test

Pour chaque mécanisme, il est nécessaire d'écrire des tests. Ils sont au format publicodes, et sont stockés dans le dossier [`test/mécanismes`](https://github.com/betagouv/publicodes/blob/master/packages/core/test/m%C3%A9canismes/)

### Explications (`@publicodes/react-ui`)

Créer un composant React pour expliquer le mécanisme. Il s'agit d'un composant qui prend en entrée un `ASTNode` et qui retourne un composant React. Il est stocké dans le dossier [`react-ui/src/mecanisms`](https://github.com/betagouv/publicodes/blob/master/packages/react-ui/src/mecanisms/)

### Documentation / outils

- [Documenter le mécanisme sur le site](https://github.com/betagouv/publicodes/blob/master/website/src/routes/docs/mecanismes/+page.svelte.md)
- Ajouter le mécanisme dans la [grammaire tree-sitter](https://github.com/publicodes/tree-sitter-publicodes/blob/main/grammar.js) pour la coloration syntaxique.

## Publier les changements (changeset)

> changeset est un outil qui permet d'automatiser le versioning et la publication des packages dans un monorepo.

Toute PR qui modifie le code d'un `package` de base doit être accompagnée d'un changeset. Pour cela, il suffit de lancer `yarn changeset` et de suivre les instructions.

Une fois votre PR validée et mergée, vos changements seront automatiquement ajoutées à une PR « Version Packages ». La validation de cette PR déclenchera la publication des packages modifiés, avec la bonne montée de version.
