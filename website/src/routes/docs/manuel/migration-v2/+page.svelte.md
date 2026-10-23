---
sidebar_position: 8
title: Migration vers la V2
hide_table_of_contents: false
---

## Les bases de la migration

Le refacto engagé pour la V2 de publicodes va bien au-delà du passage à un compilateur. C'était également l'occasion de revoir le comportement du langage afin de garantir une sémantique plus cohérente et contraignante, pour le meilleur !

Pour rappel, voici les éléments importants embarqués dans la V2.

### 1) "Tout" est modèle

L'arborescence des fichiers sources des règles est centrale. Désormais, un dossier est un modèle qui contient ses entrées et ses sorties. Réutiliser une règle de ce modèle dans un autre (d'un dossier à l'autre donc) nécessite de l'exporter explicitement via la propriété `public: oui` dans le modèle source, et de l'importer explicitement dans le modèle cible via la macro `importer`.

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

Ainsi, lors de la migration, il est nécessaire de vérifier que des règles enfants dont on souhaite conserver la relation d'applicabilité avec leur parent continuent de l'être, et donc de déplacer la condition d'applicabilité. Potentiellement, ça peut donner lieu à une duplication de ces conditions sur plusieurs règles alors qu'elles étaient auparavant héritées d'une seule règle parent.

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

TODO.

Cf article https://publi.codes/blog/v2-amelioration-remplacements/

## Codemod

Nous avons fait au mieux pour automatiser la migration de vos bases de règles vers la V2 avec un codemod. Il est disponible dans le package `@publicodes/codemod`.

La commande est simple :

```bash
npx @publicodes/codemod <path>...
```

Ou bien si vous utilisez un package manager js, après avoir installé le package `@publicodes/codemod` :

```bash
yarn codemod <path>...
```

<Callout type="caution" >

La commande modifie les fichiers **en place**, sans aucun backup. Il est donc fortement recommandé de créer une copie de votre base de règles avant de lancer le codemod, ou bien de commiter vos changements avant de lancer la commande.

</Callout>

Le codemod gère la transformation des possibilités en énumérations, les guillmets doubles et simples, le transfert des attributs non suportés à la racine d'une règle vers la balise `meta`, la transformation de `formule` en `valeur`.

En revanche, pour le moment, les remplacements et les conditions d'applicabilité doivent être gérés manuellement.

## Tester la compilation

TODO

Cf https://publi.codes/docs/manuel/compilation/

- Dépôt "Bac à sable": https://github.com/publicodes/publicodes-road-to-v2.

## Points d'attention

TODO

- Gestion du formatage de l'IDE pour les quotes
- Plus de LSP

## Poser une question ou reporter un bug

TODO

Directement sur Github ou bien via Matrix.
