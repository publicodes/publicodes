---
sidebar_position: 2
title: Types et opérations
---

Il existe cinq types de données en publicodes : [les nombres](#nombres),
[les booléens](#booléens), [les textes](#textes), [les symboles](#symboles) et
[les dates](#dates).

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

### Une possibilité

Actuellement, le type texte est utilisé pour représenter les options, ou possibilité. Ainsi, pour proposer des choix à l'utilisateur, on utilise l'écriture suivante :

```publicodes
langue:
  une possibilité:
    - français
    - anglais
    - espagnol
  avec:
    français:
    anglais:
    espagnol:
  par défaut: "'français'"

salution:
  variations:
    - si: langue = 'français'
      alors: "'Bonjour'"
    - si: langue = 'anglais'
      alors: "'Hello'"
    - si: langue = 'espagnol'
      alors: "'Hola'"
```

<Callout type="info">

Cette façon de définir les options est très limitée (très verbeuse et pas de vérification statique). Elle sera amenée à évoluer dans les prochaines versions de publicodes.

</Callout>

## Dates

Les dates sont définies avec le format `JJ/MM/AAAA`. On peut uniquement préciser le mois et l'année `MM/AAAA`. Dans ce cas, le jour est automatiquement fixé au premier du mois.

```publicodes
date 1: 11/01/2000
date 2: 04/2024 # revient à écrire 01/04/2024
```

### Opérations sur les dates

Il est possible de comparer des dates entre elles avec les opérateurs `>`, `>=`, `<`, `<=`, `=` ou `!=`.

Pour connaître la durée entre deux dates, il faut utiliser le mécanisme [`durée`](/docs/mecanismes#durée).

---

<Callout type="caution">

Il existe également deux types littéraux particuliers `non applicable` et `non défini`. Pour en savoir plus, consultez la page du manuel dédié.

</Callout>
