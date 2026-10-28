---
sidebar_position: 8
title: Migration vers la V2
hide_table_of_contents: false
---

## Les bases de la migration

Le refacto engagé pour la V2 de publicodes va bien au-delà du passage à un compilateur. C'était également l'occasion de revoir le comportement du langage afin de garantir une sémantique plus cohérente et contraignante, pour le meilleur !

Pour rappel, voici les éléments importants embarqués dans la V2.

### 1) "Tout" est modèle

L'arborescence des fichiers sources des règles est centrale. Désormais, un dossier est un modèle qui contient ses entrées et ses sorties. Réutiliser une règle de ce modèle dans un autre (d'un dossier à l'autre donc) nécessite de l'exporter explicitement via la propriété `public: oui` dans le modèle source, puis de l'importer dans le modèle cible via le mécanisme `importer`. Pour débuter et tester la V2 sans avoir à gérer les imports/exports, il est possible de placer tous les fichiers de règles à la racine d'un même dossier.

### 2) Un nombre limité de mécanismes

Les attributs de règles sont désormais restreints à un nombre limité de mécanismes. Les attributs non supportés sont transférés vers la balise `meta` de la règle.

Ainsi, les mécanismes courants restent supportés (`titre`, `description`, `unité`, `applicable si`, etc...) mais d'autres attributs, propres au contexte d'utilisation du modèle comme `question`, `note`, `icône`, `id`, etc... sont désormais transférés vers la balise `meta` de la règle.

Autre point important : `valeur` devient le seul attrbut de sortie d'une règle. `formule` n'est plus supporté.

### 3) Double quotes vs single quotes

Dans la V2, les règles de type `text` ont pour valeur une chaîne de caractères encadrée par des doubles guillements.

Les chaînes de caractères encadrées par des simples guillements sont désormais considérées comme des "possibilités", c'est à dire des valeurs possibles pour une règle de type `enum` (cf ci-dessous).

### 4) Les possibilités ont leur propre type : `enum`

Dans la V1, le mécanisme `une possibilité` permettait de définir des valeurs possibles pour une règle, sans garantir que la règle en question puisse effectivement prendre uniquement ces valeurs. Chaque possibilité était alors définie comme une règle, avec son titre etc... Désormais, les possibilités sont un type à part entière : `enum`. Une règle de type `enum` ne peut prendre que les valeurs définies par ses possibilités. Les possibilités sont donc désormais définies comme des chaînes de caractères encadrées par des simples guillements. Il en découle que pour référencer une énumération pour une valeur par défaut ou dans une variation par exemple, il faut utiliser la syntaxe avec de simples guillements et non plus les doubles + simples guillements.

Exemple :

```yaml
# V1
a:
    titre: Couleur préférée
    question: Quel est votre couleur préférée ?
    une possibilité:
        - bleu
        - rouge
    par défaut: "'bleu'"

# V2
a:
    titre: Couleur préférée
    par défaut: 'bleu'
    meta:
        question: Quel est votre couleur préférée ?
    type:
        une possibilité:
            - 'plastique'
            - 'carton'
```

### 5) La non-applicabilité n'est plus propagée aux règles enfant

Dans la V1, lorsqu'une règle n'était pas applicable, toutes ses règles enfants l'étaient également. Dans la V2, une règle peut être non applicable sans que cela n'impacte ses règles enfants. C'est utile dans les cas où on souhaite regrouper sous le même espace nom, des règles qui pourraient être utilisées ailleurs et qui ne sont plus associées à l'applicabilité de la règle parent.

Ainsi, lors de la migration, il est nécessaire de vérifier que des règles enfants dont on souhaite conserver la relation d'applicabilité avec leur parent continuent de l'être, et donc de déplacer la condition d'applicabilité. Potentiellement, ça peut donner lieu à une duplication de ces conditions sur plusieurs règles alors qu'elles étaient auparavant héritées d'une seule règle parent. Néanmoins, il sera possible de retrouver le comportement de la V1 en utilisant le mécanisme `applicabilité étendue à l'espace de nom` au niveau de l'espace nom parent (disponible très bientôt).

```yaml
# V1
a:
    titre: Règle parent
    applicable si: non

b: # non applicable
    valeur: x

