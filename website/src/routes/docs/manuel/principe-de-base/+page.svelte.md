---
sidebar_position: 1
title: Principes de base
---

<script>
    import { PanelRightOpen } from 'lucide-svelte';
</script>

La syntaxe de Publicodes est basée sur le langage
[Yaml](https://en.wikipedia.org/wiki/YAML).

Un fichier Publicodes contient une liste de _règles_ identifiées par leur _nom_ et
possédant une _valeur_ :

```publicodes
prix d'un repas: 10 €
```

Une formule de calcul peut faire _référence_ à d'autres règles.
Dans l'exemple suivant la règle `prix total` aura pour valeur 50 (= 5 \* 10)

```publicodes
prix d'un repas: 10 €
prix total: 5 * prix d'un repas
```

Il s'agit d'un langage déclaratif : comme dans une formule d'un tableur le `prix total` sera recalculé automatiquement si le prix d'un repas change. L'ordre de
définition des règles n'a pas d'importance.

Il est possible de préciser des _unités_ pour les valeurs littérales. Ici, prix d'un repas à pour unité `€`. Les unités sont propagées dans les calculs, et les incohérences d'unités sont détectées automatiquement.

> [En savoir plus sur les unités](/docs/manuel/unites)

## Mécanismes

Il existe une autre manière d'écrire des formules de calcul : les mécanismes. Au lieu de définir la formule sur une ligne, celle-ci prend la forme d'un objet sur plusieurs lignes.

Par exemple, la formule suivante :

```publicodes
prix total: 5 repas * 9 €/repas
```

peut également s'écrire en utilisant le mécanisme [`produit`](/docs/mecanismes#produit) :

```publicodes
prix total:
  produit:
    - 9 €/repas
    - 5 repas
```

Un des avantages de cette écriture est que la syntaxe hiérarchique de Yaml permet d'imbriquer les mécanismes :

```publicodes
nombre de repas: 12 repas
prix total:
  somme:
    - 7 cafés * 1.5 €/cafés
    - produit:
        - nombre de repas
        - 12 €/repas
```

> [En savoir plus sur les mécanismes](/docs/manuel/mecanismes)

## Pages d'explications

L'explication des calculs est un des objectifs fondamentaux de Publicodes. Un utilitaire permet de générer automatiquement une documentation explorable à partir des règles définies.

Sur ce site, vous pouvez afficher la documentation d'un exemple en cliquant sur le bouton <PanelRightOpen class="inline"/> en haut à droite.

```publicodes
ticket resto:
  titre: Prise en charge des titres-restaurants
  formule: 4 €/repas
  description: |
    L'employeur peut remettre des titres restaurants sous plusieurs formats: ticket papier, carte à puce
    ou appli mobile
  note: |
    La valeur a été revalorisée en 2022 pour faire face à l'inflation.
```

> [En savoir plus sur les pages d'explication](/docs/manuel/documentation)

## Types

En plus des nombres, publicodes supporte différents types de valeurs :

```publicodes
# Chaine de caractères
nationalité: "'française'"
# Date
date de naissance: 11/01/2000
# Booléen
majeur: oui
```

> [En savoir plus sur les types de base](/docs/manuel/types)

## Applicabilité

On peut définir des conditions d'applicabilité pour des valeurs :

```publicodes
date de début: 12/02/2020

ancienneté en fin d'année:
  durée:
    depuis: date de début
    jusqu'à: 31/12/2020

prime de vacances:
  applicable si: ancienneté en fin d'année > 1 an
  valeur: 200€
```

Ici, si l'ancienneté est inférieure à un an, alors la prime de vacances sera
_non applicable_.

Les variables _non applicable_ sont prise en compte différement au niveau des mécanismes numériques.
Par exemple le mécanisme `somme` comptera une prime non applicable comme valant zéro. Un plafond _non applicable_ n'aura pas d'incidence sur la valeur retournée (même chose pour un abattement ou un plancher par exemple).

<Callout type="caution" title="La valeur `non` est applicable">

Publicodes différencie la valeur booléenne `non` d'une valeur _non applicable_. Cela permet par exemple de cacher les questions non applicable [dans un formulaire](/docs/guides/formulaire) tout en affichant les questions dont la réponse est `non`.

</Callout>

### Tester l'applicabilité

On peut tester si une variable est applicable ou non applicable avec les mécanismes `est applicable` et `est non applicable`.

### Rend non applicable

Il est également possible de rendre une règle non applicable depuis une autre règle :

```publicodes
nouveau salarié:
  valeur: oui
  rend non applicable: prime de vacances

prime de vacances: 200€

primes:
  somme:
    - prime de vacances
    - 150€
```

Si on change la valeur de la règle `nouveau salarié` à `non`, alors la référence à `prime de vacances` redevient applicable.

<Callout type="info" title="Note">

La syntaxe `rend non applicable` fonctionne de la même manière que le remplacement : elle rend non applicable toutes les références à la règle choisie.

**[En savoir plus sur le remplacement](/docs/manuel#remplacement)**
</Callout>

## Espace de nom

Les espaces de noms sont utiles pour organiser un grand nombre de règles. On utilise le `.` pour exprimer la hiérarchie des noms.

```publicodes
prime de vacances: taux * 1000 €
prime de vacances . taux: 6%
```

Ici, `prime de vacances` est à la fois une règle et un espace de noms. La variable
`taux` est définie dans cet espace de noms et c'est elle qui est référencée dans
la formule de calcul de la règle `prime de vacances`.

La règle `prime de vacances` est elle-même définie dans l'espace de nom racine.

On pourrait avoir une autre variable `taux` dans un espace de nom
différent, sans que cela entre en conflit :

```publicodes
prime de vacances: taux * 1000 €
prime de vacances . taux: 6%

# Ceci n'entre pas dans le calcul de `prime de vacances` définie plus haut
autre prime:
autre prime . taux: 19%
```

On dit que la règle `prime de vacances` fait référence à la
règle `prime de vacances . taux` via le nom raccourci `taux`.

Pour faire référence à une règle hors de son espace de nom, on peut écrire le
nom complet de cette règle:

```publicodes
a:
a . b: 10
c: a . b
```

### Désactivation de branche

Il est possible de désactiver l'ensemble des règles définies dans un espace de nom.

Toutes les règles possèdent une dépendance implicite à leur parent. Si ce dernier vaut à _non_ ou est _non applicable_ alors toutes les règles enfants seront _non applicables_

```publicodes
CDD: non
CDD . indemnité de précarité: 1500€ # non applicable

indemnités:
  somme:
    - 100 €
    - CDD . indemnité de précarité
```

```publicodes
région: '"Centre"'

aides occitanie:
  applicable si: région = 'Occitanie'
aides occitanie . subvention vélo : 500 €
```

## Chaînes de caractères littérales

Pour qu'une valeur soit interprétée comme une chaîne de caractères littérale et
non comme une référence à une autre règle, il faut que la chaîne de caractères
soit encadrée d'apostrophes `'` ou de guillemets `"`. Ces symboles doivent être
échappés dans certaines situations, pour qu'ils ne soient pas ignorés comme
faisant partie de la syntaxe Yaml (cas notable : à la définition d'une règle
avec pour valeur une chaîne de caractères).

L'exemple suivant montre plusieurs façons de définir et d'utiliser des chaînes
de caractères littérales :

```publicodes
région: '"Nouvelle-Aquitaine"'
région 2: "'Provence-Alpes-Côte d'Azur'"
région 3: |
  "Occitanie"
région 4:
  texte: Grand Est
```

Lors de comparaisons de chaînes de caractères, la syntaxe yaml échappe automatiquement les guillemets. Ces deux formulations sont donc équivalentes :

```publicodes
région:
comparaison 1: région = "Nouvelle-Aquitaine"
comparaison 2: 'région = "Nouvelle-Aquitaine"'
```

<Callout type="warning" title="Attention">

Dans une définition, encadrer une valeur par de simples guillemets ne définit pas une chaîne de caractères littérale

```publicodes
région interprétée comme référence: "Bretagne"
Bretagne:
code interprété comme nombre: "12.34Z"
```

</Callout>

## Remplacement

Certaines règles ne s'appliquent parfois que dans quelques situations
particulières et modifier la définition des règles générales pour prendre en
compte ces particularités pose des problèmes de maintenabilité de la base de
règles.

Publicodes dispose d'un mécanisme de remplacement qui permet d'amender n'importe
quelle règle existante sans avoir besoin de la modifier :

```publicodes
frais de repas: 5 €/repas

cafés-restaurants: oui

cafés-restaurants . frais de repas:
  remplace:
    références à: frais de repas
  valeur: 6 €/repas

montant repas mensuels: 20 repas * frais de repas
```

Dans cet exemple, toutes les références à la règle `frais de repas` seront remplacées par une références à `cafés-restaurants . frais de repas`.
Il est possible d'alléger le code en écrivant directement : `remplace: frais de repas`.

On peut également choisir de remplacer dans un contexte donné :

```publicodes
foo: 0

foo remplacé dans résultat 1:
  remplace:
    références à: foo
    dans: résultat 1
  valeur: 2

foo remplacé dans autres résultats:
  remplace:
    références à: foo
    sauf dans: résultat 1
  valeur: 3

résultat 1: foo # vaut 2
résultat 2: foo # vaut 3
résultat 3: foo # vaut 3

```

<Callout type="warning" title="Attention">

Un remplacement modifie **les références**, et non la règle elle-même.
Dans l'exemple ci-dessus, **la règle `foo` n'est pas modifiée** : ce sont ses références qui le sont (dans `résultat 1` et `résultat 2`).
</Callout>

### Remplacement non applicable

Si le remplacement est défini dans une règle dont la valeur est `non applicable`, alors ce dernier n'est pas appliqué :

```publicodes
a: 1

b:
  applicable si: non
  remplace: a
  valeur: 5

résultat: a # vaut 1 car b est non applicable
```

<Callout type="caution" title="La valeur `non` est applicable">

On peut ainsi remplacer une règle par `non`.

```publicodes
a: oui
b:
  remplace: a
  valeur: non

résultat: a # vaut non car b est applicable
```

</Callout>

### Ordre de priorité

Lorsque plusieurs remplacements sont applicables pour une référence, l'ordre de priorité est le suivant :

1. Le remplacement avec la `priorité` la plus haute est utilisée

```publicodes
a: 1

b:
  remplace:
    références à: a
    priorité: 2
  valeur: 5

c:
  remplace: a
  valeur: 10

résultat: a
# est remplacé par `b` car ce remplacement a une priorité
# plus élevée que celui de `c` (par défaut à zéro)
```

2. Sinon, c'est le nom de la règle de définition qui est utilisé (comparaison lexicographique)

```publicodes
a: 1
b:
  remplace: a
  valeur: 5
b . c:
  remplace: a
  valeur: 10

résultat: a
# est remplacé par `b . c` car il est situé après `b` dans l'ordre alphabétique
```

## Définir des règles imbriquées

```publicodes
prix final:
   valeur: 157 € * (100% - 20%)
```

Dans cet exemple, si l'on veut extraire le prix et la promotion dans des variables séparées, on est obligé de les définir à côté de la règle `prix final` :

```publicodes
prix final:
   valeur: prix de base * (100% - réduction)
prix final . prix de base: 157€
prix final . réduction: 20%
```

Pour alléger cette écriture, on peut utiliser la notation `avec` qui permet de définir des règles enfants directement depuis une règle parente :

```publicodes
# Equivalent à l'exemple précédent

prix final:
   valeur: prix de base * (100% - réduction)
   avec:
     prix de base: 157 €
     réduction: 20%
```

<Callout type="tip" >

On peut tout à fait imbriquer plusieurs niveaux de règles :

```publicodes
a:
  valeur: b
  avec:
    b:
      valeur: c
      avec:
        c: 2000 €

```

</Callout>

## Règles non définie

Il est possible de laisser certaines règles vide pour être saisie par l'utilisateur par exemple.
Lors de l'évaluation, les variables dont les valeurs ne sont pas renseignées sont remontées.

```publicodes
salaire brut:
  unité: €/mois

salaire net: salaire brut - 20 %
```

Il est possible de donner une valeur par défaut. Les variables manquantes seront quand même remontées, et le moteur utilisera la valeur par défaut pour le calcul.

```publicodes
durée:
  par défaut: 2 mois

salaire brut:
  par défaut: 1500 €/mois

indemnité de CDD: 10 % * salaire brut * durée
```

## Règles privées

Par défaut, les règles publicodes sont accessibles partout, tout le temps, que
ce soit depuis une autre règle ou lors de l'évaluation.

Si on ne souhaite pas exposer certaines règles internes, il est possible de les marquer comme `privée` :

-   soit en ajoutant un attribut `privé: oui` dans le corps de la règle
-   soit en préfixant le nom de la règle par : `[privé]`

Les règles privées permettent d'encapsuler des calculs intermédiaires. Elles sont utiles si
vous exposez votre base de règles à des utilisateurs tiers (via un paquet npm ou l'API REST) car elles
permettent d'améliorer la maintenabilité sans sacrifier la lisibilité de la base de règle.

```publicodes
assiette: 2100 €
cotisation:
  produit:
    - assiette
    - taux
  avec:
    '[privé] taux': 2.8%

# Erreur : la règle `cotisation . taux` n'est pas accessible depuis `résultat`
résultat: cotisation . taux
```

### Comportement des règles privées

-   Les règles privées peuvent être référencées depuis toutes les règles située dans l'espace de nom parent direct. Par exemple, si la règle `a . b` est privée, elle peut être référencée depuis `a . b . c`, `a . x`, `a`, mais pas par `d` ou `d . c`.
-   Les règles privées ne possèdent pas de page de documentation dédiées
-   L'appel de getRule sur une règle privée jette une erreur
-   Elles ne sont pas listées dans `getParsedRules`
-   On ne peut pas évaluer une référence à une règle privée
-   On ne peut pas modifier une règles privée via la situation
