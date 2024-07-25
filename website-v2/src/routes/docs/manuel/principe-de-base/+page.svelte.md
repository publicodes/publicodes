---
sidebar_position: 1
title: Principes de base
---

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

## Unités

Pour fiabiliser les calculs et faciliter leur compréhension, on peut préciser
l'unité des valeurs littérales :

```publicodes title="Exemple avec unité"
prix d'un repas: 10 €/repas
nombre de repas: 5 repas

prix total: nombre de repas * prix d'un repas
```

Le calcul est inchangé mais on a indiqué que le "prix d'un repas" s'exprime en
`€/repas` et que le "nombre de repas" est un nombre de `repas`. L'unité du prix
total est inférée automatiquement comme étant en `€`. (`€/repas` \* `repas` =
`€`)

Ce système d'unité permet de typer les formules de calcul et de rejeter
automatiquement des formules incohérentes :

```publicodes
prix d'un repas: 10 €/repas
nombre de repas: 5 repas
frais de réservation: 1 €/repas

prix total: nombre de repas * prix d'un repas + frais de réservation
```

Dans l'exemple ci-dessus, Publicodes détecte une erreur car les termes de
l'addition ont des unités incompatibles : d'un côté on a des `€` et de l'autre
des `€/repas`.

Cette incohérence d'unité témoigne d'une erreur de logique. Ici, une manière de corriger l'erreur peut être de factoriser la variable "nombre de repas" dans la formule du "prix total".

```publicodes
prix d'un repas: 10 €/repas
nombre de repas: 5 repas
frais de réservation: 1 €/repas

prix total: nombre de repas * (prix d'un repas + frais de réservation)
```

<Callout type="caution" >

Il ne faut pas insérer d'espace autour de la barre oblique dans
les unités, l'unité `€ / mois` doit être notée `€/mois`.

</Callout>

Publicodes convertit automatiquement les unités si besoin.

```publicodes
salaire: 1500 €/mois
prime faible salaire applicable: salaire < 20 k€/an
```

<Callout type="info" >

On peut forcer la conversion des unités via le [mécanisme `unité`](/docs/mecanismes#unité).

</Callout>

**Types de base disponibles pour la conversion :**

-   `jour` / `mois` / `an`
-   `€` / `k€`
-   `g` / `kg` / `mg`

### Pourcentage `%`

Il est possible de spécifier un pourcentage comme unité. L'addition d'un nombre avec un pourcentage revient à ajouter le pourcentage à ce nombre. De même pour la soustraction.

```publicodes
prix TTC: 10€ + 20%
```

Le résultat de l'addition de deux pourcentages est bien la somme des deux nombres :

```publicodes
réduction: 2.4% + 5.0%
```

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
addition:
  somme:
    - 7 cafés * 1.5 €/cafés
    - produit: # Menu unique dégressif pour les groupes
        - nombre de repas
        - variations:
          - si: nombre de repas > 10 repas
            alors: 12 €/repas
          - sinon: 15 €/repas
```

### Mécanismes chaînés

Certains mécanismes peuvent apparaître au même niveau d'indentation. Dans ce cas, le moteur appliquera les transformations dans un ordre préétabli.

```publicodes
nombre de repas: 12 repas
remboursement repas:
  valeur: nombre de repas * 4.21 €/repas
  plafond: 500€
  abattement: 25€
  arrondi: oui
```

> **[Voir la liste des mécanismes existants](/docs/mecanismes)**

## Pages d'explications

L'explication des règles est un des objectifs fondamentaux de Publicodes.

Chaque règle se voit générer automatiquement une page explicative
correspondante dans le front-end, contenant une information facilement digeste
mise en regard des calculs eux-mêmes.

Plusieurs propriétés sont reprises dans ces pages d'explications :

-   le **titre**, qui s'affiche en haut de la page. Par défaut on utilise le nom
    de la règle, mais la propriété `titre` permet de choisir un titre plus
    approprié ;
-   la **description** est affichée comme paragraphe d'introduction sur la page.
    On utilise le caractère `|` pour indiquer au parseur Yaml que la description est sur plusieurs lignes ;
-   une **note** de bas de page, affichée après la formule de calcul. Elle peut être sur plusieurs lignes également.

```publicodes
ticket resto:
  titre: Prise en charge des titres-restaurants
  formule: 4 €/repas
  description: |-
    L'employeur peut remettre des titres restaurants sous plusieurs formats: ticket papier, carte à puce
    ou appli mobile
  note: |-
    La valeur a été revalorisée en 2022 pour faire face à l'inflation.
```

## Conditions booléennes

Publicodes supporte des opérateurs booléens basiques.

```publicodes
âge: 17 ans
nationalité française: oui
citoyen européen:
domicilié en France:

droit de vote municipale:
  toutes ces conditions:
    - âge >= 18 ans
    - une de ces conditions:
        - nationalité française
        - toutes ces conditions:
          - citoyen européen
          - domicilié en France

```

Il est possible de faire des branchements conditionnels via le mécanisme [`variations`](/docs/mecanismes#variations)

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

Publicodes différencie désormais la valeur booléenne `non` d'une valeur _non applicable_. Cela permet par exemple de cacher les questions non applicable [dans un formulaire](/docs/guides/creer-formulaire) tout en affichant les questions dont la réponse est `non`.

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

## Espaces de noms

Les espaces de noms sont utiles pour organiser un grand nombre de règles. On
utilise le `.` pour exprimer la hiérarchie des noms.

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

Dans le cas d'espaces de noms imbriqués (à plus qu'un étage), le nom inscrit
dans une règle donnée est recherché de plus en plus haut dans la hiérarchie des
espaces de nom jusqu'à la racine.

```publicodes
salarié:
salarié . rémunération:
salarié . rémunération . primes:

salarié . rémunération . primes . vacances:
  valeur: taux générique * 1000 €

salarié . rémunération . taux générique:
  valeur: 10%
```

Ici `salarié . rémunération . primes . vacances` va faire
référence à `salarié . rémunération . taux générique` trouvé deux
espaces de noms plus haut, et va donc valoir `100 €`.

<Callout type="info" title="Référencer le parent">

Pour faire référence explicitement référence à une règle parente, on peut utiliser le préfixe `^ . `.

C'est utile pour lever l'ambiguïté lorsqu'une règle parente a le même nom qu'une règle enfant.

```publicodes
a: 1
a . b: a + ^ . a
a . b . a: 2
```

</Callout>

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

Dans cet exemple, toutes les références à la règle `frais de repas` seront remplacées par une références à `hôtels cafés restaurants . frais de repas`.
Il est possible d'alléger le code en écrivant directement : `remplace: frais de repas`.

On peut également choisir de remplacer dans un contexte donné :

```publicodes
foo: 0

foo remplacé dans résultat 1:
  remplace:
    références à: foo
    dans: résultat 1
  valeur: 2

foo remplacé dans résultat 2:
  remplace:
    références à: foo
    sauf dans: résultat 1
  valeur: 3

résultat 1: foo # vaut 1
résultat 2: foo # vaut 2

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