c: # non applicable
    valeur: y

# V2
a:
    titre: Règle parent
    applicable si: non

b: # non applicable
    applicable si: non
    valeur: x

c: # applicable
    valeur: y
```

### 6) Nouvelle gestion des remplacements

Le fonctionnement des remplacements a été revu pour être volontairement moins permissif. L'idée est de garantir que les remplacements soient exclusifs, et donc d'éviter des situations où plusieurs règles remplacent la même règle. Il faut alors passer par un chainage des remplacements si un ordre de priorité doit être défini ou bien passer par l'ajout de la propriété `exclusif: oui` si c'est le cas. L'article de blog ["Amélioration des remplacements"](https://publi.codes/blog/v2-amelioration-remplacements/) vous en dit plus !

## Codemod

Nous avons fait au mieux pour automatiser la migration de vos bases de règles vers la V2 avec un codemod. Il est disponible dans le package `@publicodes/codemod`.

La commande est simple :

```bash
npx @publicodes/codemod <path>...
```

Ou bien si vous utilisez un package manager js, après avoir installé le package `@publicodes/codemod` :

```bash
npm run codemod <path>...
```

<Callout type="caution" >

La commande modifie les fichiers **en place**, sans aucun backup. Il est donc fortement recommandé de créer une copie de votre base de règles avant de lancer le codemod, ou bien de commiter vos changements avant de lancer la commande.

</Callout>

Le codemod gère la transformation des possibilités en énumérations, les guillmets doubles et simples, le transfert des attributs non suportés à la racine d'une règle vers la balise `meta`, la transformation de `formule` en `valeur`.

Il gère également les remplacements : les `références à` listant plusieurs règles sont éclatées en une entrée par règle, et les replacements définis avec une `priorité` sont chainés en partant de la priorité la plus faible, de sorte que la priorité la plus haute l'emporte toujours. Lorsque l'ordre n'est pas déterminé (règles remplaçant la même règle sans `priorité`, ou avec des priorités égales), un avertissement est affiché : c'est à vous de vérifier que ces règles sont exclusives (et d'ajouter `exclusif: oui`) ou de chaîner les remplacements manuellement.

En revanche, pour le moment, les conditions d'applicabilité doivent être gérées manuellement.

<Callout type="info">
L'option "--flatten" du codemod permet de basculer tous les fichiers de règles de l'arborescence vers la racine d'un même dossier, pour tester la V2 sans avoir à gérer les imports/exports. Il est recommandé de ne pas utiliser cette option pour une migration définitive vers la V2 : le système de module est justement une volonté de la V2 pour faciliter la réutilisation de règles entre modèles, les montées de version, la stabilité de la surface d'API, etc...
</Callout>

## Tester la compilation

L'étape suivante est de tester la compilation de la base de règles migrée (cf [guide de compilation](https://publi.codes/docs/manuel/compilation)).

En deux mots, il est possible de lancer directement la commande:

```bash
npx publicodes2 compile <path>...
```

Ou bien, si vous utilisez un package manager js, après avoir installé le package `@publicodes/cli` :

```bash
pnpm run publicodes2 compile <path>...
```

Il existe aussi un dépôt "Bac à sable" qui contient l'environnement complet pour tester la V2. Le plus simple est de le cloner et de remplacer les règles par celles de votre base migrée : https://github.com/publicodes/publicodes-road-to-v2.

## Points d'attention

Quelques points d'attention à garder en tête lors de la migration vers la V2 :

- Les textes sont désormais encadrés par des doubles guillemets, et les possibilités par des simples guillemets. Il faut donc veiller à ce que votre IDE ne les reformate pas automatiquement.

- Il n'y a pas encore de language server pour la V2, mais nous y travaillons ! Pour l'instant, tester le modèle nécessite de le compiler, de comparer les résultats entre la V1 et la V2 (via le script de comparaison dans le bac à sable par exemple). Il sera également possible d'utiliser l'autodoc très bientôt !

## Poser une question ou reporter un bug

Si vous avez des questions ou que vous souhaitez reporter un bug, n'hésitez pas à nous contacter directement à l'adresse [contact@publi.codes](mailto:contact@publi.codes) ou directement via [Matrix](https://matrix.to/#/#publicodes:matrix.org).
