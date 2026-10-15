---
title: 'Publicodes 2 - Amélioration des remplacements'
description: 'Présentation des améliorations du comportement des remplacements implémentées lors du premier hackathon Publicodes de Calinou.'
author: Willow Barraco et Emile Rolley
date: 2026-09-24
tags: nouveautés, langage, V2
icon: 🌱
featured: true
image: /og-images/v2-amelioration-remplacements.png
---

Cet été s'est déroulé le premier hackathon Publicodes de
[Calinou](https://calinou.coop). Ce fut l'occasion de nous retrouver pour
avancer toustes ensemble sur la refonte de Publicodes.

Le chantier de [Publicodes 2](https://publi.codes/blog/publicodes-v2) a été
initié il y a maintenant plus d'un an. En parallèle de leurs travaux externes,
Johan et Emile ont mis en place le projet, remis à plat, re-designé, et
implémenté les différentes fonctionnalités. Willow a rejoint l'équipe et
travaille majoritairement sur Publicodes depuis mars, et Clément, de son côté
est resté à distance de ce projet de refonte. Ce hackathon a donc été l'occasion
parfaite pour remettre en commun notre connaissance sur la nouvelle base de
code, et initier de gros chantiers qui demandaient de faire des choix de design
importants. Les plus crucials étant la refonte de la documentation autogénérée,
et la clarification de la spécification du mécanisme `remplace`.

Nous avons donc formé deux équipes :

1. Emile et Johan ont travaillé sur la refonte de la documentation.
2. De leur côté, Willow a mentoré Clément pour re-designer et améliorer le
   mécanisme `remplace`.

Dans ce premier article, nous revenons sur ce dernier point. Un second,
reviendra sur les enjeux techniques levés pour la refonte de la documentation.

## Rappel

Le [remplacement](https://publi.codes/docs/manuel/principe-de-base#remplacement)
est un concept central de Publicodes qui permet de facilement modéliser des
algorithmes issues de textes législatifs. En effet, le mécanisme `remplace`
permet de substituer les référence d'une règle par une autre en fonction du
contexte courant.

Par exemple, avec le modèle suivant :

```yaml
# Nous reprenons ici un exemple issu du tutoriel de Catala. Un langage dédié à
# la modélisation de texte législatif basé sur la logique par défaut.

impôt sur le revenu:
    description: |
        Article 1 - l’impôt sur le revenu d’un individu est calculé en tant qu’un
        pourcentage fixe sur les revenus d’une personne pour une année.
    valeur: personne . revenu * pourcentage fixe
    unité: €/an

pourcentage fixe:
    titre: Taux d'imposition
    description: Article 2 - le pourcentage fixe mentionné à l’article 1 est égal à 20%.
    valeur: 20%

pourcentage fixe . si deux enfants:
    titre: Taux d'imposition pour les familles nombreuses
    description: |
        Article 3 - si l’individu a à sa charge deux ou plus enfants, alors le
        pourcentage fixe mentionné à l’article 1 vaut 15 %.
    applicable si: personne . nombre d'enfants >= 2
    remplace: pourcentage fixe
    valeur: 15%
```

Pour le contexte `{ "personne . nombre d'enfants": 3 }`, la règle `pourcentage
fixe . si deux enfants` est applicable et sa valeur _remplace_ celle de
`pourcentage fixe` dans le calcul de `impôt sur le revenu`. C'est à dire, que la
valeur de l'impôt sur le revenu n'est plus 20% des revenus mais 15%.

Cela se complique lorsque plusieurs règles qui remplace la même référence sont
applicable en même temps. Par exemple, en ajoutant une nouvelle exception :

```yaml
pourcentage fixe . exonération 1ère tranche:
    description: >
        Article 4 - les personnes gagnant moins de 10 000 € sont exonérés de l’impôt
        sur le revenu.
    applicable si: personne . revenu <= 10000 €
    remplace: pourcentage fixe
    valeur: 0%
```

Pour le contexte :

```json
{
    "personne . nombre d'enfants": 3,
    "personne . revenu": 8000
}
```

Les règles `pourcentage fixe . si deux enfants` et `pourcentage fixe .
exonération 1ère tranche` sont toutes les deux applicables : **comment
déterminer quelle valeure choisir pour remplacer la référence à** `pourcentage
fixe`** ?**

## Le _statut quo_

Dans Publicodes v1, un tri alphabétique sur les noms des
règles applicable est effectué implicitement. Il est également possible de
spécifier un niveau de priorité avec `priorité: <nombre>`.

Malheureusement, le tri lexicographique est source d'erreurs, et devoir préciser
un nombre pour la priorité alourdie la syntaxe tout en complexifiant la
maintenance des modèle : il faut connaître toutes les priorités de toutes les
règles qui peuvent remplacer une même règle. Cela va à l'encontre du besoin de
pouvoir suivre la forme des textes de lois où les définitions et exceptions au
cas de base sont éparpillées à différents endroits.

D'autant plus que dans certains cas, les conditions d'applicabilités sont
mutuellement exclusives. C'est-à-dire que l'on sait que deux règles remplaçant
une même règle ne pourront (et devrons) pas pouvoir être applicable
simultanément. Il ne devrait donc pas être nécessaire de définir une priorité
dans ce cas là.

En comparant la sémantique de
[Catala](https://book.catala-lang.org/fr/2-2-conditionals-exceptions.html) et de
Publicodes, nous avons pu distinguer deux cas d'utilisations des remplacements :

1. **Définitions conditionnelles d'une même règles** : une seule définition peut
   être applicable à la fois, il n'y donc pas besoin de définir un ordre de
   priorité.
2. **Une chaîne d'exception** : plusieurs exceptions peuvent être applicable
   simultanément pour une même règle.

### Exemple d'une définition conditionnelle

En prenant un exemple tiré du
[`modele-social`](https://github.com/betagouv/mon-entreprise/tree/master/modele-social)
de Mon-entreprise, on peut très clairement voir un cas de remplacements
mutuellement exclusifs :

```yaml
 neutre d'impôt sur le revenu . barème Guadeloupe Réunion Martinique:
  applicable si:
    une de ces conditions:
      - département = 'Guadeloupe'
      - département = 'Martinique'
      - département = 'La Réunion'
  remplace: taux neutre d'impôt sur le revenu
  valeur: # ...

impôt . taux neutre d'impôt sur le revenu . barème Guyane Mayotte:
  applicable si:
    une de ces conditions:
      - département = 'Guyane'
      - département = 'Mayotte'
  remplace: taux neutre d'impôt sur le revenu
  valeur: # ...
```

L'[Article 204 H du code des
impôts](https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000042907548)
défini un taux d'imposition différencié pour les contribuables domicilié·es en
Guadeloupe, à La Réunion et en Martinique par rapport aux domicilié·es en Guyane
et à Mayotte. Ces deux règles ne peuvent être applicable simultanément,
puisqu'il est impossible d'être domicilié à deux endroits différents. Ce sont
bien deux définitions conditionnelles du taux neutre de l'impôt sur le revenu.

## Les changements introduits

Avec cette distinction faite, il était donc possible d'alléger la syntaxe, tout
en rendant plus prédictible l'ordre de priorité des `remplace`.

### Pour les définitions conditionnelles

Pour gérer les cas de définitions conditionnelles, nous avons choisi une
approche déclarative. Elle pourra être complétée à l'avenir par une vérification
statique plus ou moins partielle.

En ajoutant `exclusif: oui`, on permet à une règle de pouvoir être la cible de
plusieurs remplaces différents à partir du moment où ces règles ne peuvent être
applicable simultanément.

On peut donc réécrire l'exemple du `modele-social` :

```yaml
 neutre d'impôt sur le revenu . barème Guadeloupe Réunion Martinique:
  applicable si: # ...
  remplace:
    références à: taux neutre d'impôt sur le revenu
    exclusif: oui
  valeur: # ...

impôt . taux neutre d'impôt sur le revenu . barème Guyane Mayotte:
  applicable si: # ...
  remplace:
    références à: taux neutre d'impôt sur le revenu
    exclusif: oui
  valeur: # ...
```

<Callout type="info" title="Vérification manuelle">

Il est important de comprendre le caractère exclusif des conditions
d'applicabilités est défini par l'expertise métier et nécessite une relecture
pour s'en assurer.

Si une erreur de modélisation est introduite une erreur sera levée au moment de
l'exécution indiquant que plusieurs règles sensées être exclusives sont
applicable simultanément.

</Callout>

### Pour les chaines d'exceptions

Il est à présent **impossible que deux règles puissent remplacer une même règle
sans avoir `exclusif: oui`**.

Nous avons choisi de supprimer l'attribut `priorité` pour forcer la définition
explicite des chaînes d'exceptions.

Concrètement, au lieu de :

```yaml
cas de base:

exception 1:
    remplace: cas de base
    priorité: 2

exception 2:
    remplace: cas de base
    priorité: 1
```

On a :

```yaml
cas de base:

exception 1:
    remplace: cas de base

exception 2:
    remplace: exception 1
```

Ainsi, **rajouter une nouvelle exception nécessite plus que de modifier au
maximum deux règles**. C'est l'exception applicable la plus loins dans la
_chaine_ qui sera utilisée (ici `exception 2`).

On peut donc corriger notre exemple de calcul impôt en explicitant un ordre de
priorité entre nos deux exceptions du calcul du pourcentage fixe :

```yaml
pourcentage fixe . si deux enfants:
    titre: Taux d'imposition pour les familles nombreuses
    applicable si: personne . nombre d'enfants >= 2
    remplace: pourcentage fixe
    valeur: 15%

pourcentage fixe . exonération 1ère tranche:
    description: >
        Article 4 - les personnes gagnant moins de 10 000 € sont exonérés de
        l’impôt sur le revenu.
    applicable si: personne . revenu <= 10000 €
    remplace: pourcentage fixe . si deux enfants
    valeur: 0%
```

Ainsi pour le contexte :

```json
{
    "personne . nombre d'enfants": 3,
    "personne . revenu": 8000
}
```

On obtient bien un pourcentage fixe nul car c'est la règle pourcentage `fixe .
exonération 1ère tranche` qui est la dernière exception applicable en bout de
chaine.

## Conclusion

Avec la clarification des cas d'usages des remplacements, nous avons pu aboutir
à une solution facilitant la maintenance des modèles Publicodes en forçant à
clarifier si une règle est une définition conditionnelle ou une exception à un
cas de base. Le tout complété par une vérification statique à la compilation (un
article à ce sujet sortira bientôt), permet de facilement repérer les
incohérences de modélisation avant la mise en production.

C'est finalement la première fois que Clément et Willow ont eu l'occasion de
travailler ensemble sur un même chantier. Le premier a assez vite pris en main
le langage OCaml, et les deux ont atteint leurs buts avant même la fin du
hackathon.

Ces changements seront disponibles dès la première version alpha de Publicodes 2.
