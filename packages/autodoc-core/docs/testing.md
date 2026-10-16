# Vérifier l'autodoc

Où se testent les décisions de `page-spec.md` et `blocks.md`, et ce qu'un bon test y affirme.

## Ce qu'un bon test affirme

**Ce que le lecteur voit, et pourquoi.** Données en entrée, modèle de vue en sortie. Jamais la
forme d'un arbre React intermédiaire, jamais l'ordre dans lequel la projection est calculée.

## Couture principale — `autodoc-core`, fonctions pures

La plus haute disponible, et la seule nécessaire au cœur du produit : `createPathNavigation`
et la projection d'une règle (`projectRule`) sont des fonctions pures de
`(ast, trace?, contexte?)`. Le choix de la branche prise, la substitution des valeurs, les
quatre absences, le graphe des références et l'ensemble des chemins en découlent tous.

Vitest, sur des **fixtures de deux à cinq règles**, construites par le test lui-même
(`src/test-helpers/fixtures.ts`) : chaque test énonce le mécanisme qu'il exerce, et rien d'autre. Les
identifiants viennent du chemin qui mène au nœud — `total` pour la valeur de la règle,
`total.0` pour son premier terme — donc la trace tient dans le test, écrite à la main :
`{ total: { '': 12 }, 'total.0': { '': 8 } }`.

C'est le contraire d'un gros modèle. Une fixture prise sur le compilateur ne dit pas ce qu'elle
exerce, dérive avec lui, et oblige à versionner un instantané de la trace — qu'il faut ensuite
régénérer, et dont l'écart avec le moteur ne se voit nulle part. Un test doit tenir dans sa
lecture.

**Le modèle réel reste, mais à sa place** : `src/projection/modele.test.ts` projette le JSON que le
compilateur écrit (`packages/compiler/examples/*/model.publicodes.json`, cible
`build-autodoc-example` du Makefile) règle par règle, sans évaluation. C'est le seul accord
qu'une fixture ne peut pas donner — et que le cast `as PublicodeAST` vérifie déjà : il casse si
le compilateur écrit une forme que `schema.json` ne décrit pas.

Antécédent : les tests de fonctions pures déjà présents dans `autodoc-core`
(`rule-display-name`, `binary-expression`, `format-value`).

**Un test de contrat sur les noms affichés** : tout nom rendu vaut `title` ou, à défaut, le
dernier segment du nom pointé. Ce test existe parce que quatre noms sur onze ont été faux une
fois, dont un factuellement.

## Couture secondaire — `autodoc-react`, tests de composants

Ce qu'une fonction pure ne peut pas exprimer : qu'une ligne se déplie au clavier et
porte `aria-expanded` ; que les noms de classe documentés — qui sont le contrat de
surcharge — sont présents. Affirmer ces noms-là, c'est affirmer l'API, pas un détail
d'implémentation.

## Vérification visuelle — le playground

La direction visuelle, les deux niveaux de remplissage et la lisibilité des équations se
jugent dans le navigateur, par capture à 1440 et 390. Pas de test unitaire.

## Hors périmètre

- Implémenter les mécanismes que le compilateur accepte mais ne calcule pas encore
  (`inversion numérique`, `barème`, `grille`, `taux progressif`, `durée`, `logarithme`,
  `résoudre la référence circulaire`). La page rend leur absence honnêtement ; les faire
  exister est un autre chantier.
- Un mode d'évaluation non paresseux. S'il apparaît, il ne doit pas changer la manière dont la
  branche prise est déterminée : c'est la trace qui fait autorité.
- Éditer un contexte depuis la documentation et voir les valeurs se recalculer.
- Traduire les phrases de la bibliothèque ou la prose des modèles.
- Migrer mon-entreprise vers le nouveau rendu ; toucher au rendu v1.
- Valider `schema.json` en CI : le Makefile du compilateur porte le test, aucun workflow ne
  l'appelle. À câbler, séparément.
