---
sidebar_position: 2
title: Types, opérations et énumérations
---

Il existe cinq types de données en publicodes : [les nombres](#nombres), [les
booléens](#booléens), [les textes](#textes), [les symboles](#symboles)
et [les dates](#dates). Il est possible de manipuler des
[énumérations](#%C3%A9num%C3%A9ration-de-types) pour chacun de ces types.

## Nombres

Publicodes ne fait pas la différence entre les entiers et les nombres à virgule flottante. Les nombres décimaux sont écrits avec un point `.` comme séparateur décimal.

```publicodes
nombre entier: 42
nombre décimal: 3.14
nombre négatif: -10.5
```

Les opérations arithmétiques de base sont supportées :

```publicodes
somme: 1 + 2
soustraction: 3 - 4
multiplication: 5 * 6
division: 7 / 8
division entière: 11 // 2
puissance: 2 ** 10
```

**À noter** : il faut systématiquement un espace avant et après un opérateur.

## Booléens

Publicodes défini deux valeurs booléennes `oui` et `non`. Les comparaisons de valeur (`>`, `>=`, `<`, `<=`, `=` ou `!=`) retournent un booléen.

Les valeur booléennes peuvent être utilisées dans certains mécanismes comme [`variations`](/docs/mecanismes#variations).

```publicodes
ma condition: oui
variations:
  - si: ma condition
    alors: 10
  - sinon: 0
```

### Opération sur les booléens

On peut combiner des booléens entre eux avec les mécanismes [`toutes ces conditions`](/docs/mecanismes#toutes-ces-conditions) ou [`une de ces conditions`](/docs/mecanismes#toutes-ces-conditions).

```publicodes
âge: 17 ans
nationalité française: oui

droit de vote:
  toutes ces conditions:
    - âge >= 18 ans
    - nationalité française

```

<Callout type="info" title="Négation">

Il n'existe pas d'opérateur de négation en publicodes. Pour inverser une condition, il faut utiliser la syntaxe `ma condition = non`

```publicodes
âge: 17 ans
majeur: âge >= 18 ans
mineur: majeur = non

```

</Callout>

## Textes

Une règle peut contenir un texte (ou chaine de charactère). Les textes sont
délimités par des guillemets doubles `"` (et **non** des guillemets simples
`'`, voir [symboles](#symboles)) :

```publicodes
# Utiliser des guillemets imbriqués
a: "Bonjour"
b: |
    "Bonjour"
```

## Symboles

Les symboles ont la particularité de s'énumerer deux mêmes, simplement
en les utilisants. Contrairement aux textes, ils sont délimités par des
guillemets simples `'`. Les symboles ne sont pas des textes, et les deux ne sont
donc pas interchangables :

```publicodes
majorité civile: # ('mineur' | 'majeur')

peut acheter de l'alcool:
  variations:
      - si: majorité civile = 'mineur'
        alors: oui
      - si: majorité civile = 'majeur'
        alors: non
```

## Dates

Les dates sont définies avec le format `JJ/MM/AAAA`. On peut uniquement préciser le mois et l'année `MM/AAAA`. Dans ce cas, le jour est automatiquement fixé au premier du mois.

```publicodes
date 1: 11/01/2000
date 2: 04/2024 # revient à écrire 01/04/2024
```

### Opérations sur les dates

Il est possible de comparer des dates entre elles avec les opérateurs `>`, `>=`, `<`, `<=`, `=` ou `!=`.

Pour connaître la durée entre deux dates, il faut utiliser le mécanisme [`durée`](/docs/mecanismes#durée).

## Énumération de types

Une énumération est une restriction des valeurs possibles pour une rêgle. Chacun
des cinq types primaires peut être énuméré, mais les [symboles](#symboles) ont
quelques particularités.

Les énumérations de valeurs sont calculées avec
les [variations](/docs/mecanismes#variations) et les
[remplacements](/docs/manuel/principe-de-base#remplacement) :

```publicodes
a: # (10 | 20 | 30)
  variations:
    - si: oui
      alors: 10
    - si: oui
      alors: 20
    - sinon: 30

b: # (10 | 20)
  valeur: 10
c:
  valeur: 20
  remplace: b
```

Le compilateur se chargera de vérifier que ces valeurs énumérés sont
compatibles avec les types définis. Ici `b` est une énumération de `10 |
20 | 30`, ce qui n'est pas compatible avec le type défini `100 | 200`. Une
erreur sera donc levée au moment de la compilation :

```publicodes
a:
  valeur: b
  type:
    une possibilité:
      - 100
      - 200
b:
  variations:
    - si: oui
      alors: 10
    - si: oui
      alors: 20
    - sinon: 30
```

---

<Callout type="caution">

Il existe également deux types littéraux particuliers `non applicable` et `non défini`. Pour en savoir plus, consultez la page du manuel dédié.

</Callout>
