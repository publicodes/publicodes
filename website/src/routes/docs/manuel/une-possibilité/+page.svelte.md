---
sidebar_position: 3
title: Une possibilité (enum)
---

# `une possibilité`

Il est possible de limiter les valeurs possibles pour une règle avec la notation `une possibilité`.

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

### Nombres

Cette écriture permet de circonscrire les valeurs possibles pour une propriété à une liste de nombres, tout en gardant la possibilité de les manipuler dans des calculs.

```publicodes
nombre de joueurs:
  une possibilité:
    - 2 joueurs
    - 4 joueurs

nombre de points en jeu: nombre de joueurs * 10 points/joueurs

```

A noter, les unités sont optionnelles dans les possibilités de nombres. Si elles sont présentes, elles doivent être cohérentes entre elles (càd. elles doivent toutes être simplifiable en une même unité).

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

Dans ce cas, la valeur possible est **le nom de la règle** et non sa valeur. Dans l'exemple ci-dessus, la propriété `contrat` peut prendre les valeurs `'CDI'` ou `'CDD'`.

<Callout type="warning" title="Attention aux doubles quotes en JS">

En JavaScript, Pour faire référence au nom de la règle et non à sa valeur, il faut entourer le nom de la règle de doubles quotes (`"<ma règle>"`). Sinon, c'est la valeur de la règle qui sera utilisée.

```typescript
engine.setSituation({ contrat: "'CDI'" }); // ✅ OK

engine.setSituation({ contrat: 'CDI' }); // ❌ Incorrect, fait référence à la valeur de la règle "CDI" (qui n'existe pas)
```

</Callout>

#### Référence à des règles inexistantes

Si une référence n'a pas de règle associée, cette dernière sera automatiquement créée comme une règle vide.

```publicodes
contrat:
  une possibilité:
    - CDI
    - CDD

# Équivaut à :

# contrat:
#  une possibilité:
#    - CDI
#    - CDD
#  avec:
#    CDI:
#    CDD:
```

### Métadonnées et conditions

En utilisant des références à une règle plutôt que des constantes, vous pouvez ajouter des métadonnées à chaque possibilité, comme une description. Ces métadonnées peuvent être utilisées pour afficher des informations supplémentaire dans l'interface utilisateur.

L'autre avantage, c'est de pouvoir ajouter des conditions d'applicabilité pour désactiver certaines valeurs en fonction de la situation.

```publicodes
contrat:
  une possibilité:
    - CDI
    - CDD
    - CDD chantier
  avec:
    CDD chantier:
      applicable si: entreprise BTP
```

## Utilisation en JavaScript

La liste des possibilités est disponible dans la propriété `possibleValues` de la règle parente.

```typescript
const contrat = engine.getRule('contrat');
const possibleValues: ASTNode[] | undefined = contrat.possibleValues;
```

Pour lever une erreur si la valeur n'est pas dans la liste des possibilités, on peut passer le paramètre `checkPossibleValues` à `true` (voir [l'api Engine](/docs/api/publicodes/classes/Engine)).

```typescript
const rules = new Engine(rules, { strictOptions: { checkPossibleValues: true } });
```
