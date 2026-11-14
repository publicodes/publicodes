> 🇬🇧 Most of the documentation (including issues and commit messages) is written in French, please raise an [issue](https://github.com/publicodes/publicodes/issues/new) if you are interested and do not speak French. We intend to translate the language and the documentation in the coming weeks.

## Publicodes

[![Npm version](https://img.shields.io/npm/v/publicodes)](https://www.npmjs.com/package/publicodes)
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
npm install publicodes
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
- **[conventions-collectives](https://www.npmjs.com/package/conventions-collectives)** est un paquet npm qui utilise publicodes
  pour spécifier les conventions collectives françaises (salaires minimaux, cotisations conventionnelles),
  en règles versionnées qui étendent `modele-social`.
- **[futur.eco](https://futur.eco/)** utilise publicodes pour calculer les bilans
  carbone d'un grand nombre d'activités, plats, transports ou biens.
