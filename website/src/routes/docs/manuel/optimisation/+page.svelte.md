---
sidebar_position: 4
title: Optimisations
hide_table_of_contents: false
---

## _Constant folding_

<Callout type="warning">

Cette optimisation est encore expérimentale et contient encore des bugs mais
également une marge d'amélioration importante. N'hésitez pas à nous faire des
retours sur les problèmes rencontrés sur le dépôt
[`@publicodes/tools`](https://github.com/publicodes/tools/issues).

</Callout>

### Motivation

Les modèles de calculs écrits en Publicodes sont par
[_design_](/blog/standard-modeles-ouverts#document%C3%A9s-sourc%C3%A9s)
implémentés pour être le plus transparent et intelligible possible pour le plus
grand nombre.
Cela implique de détailler au maximum les calculs, ce qui peut conduire à une
complexité importante des modèles. Cependant, cette complexité n'est justifiée
que pour la [documentation](https://publi.codes/docs/api/react-ui/) et non pour le calcul en lui-même.

Par exemple, considérons les règles suivantes :

```yaml title="nosgestesclimat/data/alimentation/déchets.publicodes"
alimentation . déchets . gestes . bonus compostage biodéchets:
    formule:
        somme:
            - omr . putrescibles . réduction compost
            - (-1) * omr . putrescibles . compostés
    unité: kgCO2e

alimentation . déchets . omr . putrescibles . réduction compost:
    formule: omr . putrescibles * (gisement réduction / quantité réelle)
    unité: kgCO2e
```

La règle `alimentation . déchets . omr . putrescibles . réduction compost`
dépends de 18 autres règles pour être calculée. Cependant, la valeur ne dépend
pas de l'utilisateur·ice et pourrait être calculée à l'avance (c'est une constante).
C'est l'objectif de l'optimisation par [_constant
folding_](https://en.wikipedia.org/wiki/Constant_folding) : **calculer toutes les
valeurs qui ne dépendent pas de l'utilisateur à l'avance et remplacer les règles
directement par leur valeur**.

Ainsi, après optimisation on obtient :

```yaml
alimentation . déchets . gestes . bonus compostage biodéchets:
    formule:
        somme:
            - 11.505999999999998
            - (-0.4949999999999999)
```

### Usage

<Callout type="tip" >

An API documentation is available in English [here](https://publicodes.github.io/tools/modules/optims.html).

</Callout>

L'optimisation par _constant folding_ est disponible dans le module
`@publicodes/tools/optims` via la fonction
[`constantFolding`](https://publicodes.github.io/tools/functions/optims.constantFolding.html)
qui prend en paramètre :

-   un moteur Publicodes (instancié avec le jeu de règles à optimiser)
-   un prédicat qui prend en paramètre un couple `(nom de la règle, noeud de la
règle)` et retourne `true` si la règle doit être conservée après optimisation
-   un objet de paramètres :
    -   `isFoldedAttr` : le nom de l'attribut à utiliser pour marquer une règle
        comme optimisée (par défaut `optimized`)

#### Exemple

```typescript
import Engine from 'publicodes';
import { constantFolding } from '@publicodes/tools/optims';

const optimizedRules = constantFolding(
    // A publicode engine instantiated with the rules to optimize.
    new Engine(baseRules),
    {
        // A predicate returning true if the rule needs to be kept.
        toKeep: (rule) => {
            return (
                ['root', 'root . bis'].includes(rule.dottedName) ||
                !!rule.rawNode['to keep']
            );
        }
    }
);
```

<Callout type="info" >

[Nos Gestes Climat](https://nosgestesclimat.fr) utilise cette optimisation pour
réduire le temps d'instanciation du moteur dans le client :

-   voir le [code
    source](https://github.com/incubateur-ademe/nosgestesclimat/blob/59b02d4576851bd4d7688a52ea3f54e6a0156840/scripts/modelOptim.mjs#L12-L45)
-   voir la [PR](https://github.com/incubateur-ademe/nosgestesclimat/pull/1697)
    qui a permis de réduire le temps d'instanciation et d'évaluation de plus de
    50%.

</Callout>
