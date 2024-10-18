---
sidebar_position: 2
title: Mécanismes
---

Dans Publicodes, les mécanismes sont des opérations prédéfinies qui permettent de calculer une valeur à partir d'autres valeurs.

Pour les développeurs, les mécanismes sont l'équivalent de fonctions de base du langage.

## Syntaxe générale

Pour utiliser un mécanisme dans une règle, on écrit le nom du mécanisme suivi de ses paramètres.

<Callout type="tip" title="Familiarisez-vous avec les mécanismes existants">

Il existe un nombre limité de mécanismes prédéfinis dans Publicodes. Avant de commencer à écrire vos premières règles, nous vous conseillons de jeter un œil à la liste de tous les mécanismes pour vous familiariser avec les possibilités du langage.

**[Voir la liste des mécanismes existants](/docs/mecanismes)**.

</Callout>

### Les mécanismes unaires

Il s'agit des mécanismes qui prennent un seul paramètre. Par exemple, le mécanisme `est défini` permet de vérifier si une variable est définie.

```publicodes
vrai si défini:
  est défini: variable
variable:
```

Le paramètre du mécanisme peut être écrit directement après le nom du mécanisme, ou bien à la ligne.

Il existe un mécanisme particulier `valeur`. Ce dernier retourne la valeur passée en paramètre. C'est l'équivalent de l'identité en programmation.

```publicodes
# Ces deux écritures sont équivalentes
a:
  valeur: 10
b: 10
```

### Les mécanismes avec paramètres nommés

Certains mécanismes prennent plusieurs paramètres. Dans ce cas, les paramètres sont passés en tant qu'objet.

```publicodes
exemple:
  durée:
    depuis: 11/06/1991
    jusqu'à: 12/12/2012
    unité: an
```

### Les mécanismes à liste

Enfin, certains mécanismes prennent une liste de paramètres. Les paramètres sont alors écrits les uns en dessous des autres, avec un tiret `-` devant chacun d'eux.

```publicodes
exemple:
  somme:
    - 10
    - 20
    - 12.4 * 1.2
```

## Mécanismes chaînés

Certains mécanismes peuvent apparaître au même niveau d'indentation, il s'agit des mécanismes chainés. Ils sont utilisés pour appliquer une transformation à une valeur principale.

Par exemple, les mécanismes `arrondi` et `plafond` sont des mécanismes chainés :

```publicodes
remboursement:
  valeur: 42.3 €/jour
  arrondi: oui
  plafond: 500€/mois
```

Dans l’exemple précédent, la valeur de `remboursement` est calculée à partir du mécanisme `valeur`, puis elle est arrondie à l'unité la plus proche, avant d'être plafonnée à 500€/mois.

<Callout type="caution" title="Ordre d'application">

Lorsque plusieurs mécanismes sont chaînés au même niveau d'indentation, ils sont appliqués dans un **ordre prédéfini** :

1.  [abattement](/docs/mecanismes#abattement)
2.  [résoudre la référence circulaire](/docs/mecanismes#résoudre-la-référence-circulaire)
3.  [par défaut](/docs/mecanismes#par-défaut)
4.  [plafond](/docs/mecanismes#plafond)
5.  [plancher](/docs/mecanismes#plancher)
<!-- 7.  [simplifier l'unité](/docs/mecanismes#simplifier-lunite) -->
6.  [unité](/docs/mecanismes#unité)
7.  [arrondi](/docs/mecanismes#arrondi)
8.  [non applicable si](/docs/mecanismes#non-applicable-si)
9.  [applicable si](/docs/mecanismes#applicable-si)
<!-- 2.  [variable manquante](/docs/mecanismes#variable-manquante) -->
10. [contexte](/docs/mecanismes#contexte)

Ainsi, l'ordre d'écriture des mécanismes n'a pas d'importance.

</Callout>

Si on souhaite changer l'ordre d'application des mécanismes, le plus simple est de les imbriquer les uns dans les autres.

```publicodes
a:
  # arrondi est appliqué après unité
  valeur: 4266.65 €/an
  unité: €/mois
  arrondi: oui

b:
  # arrondi est appliqué avant unité
  valeur:
      valeur: 4266.65 €/an
      arrondi: oui
  unité: €/mois
```

## Mécanismes personnalisés (_non implémentés_)

À noter : il n'est pas encore possible de définir de nouveaux mécanismes personnalisés directement dans Publicodes. Si vous avez besoin d'une fonctionnalité qui n'existe pas, vous pouvez ouvrir une [issue sur Github](https://github.com/publicodes/publicodes/issues).

## `formule` (_déprécié_)

Le mécanisme `formule` permet d'ajouter un niveau d'indentation avant de spécifier les mécanismes à appliquer. Il est équivalent au mécanisme `valeur` mais ne peut être utilisé qu'au premier niveau d'indentation.

```publicodes
a:
  formule:
    somme:
      - 10
      - 20
```
