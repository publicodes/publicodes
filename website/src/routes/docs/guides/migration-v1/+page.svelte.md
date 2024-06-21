---
sidebar_position: 5
title: Migrer vers la version 1.0
hide_table_of_contents: false
---

## Version 1.0

La version 1.0 de publicodes est une version majeure qui apporte des changements importants dans la syntaxe des règles.
Voir le [changelog](https://github.com/publicodes/publicodes/blob/master/CHANGELOG.md) pour plus de détails.

## Codemod pour migrer automatiquement votre base de règle

Vous pouvez utiliser le package `@publicodes/codemod` pour migrer vos règles vers la nouvelle syntaxe de la version 1.0.

Ce codemod effectue les modifications suivantes :

-   Supprime les mécanismes `nom` pour les remplacer par `avec`
-   Transforme les `composantes` en `somme`
-   Change la syntaxe du mécanisme `produit` (qui accepte une liste de valeurs, comme `somme`, dorénavant)
-   Transforme les `unités` et retire les espaces entre la barre oblique
-   Supprime le mot clé inutile `avec` dans `inversion numérique`
-   Remplace `recalcul` par `contexte`
-   Uniformisation des saut de lignes dans la déclaration de règles avec `avec`
-   Simplifie l'écriture lorsque la clé `valeur` est utilisée sans autre mécanisme chainé

### Utilisation

```bash npm2yarn
npx @publicodes/codemod <path>
```

`path` is the path to the folder containing the `yaml` files of the rules you want to migrate.

## Autres changements manuels

1. Le paquet `@publicodes/api` a été renommé en `@publicodes/rest-api`
1. Le paquet `@publicodes/react` a été renommé en `@publicodes/react-ui`
1. Le codemod ne mettra pas à jour la syntaxe exotique des variations (très peu utilisée). Si vous l'utilisez, vous devriez mettre à jour la syntaxe manuellement **avant** d'exécuter le codemod.
1. Les remplacements sont appliqués avec un ordre de priorité différent, ce qui peut aboutir a des évaluations différente pour une même situation. Si vous utilisez des remplacements, faites tourner vos tests pour vérifier que les résultats sont toujours les mêmes après la migration.
1. Vous devrez mettre à jour manuellement les appels à `evaluate` contenant une expression publicodes dont la syntaxe a changé (notamment `unité`, qui n'accepte plus d'espace entre `/`).
