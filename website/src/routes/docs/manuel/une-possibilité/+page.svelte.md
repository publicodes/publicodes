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

Les possibilités peuvent être :

-   **des constantes** : chaines de caractères (comme dans l'exemple ci-dessus) ou nombres (avec ou sans unité)
-   **des références** à des règles

## Nombres

Cette écriture permet de circonscrire les valeurs possibles pour une propriété à une liste de nombres, tout en gardant la possibilité de les manipuler dans des calculs.

```publicodes selectedRuleInDoc="nombre de joueurs"
nombre de joueurs:
  une possibilité:
    - 2 joueurs
    - 4 joueurs
  par défaut: 2


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

## Références

On peut utiliser des références à des règles dans les possibilités.

```publicodes selectedRuleInDoc="contrat"
contrat:
  une possibilité:
    - CDI
    - CDD
  avec:
    CDI:
      titre: Contrat à durée indéterminée (CDI)
    CDD:
      titre: Contrat à durée déterminée (CDD)
```

Dans ce cas, la valeur possible est **le nom de la règle** et non sa valeur. Dans l'exemple ci-dessus, la propriété `contrat` peut prendre les valeurs `'CDI'` ou `'CDD'`.

<Callout type="warning" title="Attention aux doubles quotes">

Pour selectionner une possibilité, il faut entourer le nom de la règle de doubles quotes (`"'<ma règle>'"`). Sinon, c'est la valeur de la règle qui sera utilisée.

```publicodes title="Double quotes" selectedRuleInDoc="contrat"
contrat:
  par défaut: "'CDI'" # ✅ Faire attention aux doubles quotes ici
  une possibilité:
    - CDI
    - CDD
  avec:
    CDI:
    CDD:
```

De même en JavaScript :

```ts
engine.setSituation({ contrat: "'CDI'" });
// ✅ OK

engine.setSituation({ contrat: 'CDI' });
// ❌ Incorrect, fait référence à la valeur de la règle "CDI" (qui est non définie)
```

</Callout>

### Créer des règles directement dans les possibilités

Il est possible de définir des règles directement dans les possibilités. Cela permet de définir des métadonnées ou des conditions d'applicabilité pour chaque possibilité sans avoir à utiliser la notation `avec`.

```publicodes selectedRuleInDoc="contrat"
contrat:
  une possibilité:
    - CDI:
        titre: Contrat à durée indéterminée (CDI)
    - CDD:
        titre: Contrat à durée déterminée (CDD)
```

### Métadonnées

En utilisant des références à une règle plutôt que des constantes, vous pouvez ajouter des métadonnées à chaque possibilité, comme une `description` ou un `titre`.

### Condition

Il est possible de définir des conditions d'applicabilité pour chaque possibilité. Cela permet de restreindre les possibilités en fonction de la situation.

```publicodes title="Possibilité non applicable" selectedRuleInDoc="contrat"
contrat:
  une possibilité:
    - CDI:
    - CDD:
    - CDD chantier:
        applicable si: entreprise BTP
  avec:
    entreprise BTP: non
```

Si une seule possibilité est applicable, alors elle sera automatiquement sélectionnée. Si aucune possibilité n'est applicable, alors la règle sera non applicable.

```publicodes title="Une seule possibilité applicable" selectedRuleInDoc="imposition"
imposition:
  une possibilité:
    - IR: # automatiquement sélectionné
    - IS:
        non applicable si: auto-entrepreneur
  avec:
    auto-entrepreneur: oui
```

## Utilisation en JavaScript

Les possibilités sont accessible via la fonction [`engine.getPossibilitiesFor`](/docs/api/publicodes/classes/Engine#getpossibilitiesfor).

```typescript
const possibilities: Array<Possibilities> | null =
    engine.getPossibilitiesFor('contrat');
```

Pour lever une erreur à l'évaluation si une valeur n'est pas dans la liste des possibilités, on peut passer le paramètre `checkPossibleValues` à `true` (voir [l'api Engine](/docs/api/publicodes/classes/Engine)).

```typescript
const rules = new Engine(rules, {
    strictOptions: { checkPossibleValues: true }
});
```

## Limitations

-   **Remplacements** : La fonctionalité `remplace` est inopérante à l'intérieur de `une possibilité`. Autrement dit, si vous remplacez une règle listée dans une possibilité, ce sera la règle originale qui apparaitra dans `getPossibilitiesFor`.

-   **Pas de vérification de type statique** : Les erreurs de type (comme des comparaisons avec une valeur non listée dans les possibilités) ne sont pas détectées. En revanche les erreurs d'affectation peuvent être détectée dynamiquement en utilisant le paramètre `checkPossibleValues` (voir ci-dessus).
