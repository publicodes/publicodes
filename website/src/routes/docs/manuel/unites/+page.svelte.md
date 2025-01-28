---
sidebar_position: 1
title: Unités
---

Pour fiabiliser les calculs et faciliter leur compréhension, on peut préciser
l'unité d'un nombre :

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

<Callout type="info" title="Pluralisation non implémentée">

À l'heure actuel, Publicodes ne gère pas la [pluralisation des unités](https://github.com/publicodes/publicodes/discussions/199). Il faut donc écrire `3 jour` et non `3 jours`.

</Callout>

## Conversion d'unités

Publicodes convertit automatiquement les unités si besoin.

```publicodes
salaire: 1500 €/mois
prime faible salaire applicable: salaire < 20 k€/an
```

On peut forcer la conversion des unités via le [mécanisme `unité`](/docs/mecanismes#unité).

```publicodes
salaire: 2500 €/mois
salaire annuel:
    valeur: salaire
    unité: €/an
```

### Unités de base disponibles pour la conversion

- `jour` / `mois` / `trimestre` / `an`
- `€` / `k€`
- `g` / `kg` / `mg`
- `km` / `m` / `cm` / `mm`

Si vous souhaitez en ajouter d'autres, n'hésitez pas à proposer une pull request ([voir le code source concerné](https://github.com/publicodes/publicodes/blob/2ffef27378e370f9ee018efee1e383e4e7966746/packages/core/src/units.ts#L183)).

## Puissances

Il est possible d'utiliser des puissances dans les unités. Pour cela, on ajoute l'exposant à la fin de l'unité.

```publicodes
accélération: 9.81 m/s2
```

Publicodes simplifie automatiquement les unités avec exposants.

```publicodes
vitesse après 3 secondes: 9.81 m/s2 * 3s
```

## Pourcentage `%`

Il est possible de préciser un pourcentage comme unité. Un pourcentage est une unité "neutre", sans dimension, qui exprime un rapport entre deux valeurs.

Un pourcentage peut être converti en valeur numérique sans unité.

```publicodes
taux de TVA:
    valeur: 20%
    unité: ''
```

### Opérations sur les pourcentages

L'addition d'un nombre et d'un pourcentage revient à ajouter le pourcentage à ce nombre. De même pour la soustraction.

```publicodes
prix TTC: 10€ + 20%
```

En revanche, le résultat de l'addition de deux pourcentages est bien la somme des deux nombres :

```publicodes
réduction: 2.4% + 5.0%
```

### Pourcentage combiné à une unité

Il est possible de combiner un pourcentage à une unité.

```publicodes
taxe: 2.4%/voitures
```

En revanche, dans ce cas, les opérations + et - se comporteront comme pour les unités classiques, et des erreurs seront levées si les unités ne sont pas compatibles.

```publicodes
valeur: 4 voitures + 2.4%/voitures
```
