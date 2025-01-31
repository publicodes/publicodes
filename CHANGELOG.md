# Changelog

- [CHANGELOG de `publicodes`](./packages/core/CHANGELOG.md)
- [CHANGELOG de `@publicodes/react-ui`](./packages/react-ui/CHANGELOG.md)
- [CHANGELOG de `@publicodes/rest-api`](./packages/rest-api/CHANGELOG.md)

<details>
<summary>
Changelog antérieur à la v1.5.0
</summary>

## 1.5.0

**@publicodes/core**

- Ajoute le mécanisme puissance via la syntaxe `**`

## 1.4.0

- Ajoute les champs `min` et `max` pour le mécanisme d'inversion numérique
- Ajoute du champ `tolérance d'erreur` pour le mécanisme d'inversion numérique
- Fix `isAValidOption` function used to parse situation

## 1.3.3

- Fix critical bug with `context` mecanism introduced in 1.3.2

## 1.3.2

**@publicodes/core**

- Fix `setSituation` with `keepPreviousSituation` option which was broken when using `context` mecanism (#487)
- Perf: improves the performance of the `context` mechanism. If several contexts are identical, then they share a `subEngine` to avoid recalculating the same rules several times (#484)

## 1.3.1

**@publicodes/core**

- Fix `allowOrphanRules` option which was broken by 1.3.0

## 1.3.0

**@publicodes/core**

- Ajoute une méthode `getSituation` à l'Engine.
- Ajoute une option `strict` à l'engine qui permet de lever des erreurs au lieu de warning. Elle peut être finement configurée pour lever certaines erreurs et pas d'autres.

- Ajoute une option `situation` dans le mode strict. Si cette dernière est passée à `false`, alors les règles invalides de la situation seront filtrées sans lever d'erreurs. Une règle est invalide si :
    - La règle n'est pas présente dans la base de règle ou est privée
    - La réponse donnée via un mécanisme "une possibilité" n'est pas une option de réponse
    - La valeur donnée pour une règle n'est pas valide (syntaxe incorrecte, etc.)

## 1.2.0

**@publicodes/core**

- feat: add optional `unité` parameter to `durée` mecanism.

## 1.1.1

**@publicodes/core**

- fix: mecanism « contexte » bug when using rules impacted by the context in the context itself [#360](https://github.com/publicodes/publicodes/issues/360)

## 1.1.0

**@publicodes/react-ui**

- feat: add an optional search bar in the documentation ([#470](https://github.com/publicodes/publicodes/pull/463))

## 1.0.5

**@publicodes/react-ui**

- fix: `contexte` visualisation crash ([#463](https://github.com/publicodes/publicodes/pull/463))

## 1.0.4

**@publicodes/core**

- [Perf] Don't evaluate barème tranche if assiette is null/undefined/0
- Fix contexte mecanism

**@publicodes/react-ui**

- Various style improvement
- Improve wording and position of « voir plus » button in somme and produit

## 1.0.3

**@publicodes/core**

- remove console.log

**@publicodes/react-ui**

- style: improve readability of `context` mecanism
- fix: `arrondi` visualisation crash (severe)
- fix: `inversion numérique` view

## 1.0.2

- fix: value of `est non applicable` with `context` mecanism ([#454](https://github.com/publicodes/publicodes/issues/454))

## 1.0.1

**@publicodes/core**

- fix: correctly parse inlined unit (#444)
- fix: date equality (#441)
- fix: subcontexts links in the studio (#438)
- support leap years (#439)

## 1.0.0-rc.7

**@publicodes/core**

- introduce a new engine option `allowOrphanRules` #435

## 1.0.0-rc.6

**@publicodes/core**

- small improvement on performance of `evaluate`

## 1.0.0-rc.5

**BREAKING**

- replacement are effective if they are defined on a rule applicable (or not non applicable) #432
- remove `traversedVariables` from `evaluate` #422

**@publicodes/core**

- add possibility to disambiguate between parent and child rules with the same name #253
- add error message when a parent rule is missing #431
- perf improvement for parsing (+50%)
- perf improvement for evaluation (+15%)

**@publicodes/react-ui**
Lighten the explanations in the documentation :

- New shiny visualisation for variations, and deplier
- improve visualisation for replacement
- possibility to cutomize the styling of small button with the class `publicodes_btn-small`

**website**

- update doc

## 1.0.0-rc.4

**@publicodes/rest-api**

- fix openapi.json filename in /dist

## 1.0.0-rc.3

**BREAKING**

- Renommage des paramètres des remplacements #319

**@publicodes/core**

- improve type signature of ASTNode & EvaluatedNode

**@publicodes/codemod**

- Add codemod for replacement parameters renaming

**@publicodes/react-ui**

- improve documentation for replacement
- improve documentation style of produit and somme

**website**

- update doc

## 1.0.0-rfc.2

**fix**

- Engine(rules) altered the rules object passed as argument
- Wrong package published for @publicodes/rest-api

## 1.0.0-rfc.1

**BREAKING**

- [Syntax] Changer le mécanisme `recalcul` par `contexte` (#410)
- Remove mecanisms nom and composantes (#420)
- Enforce a consistent order for replacement rules (#313)
- Change the syntax of `produit` to accept a list of factors (#419)
- Rename publicodes-react into @publicodes/react #296
- Rename @publicodes/api to @publicodes/rest-api #304
- Throw error when there is a space arround `/` in `unité` mecanism` (#332)

**publicodes**

- Add `priorité` to replacement
- Supprimer le paramètre avec dans le mécanisme inversion numérique #321

**@publicodes/codemod**

- Add a codemod to refactor rules for the following breaking : #332, #410, #420, #412, #321
- You'll need to check for for bug following changes in the order of applied replacement rules

**website**

- update doc

## 1.0.0-beta.77

- Améliore la gestion des unités (#374)
- Améliore le message d'erreur pour les opérations
- Permet de convertir correctement un dénominateur produit
- Première fonction de gestion d'unité "puissance"
- Ajout d'une première table d'unités équivalentes
- Nouveaux tests

## 1.0.0-beta.76

- Fix `engine.inversionFail` dont la valeur était réinitialisée à chaque appel de `engine.evaluate`

## 1.0.0-beta.75

- Remove yaml package from publicodes-react and use json instead
- Use hash instead of url parameter in doc by default
- Replace `react-monaco-editor` by `@monaco-editor/react` which add yaml coloration
- Update packages: docusaurus, tsup, typescript, vitest, and more
- Fix console.log à supprimer #379

## 1.0.0-beta.74

**core**

- 30% d'amélioration des perfs de parsing grâce à des micros optimisations

## 1.0.0-beta.73

**publicodes-react**

- Corrige un bug de style suite à la mise à jour de styled component v6
- Cache les élements non applicable par défaut dans les mécanismes de type liste, et ajoute un bouton « Afficher les valeurs non applicables ».

## 1.0.0-beta.72

**publicodes-react**

- Corrige un bug dans la compilation esm de react-ui
- BREAKING : passe à styled component v6

## 1.0.0-beta.71

**core**

- Expose the `parseExpression` function (#370)

## 1.0.0-beta.70

**publicodes-react**

- Fix crash on documentation when a ‘variable manquante’ mecanism is used with a replacement

## 1.0.0-beta.69

**publicodes-react**

- Fix crash on documentation page with private rule

## 1.0.0-beta.68

**publicodes-react**

- Pass down the prop `dottedName` to the `Reference` component for allowing users to implement better custom logic (#87, #90)

## 1.0.0-beta.67

**core**

- New `moyenne` mechanism (#358)

## 1.0.0-beta.66

**publicodes-react**

- Fix the display of explanations in the context of a recalul mecanism (the computed values where those of the base engine before)

**core**

- Recalcul mecanism now use the initial context to compute the values of overrides, instead of using the new one.

## 1.0.0-beta.65

**publicodes-react**

- Add id and classname in documentation (#343)
- Fix remaining accessibility violations (#339)

**website**

- Nouvelle page de doc exposant les principe de conception de modèles ouverts (#338)
- documentation: api section (#341)

**core**

- CI: test multiple node versions (#323)
- Fix direct import from browser (#322)
- Remove iife format (#306)

## 1.0.0-beta.64

**publicodes-react**

- Fix remaining accessibility violations (#339)

## 1.0.0-beta.63

**core**

- **⚠ Changement cassant :** Supprime la méthode dépréciée `UNSAFE_isNotApplicable` (#329)

**publicodes-react**

- Improve accessibility (#301)

## 1.0.0-beta.62

**monorepo**

- **⚠ Changement cassant :** Update Node requirement to lts (v18)
- Update yarn to v3.3
- Update typescript, tsup
- Use workspace version of publicodes, publicodes-react
- Add missing READMEs (#297)

**core**

- **⚠ Changement cassant :** exception en cas de division par 0 dans un mécanisme.
- **⚠ Changement cassant :** plus de publication du paquet au format obsolète “iife”

**publicodes-react**

- Refacto publicodes-react to esm
- Refacto in RuleLink
- Temporary fix bad babel transformation on […new Set()]]
- Fix publicodes-react missing sourcemap

**website**

- Clean docusaurus old unused packages
- Update docusaurus to 2.2
- fix(Studio): fix doc link (#311)

## 1.0.0-beta.61

**core**

- Ajoute la conversion des unités de longueurs (mm/cm/m/km)

**publicodes-react**

- Enlève `situation` des props du composant `RulePage` : la situation utilisée pour la règle courante est maintenant retrouvée uniquement avec `engine`
- Ajoute `showDevRules` aux props du composant `RulePage` : permet de cacher la section dev de la documentation

## 1.0.0-beta.60

**publicodes-react**

- Fix d’un crash dans la documentation quand un parent d’une règle est privée mais pas la règle en elle même

## 1.0.0-beta.59

**publicodes-react**

- Ajout dans la documentation react des règles qui sont modifié par une autre

## 1.0.0-beta.58

**publicodes-react**

- Ajout de `openNavButtonPortalId` et de `mobileMenuPortalId` à RulePage

## 1.0.0-beta.57

**publicodes-react**

- **⚠ Changement cassant :** Renomage de l’id de la doc `documentationRuleRoot` par `documentation-rule-root`
- Ajout de la props optionnelle `openNavButtonPortalId` qui permet de changer la place du bouton pour ouvrir le menu sur mobile
- Ajout de la props optionnelle `mobileMenuPortalId` qui permet de changer la place du menu mobile
- fix du menu de la doc qui est cassé avec des textes trop petit #277
- Suppression d’une fonction inutilisé `RuleExplanation`

## 1.0.0-beta.56

- Prise en compte des valeurs qui diffèrent de `null` dans le mécanisme `par défaut` #270
- Ajoute la possibilité de passer une prop `aria-label` à `RuleLink` #273

## 1.0.0-beta.55

**core**

- **⚠ Changement cassant :** Supprime le mécanisme synchronisation #258

## 1.0.0-beta.54

**core**

- Corrige le score dans missingVariables des règles avec un mécanisme `par défaut` #269

## 1.0.0-beta.53

**publicodes-react**

- Ajoute un avertissement dans la section réutilisation si il s’agit d’une règle tagguée comme experimentale
- Enlève l’utilisation de Array.at qui causait un bug critique sur safari

**api**

- Ajoute les warnings à la réponse retournée par evaluate
- Corrige le schema openapi

**core**

- Enlève les messages d’avertissement liés aux cycles : ils se déclenchaient tout le temps sur la base de règle mon-entreprise, en attendant d’implémenter une vérification plus solide

## 1.0.0-beta.52

**publicodes-react**

- Corrige un bug d’affichage dans la documentation

## 1.0.0-beta.51

**publicodes-react**

- Corrige un bug d’affichage dans la documentation

## 1.0.0-beta.50

**publicodes-react**

- Affiche les titre des règles parentes à côté du titre de la règle dans les liens. Cela permet d’ajouter du contexte et de désambiguïser les noms de règles dans les listes.
- Améliore le style du menu de navigation

## 1.0.0-beta.49

**core**

- Ajout d’informations pour les développeurs dans la documentation.
- **⚠ Changement cassant :** Uniformisation des erreurs throw par publicodes avec un nouveau type d’erreur : `PublicodesError`
- Ajout d’une fonction `isPublicodesError` qui permet de detecter une erreur publicodes et de la typer
- Ajout d’un attribut `dottedName` au erreurs `SyntaxError`, `EvaluationError`, `UnknownRule` et `PrivateRule`
- Remplace la fonction `neverHappens` par une erreur `UnreachableCaseError`
- Ajout d’une arborescence des règles dans la documentation [#250](https://github.com/publicodes/publicodes/pull/250)
- Répare l’inférence d’unité dans une somme avec un élément non applicable [#252](https://github.com/publicodes/publicodes/pull/252)

## 1.0.0-beta.48

- **⚠ publié par erreur**

## 1.0.0-beta.47

**core**

- **⚠ Changement cassant** Enlève la possibilité d’initialiser l’`Engine` avec un string YAML. Le client doit se charger du parsing lui-même.

## 1.0.0-beta.46

**publicodes-react**

- Répare la visualisation du mécanisme `par défaut`
- Synchronise la version de publicodes du site documentaire et master

## 1.0.0-beta.45

- Répare la publication automatique de la bibliothèque `@publicodes/api`

## 1.0.0-beta.44

**core**

- Ajoute la possibilité de définir des **règles privée**
- La situation est maintenant encodée sous forme de règle publicodes
- Améliore les performances des mécanismes “le maximum de” et “le minimum de”
- **⚠ Changement cassant** Simplifie l’API de l’Engine en supprimant les fonctions `setOptions`, `getOptions`
- Ajoute une fonction `evaluateNode` pour évaluer les noeud déjà parsés. Dans l’idéal cette fonction ne devrait pas être exposée aux utilisateurs
- Supprime le tri par ordre topologique avant l’inference de type : il suffit de parcourir le graphe en mode “profondeur d’abord” pour avoir le même résultat (améliore les performances)
- Ajoute un mécanisme `avec` pour pouvoir définir des règles imbriquées à n’importe quel endroit (comme pour `nom`)
- Ajoute une option `keepPreviousSituation: boolean` à la méthode `setSituation` pour effectuer une mise à jour non destructive de la situation
- Le mécanisme `résoudre la référence circulaire` prend maintenant en compte l’option `inversionMaxIterations`
- **⚠ Changement cassant** Supprime l’écriture `[ref]` pour ajouter des variables nommées. L’implémentation de cette dernière obligeait à parcourir l’arbre en entier ce qui prenait 300ms sur mon-entreprise.
- Optimise `inlineReplacement` : seule les règles contenant une référence remplacée sont parcourues.
- Supprime la notion de circularDependancies
- Supprime le nombre magique “12” pour la détection de cycle au runtime
- Supprime le rennomage automatique des règles imbriquées

## 1.0.0-beta.43

**api**

- fix temporaire d’une fuite de mémoire dans l’api causée par `shallowCopy()`, issue https://github.com/publicodes/publicodes/issues/239

## 1.0.0-beta.42

**api**

- Refacto de /evaluate : Renvoie `situationError` directement s’il y a une erreur de situation (sans faire d’évaluation) et sinon renvoie `evaluate`.
- Refacto des schema expressions et situation
- Ajout de documentation

## 1.0.0-beta.41

**api**

- Remplace le paramètre du middleware par un Engine (remplace `publicodesAPI(() => new Engine(rule))` par `publicodesAPI(new Engine(rule))`)
- Les expressions acceptent des objets ou des tableaux d’objets

## 1.0.0-beta.40

**core**

- Répare un bug dans les mécanismes ‘le maximum de’ et ‘le minimum de’ lorsque toutes les valeurs sont non applicables

## 1.0.0-beta.39

**core**

- Répare un bug dans les mécanismes ‘le maximum de’ et ‘le minimum de’ en cas de valeur non applicable

## 1.0.0-beta.38

**core**

- Rétabli les `missingVariables` calculées à l’intérieur des mécanismes (précédement supprimée dans beta.34)
- Ajoute des nouveaux mécanismes : `et`, `ou`, `est non applicable`, `est applicable`, `est non défini`, `est défini`, `simplifier l'unité`, `condition`
- Change le comportement de l’addition d’un nombre avec unité et d’un pourcentage : on ajoute le pourcentage du nombre au nombre lui même (`10€ + 20% = 10.2 €`)
- Réecrit les mécanismes `somme`, `produit`, `applicable si`, `non applicable si`, `toutes ces conditions`, `une de ces conditions`, `le maximum de`, `le minimum de`, `abattement` comme composition d’autres mécanismes #23
- Les opérandes des opérations `et`, `ou`, `*`, `/` sont évaluée de manière paresseuse.
- Précise le comportement des opérations de base (\*, +, -, /, >=, <=, <, >, =, et, ou) en cas d’opérande non défini ou non applicable (via des tests)

**publicodes-react**

- Améliore la visualisation des mécanismes qui opère sur des listes (somme, toutes ces conditions, etc…)
- Améliorations diverses de l’affichage de l’explication des calculs
- Reformule l’explication des règles désactivées par l’espace de nom

## 1.0.0-beta.37

**api**

- Ajoute le paquet api

## 1.0.0-beta.36

**core**

- Ajoute la possibilité de définir des règles imbriquées en utilisant le mot clé `avec` #163

## 1.0.0-beta.35

**core**

- Corrige un bug avec le cache des inversions

## 1.0.0-beta.34

**core**

- ⚠ Changement cassant : Les variables manquantes sont désormais retournées sous la forme d’une liste et non plus d’un objet JavaScript
- Introduction des variables traversées : les listes des règles qui ont été explorées lors de l’évaluation d’une expression
- Ajoute une méthode `isApplicable` qui retourne un booléen correspondant à l’applicabilité d’une expression (remplace l’éphémère méthode `evaluateApplicability` introduite dans la version précédente)

## 1.0.0-beta.33

**core**

- Ajoute un paramètre `inversionMaxIterations` dans les options à l’instanciation du moteur pour changer le nombre d’itération de l’inversion avant qu’elle ne soit considérée comme ”échouée” (par défaut 10).
- Ajoute une méthode `evaluateApplicability` qui effectue une évaluation partielle d’un nœud pour déterminer son applicabilité. Seules les variables traversées pour déterminer l’applicabilité apparaîssent dans les « variables manquantes »
- Corrige un bug fatal avec NodeJS v14 ou moins

**publicodes-react**

- Corrige un bug d’affichage dans la documentation lié aux conversions d’unités

## 1.0.0-beta.32

**core**

- ⚠ Changement cassant : Nouvelles valeurs littérales pour les règles non applicables (`null`) et non définies (`undefined`)
  cf. https://github.com/publicodes/publicodes/discussions/158#discussioncomment-2132390
- Nouvelle implémentation de la désactivation de branche pour éviter la remontée de « variables manquantes » inattendues
- ⚠ Changement cassant : La fonction `parsePublicodes` retourne maintenant un objet `{ parsedRules, rulesUnit, rulesDependencies }` et non plus les seules règles parsées

**publicodes-react**

- Améliore le style des mécanismes imbriqués dans une somme

## 1.0.0-beta.31

**publicodes-react**

- La description des mécanismes est disponible via un lien plutôt qu’une modale dans la page
- Amélioration des styles par défaut pour les mécanismes
- Suppressions des dépendances à focus-trap-react
- Ajout de la visualisation pour le mécanisme texte
- Répare le style de l’overlay qui s’affiche pour les remplacements #126

**publicodes**

- Ajoute un nouveau mécanisme `texte` pour l’interpolation de chaine de caractère #152
- Le formattage des chaine de caractère via `formatValue` ne transforme plus la première lettre en capitale
- Ajoute la possibilité d’avoir des espaces après une parenthèse dans une expression publicodes
- Ajoute la possibilité de définir une expression publicodes sur plusieurs lignes

## 1.0.0-beta.30

**publicodes-react**

- Correction d’une erreur de runtime JSX manquant dans la version ESModule.

## 1.0.0-beta.29

**publicodes-react**

- Publication des 2 formats : CommonJS et ESModule

## 1.0.0-beta.28

**publicodes-react**

- Retour en publication CommonJS

## 1.0.0-beta.27

**publicodes-react**

- Correction d’un type de renderer
- Le paquet est désormais publié sous forme d’ES Module

**core**

- Réparation des tests mocha

## 1.0.0-beta.26

**publicodes-react**

- ⚠ Changement cassant: `react-markdown` n’est plus utilisé pour afficher les textes. L’utilisateur peut fournir son propre composant de rendu.

## 1.0.0-beta.25

**core**

- Correction: Import Node.js UMD

## 1.0.0-beta.24

**core**

- Correction: Import dans le REPL svelte.dev

## 1.0.0-beta.23

**core**

- Corrige l’ordre des règles imbriquées dans l’objet parsedRules

## 1.0.0-beta.22

**core**

- Correction: Build en mode “production”

## 1.0.0-beta.20

**core**

- Corrige l’omission des types Typescript dans le paquet

## 1.0.0-beta.19

**core**

- Ajout d’un export `cyclicDependencies` pour permettant de détecter un cycle de références dans les règles

**publicodes-react**

- Meilleur affichage des données manquantes et règles associées dans la documentation
- Legères retouches visuelles

## 1.0.0-beta.18

**core**

- Export ESM sans dépendance à d’autres formats de module (UMD)

## 1.0.0-beta.17

**core**

- Prise en compte des variables manquantes pour l’assiette des grilles et barèmes

**publicodes-react**

- Changement cassant : Le composant `<Documentation />` n’est plus exporté
- Nouveau composant exporté `<RulePage />` qui affiche une seule page
- Possibilité de fournir des composants personnalisés pour l’affichage
- Suppression de la dépendance à react-router et react-helmet
- Suppression de dépendences utilitaires : ramda, classnames, react-easy-emoji
- Corrige le style du remplacement dans les sommes
- Corrige l’affichage des règles remplacées

## 1.0.0-beta.16

**core**

- Répare un bug dans le mécanisme résoudre le cycle
- Suppression des variables temporelles
- Optimisation de la désactivation de branches
- Meilleures performances

## 1.0.0-beta.15

**core**

- Fix bug sur le mécanisme minimum, une valeur non applicable n’est plus considérée comme valant “0” (#1493)

## 1.0.0-beta.14

**publicodes-react**

- Corrige un bug bloquant qui empêchait l’utilisation de la bibliothèque
- Enlève la dépendance à i18n et react-i18n et toute la traduction qui n’était pas utilisée de toute façon
- Ajoute des tests et une publication automatique des paquets publicodes

## 1.0.0-beta.13

**core**

- Ajout d’un nouveau mécanisme : `résoudre la référence circulaire` (#1472)
- Simplification de l’API de Engine (#1431)

**publicodes-react**

- Améliore l’affichage des règles virtuelles dépliée dans une somme
- Ajoute les meta dans les pages de règles (#1411)

</details>
