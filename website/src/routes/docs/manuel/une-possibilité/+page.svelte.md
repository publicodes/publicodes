---
sidebar_position: 3
title: Une possibilité (enum)
---

Il est possible de limiter les valeurs possibles pour une propriété avec la notation `une possibilité`.

```publicodes
couleur:
  une possibilité:
    - "'coeur'"
    - "'carreau'"
    - "'pique'"
    - "'trèfle'"
```

## Type de possibilités acceptées

Les possibilités peuvent être :

-   **des constantes** : chaines de caractères (comme dans l'exemple ci-dessus) ou nombres (avec ou sans unité)
-   **des références** à des règles
-   **des définitions** de règles

### Nombres

Cette écriture permet de circonscrire les valeurs possibles pour une propriété à une liste de nombres, tout en gardant la possibilité de les manipuler dans des calculs.

```publicodes
nombre de joueurs:
  une possibilité:
    - 2 joueurs
    - 4 joueurs

nombre de points en jeu: nombre de joueurs * 10 points/joueurs

```

A noter, les unités sont optionnelles dans les possibilités de nombres. Si elles sont présentes, elles doivent être cohérentes entre elles.

<Callout type="warning" title="Expressions non supportées">
Les expressions calculées ne sont pas acceptées dans les possibilités.
Ainsi, il n'est **pas possible** d'écrire :
```publicodes
salaire: 
  une possibilité: 
    - 80 % * SMIC
    - SMIC
```
</Callout>

### Références

On peut utiliser des références à des règles dans les possibilités.

```publicodes
contrat:
  une possibilité:
    - CDI
    - CDD
  avec:
    CDI:
      description: |
        Contrat à durée indéterminée. C'est la forme de contrat par défaut dans le droit du travail français.
    CDD:
      description: |
        Contrat à durée déterminée. Il est utilisé pour des missions ponctuelles ou pour remplacer un salarié absent.
```

Dans ce cas, la valeur possible est **le nom de la règle** et non sa valeur.

Cela permet d'ajouter des métadonnées au choix, comme une description ou des conditions. Ces métadonnées pourront être utilisées dans les interfaces pour afficher des informations supplémentaires.

Dans l'exemple ci-dessus, la propriété `contrat` peut prendre les valeurs `'CDI'` ou `'CDD'`.

### Définition de règles

Enfin, il est possible de définir des règles directement dans les possibilités.

Dans ce cas, la valeur de la règle enfant est un booléen qui indique si la règle est activée ou non. Cela permet de profiter de la [désactivation de branche](/docs/manuel/principes-de-base#d%C3%A9sactivation-de-branche)
pour une option en fonction de la valeur choisie pour la règle parente.

```publicodes
transport:
  titre: Quel est le transport utilisé ?
  une possibilité:
    - voiture:
    - vélo:

transport . voiture . kilométrage:
      question: Quelle distance parcourez-vous par an ?
      par défaut: 15000 km/an

transport . voiture. émissions: kilométrage * 0.193kcO2e/km

transport . vélo. émissions: 0 kgCO2e/an

transport . émissions:
  somme:
    - transport . voiture . émissions
    - transport . vélo . émissions
```

> Dans cet exemple, la propriété `transport` peut prendre les valeurs `'voiture'` ou `'vélo'`. Si la valeur `'vélo'` est choisie, la propriété `transport . vélo` vaut `oui` et la propriété `transport . voiture` vaut `non`. Cela permet de désactiver la branche `voiture` et de ne pas calculer les émissions de CO2 liées à la voiture.

<Callout type="info">
  Si la règle parente est `non définie` (pas de valeur par défaut), toutes les règles définies dans les possibilités valent `non` (désactivées).
</Callout>

A noter que comme pour les références, les valeurs possibles sont les noms des règles enfants.

### Combinaison

Lorsque les possibilités ne sont pas des nombres, on peut mélanger les types :

```publicodes
contrat:
  une possibilité:
    - "'Intérim'" # Constante
    - CDI # reference
    - CDD: # Définition de règle
        description: |
          Contrat à durée indéterminée.
  avec:
    CDI:
      description: |
        Contrat à durée indéterminée. C'est la forme de contrat par défaut dans le droit du travail français.
      # Attention, pour avoir le même comportement que pour les règles directement définies dans `une possibilités`, il faut ajouter la condition suivante :
      toutes ces conditions:
        - est défini: contrat
        - contrat = 'CDI'
```
