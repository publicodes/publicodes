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

Vitest, contre les deux modèles compilés réels — `auto-entrepreneur` (138 règles, 24 avec une
description rédigée, chaîne de références la plus profonde de six) et `ekofest` (bilan carbone,
facteurs d'émission cités, `par défaut` et `plancher` dominants) — et non contre des arbres
construits à la main.

**La trace vient d'une évaluation réelle avec un contexte fixé**, jamais d'un JSON recopié :
« quelle branche a été prise » doit être affirmé contre ce que le moteur a produit. Les
fixtures AST sont commises ; un script les régénère depuis les exemples du compilateur, parce
que `model.publicodes.js` est un artefact de build ignoré par git et que les tests ne doivent
pas dépendre d'une toolchain OCaml.

Antécédent : les tests de fonctions pures déjà présents dans `autodoc-core`
(`rule-display-name`, `binary-expression`, `format-value`).

**Un test de contrat sur les noms affichés** : tout nom rendu vaut `title` ou, à défaut, le
dernier segment du nom pointé. Ce test existe parce que quatre noms sur onze ont été faux une
fois, dont un factuellement.

## Couture secondaire — `autodoc-react`, tests de composants

Ce qu'une fonction pure ne peut pas exprimer : qu'une fiche s'ouvre au clavier, que le focus y
entre et en revient, qu'elle est nommée pour la règle qu'elle décrit et reliée à son
déclencheur ; que les noms de classe documentés — qui sont le contrat de surcharge — sont
présents. Affirmer ces noms-là, c'est affirmer l'API, pas un détail d'implémentation.

Antécédent : le test de `ChainedValue`, qui affirme déjà ses propres noms de classe.

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
