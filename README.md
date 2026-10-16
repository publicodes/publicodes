> 🇬🇧 Most of the documentation (including issues and commit messages) is written in French, please raise an [issue](https://github.com/publicodes/publicodes/issues/new) if you are interested and do not speak French. We intend to translate the language and the documentation in the coming weeks.

## Publicodes (1.O)

La branche `1.x` sert de maintenance pour Publicode 1.0.

## Publicodes (2.O)

[![Npm version](https://img.shields.io/npm/v/publicodes)](https://www.npmjs.com/package/publicodes/cli)
[![Matrix](https://img.shields.io/matrix/publicodes%3Amatrix.org)](https://app.element.io/#/room/#publicodes:matrix.org)

Publicodes est un langage déclaratif pour encoder les algorithmes d'intérêt
public. Il permet de réaliser des calculs généraux tout en fournissant une
explication permettant de comprendre et de documenter ces calculs.

Publicodes est adapté pour modéliser des domaines métiers complexes pouvant être
décomposés en règles élémentaires simples (comme la [législation socio-fiscale](https://github.com/betagouv/mon-entreprise/tree/master/modele-social/règles),
[un bilan carbone](https://github.com/laem/futureco-data/blob/master/co2.yaml),
un estimateur de rendement locatif, etc.).

Il permet de générer facilement des simulateurs web interactifs où l'on peut affiner
progressivement le résultat affiché, et d'exposer une documentation du calcul explorable.

## Installation

```
npm add @publicodes/cli
```

## Documentation

- [Se lancer](https://publi.codes/docs/tutoriel)
- [Principes de base](https://publi.codes/docs/manuel/principe-de-base)
- [Bac à sable](https://publi.codes/studio)

## Projets phares

- **[mon-entreprise.fr](https://mon-entreprise.urssaf.fr/simulateurs)** utilise publicodes
  pour spécifier l'ensemble des calculs relatifs à la législation socio-fiscale
  en France. Le site permet entre autre de simuler une fiche de paie complète,
  de calculer les cotisations sociales pour un indépendant ou encore connaître
  le montant du chômage partiel.
- **[Nos Gestes Climat](https://nosgestesclimat.fr)** utilise publicodes pour proposer un calculateur d'empreinte climat personnel de référence complètement ouvert
- **[Code du travail numérique](https://code.travail.gouv.fr)** utilise publicodes pour des simulateur d'indemnité de licenciement et de durée de préavis de retraite.
- **[futur.eco](https://futur.eco/)** utilise publicodes pour calculer les bilans
  carbone d'un grand nombre d'activités, plats, transports ou biens.
