---
title: 'Comparaison des langages Publicodes, Catala et OpenFisca'
description: 'Une comparaison des langages de modélisation utilisés dans l’administration française'
author: 'Emile Rolley'
date: '2024-09-05'
tags: 'modelisation, open-data, rules-as-code'
icon: '🏛️'
featured: true
---

## Introduction

En tant que contributeur à [Publicodes](https://publi.codes) et
[Catala](https://catala-lang.org/fr), je suis régulièrement amené à expliquer
les différences entre ces deux langages et également avec
[OpenFisca](https://openfisca.org/fr). En effet, ces trois langages ont des
points communs, et sont utilisés dans les administrations françaises autour des
préstations sociales et des impôts. **Tous partage la volonté d'une meilleure
transparence des programmes publics**. On les retrouve ainsi par côte à côte
dans [la page dédiée à l'explicabilité](https://code.gouv.fr/fr/explicabilite/)
de la DINUM. Cependant, **des approches et philosophies différentes les différencient**.

C'est pourquoi j'ai décidé de synthétiser ces explications dans cet article.

### En bref

[**Publicodes**](https://publi.codes) permet de rapidement créer un
simulateur web pour toutes sorte de domaines, en utilisant un langage de
description de règles simple lisible par des non-développeureuses.

[**Catala**](https://catala-lang.org/fr) est un DSL spécialement conçu pour
l'implémentation d'algorithmes issus directement de textes juridiques. Avec
des fondations solides en théorie des langages et méthodes formelles, il
permet de garantir la validité des calculs. Les programmes Catala peuvent
être compilés dans n'importe quel langages
et ainsi être intégrés dans des applications web ou bien utilisés pour la
liquidation.

[**OpenFisca**](https://openfisca.org/fr) permet de simuler l'impact de
réformes socio-fiscales, en utilisant le langage Python.

| Fonctionnalité    | Publicodes      | Catala                  | OpenFisca           |
| :---------------- | :-------------- | :---------------------- | :------------------ |
| **Syntaxe**       | YAML            | DSL                     | Python              |
| **Typage**        | Dynamique       | Statique                | Dynamique           |
| **Exécution**     | Interprété (JS) | Compilé                 | Interprété (Python) |
| **Langage cible** | JavaScript      | C, Python, JS, OCaml, R | Python              |
| **Garanties**     | Aucune          | Preuves d'exactitude    | Aucune              |

## Historique

### OpenFisca

D'un point de vue historique, OpenFisca **est le plus ancien des trois**. Sont
développement a commencé en 2011 au sein du [Centre d'analyse
stratégique](https://www.strategie.gouv.fr/), ce sera ensuite
[Etalab](https://www.etalab.gouv.fr/) au sein de la DINUM qui portera le projet
. En 2014, la plateforme [mes-aides](https://mes-aides.gouv.fr) est lancée au
sein du programme [Beta.gouv](https://beta.gouv.fr/), permettant de simuler
l'éligibilité à une trentaine de prestations sociales, en utilisant OpenFisca
comme moteur de calcul et devient. Puis en 2019, c'est l'Assemblée Nationale
qui l'utilise pour créer [LexImpact](https://www.leximpact.fr/) afin de
faciliter le chiffrage et l'évaluation de l'impact de réformes fiscales.
Depuis, OpenFisca a également été déployé [à
l'international](https://openfisca.org/fr/packages/).

Actuellement, OpenFisca est gouverné de façon collective par la communauté avec
une équipe principale de mainteneurs financés par des acteurs publics français.

### Publicodes

Publicodes a vu le jour au sein de [Beta.gouv](https://beta.gouv.fr/) en 2019.
Initialement conçu par [Maël Thomas](https://kont.me/) pour modéliser et
calculer les cotisations sociales et les rendre accessible via la plateforme
[mon-entreprise.fr](https://mon-entreprise.fr). Il a ensuite été publié
séparément et **utilisé dans d'autres domaines**, notamment au calcul de
l'empreinte carbone individuelle avec
[nosgestesclimat.fr](https://nosgestesclimat.fr).

Publicodes est un projet open-source, initialement maintenu par les
développeurs des projets au sein de [Beta.gouv](https://beta.gouv.fr/) qui
l'utilisent. Il est aujourd'hui, comme OpenFisca, gouverné de façon collective
par la communauté avec une **équipe de mainteneurs bénévoles**.

### Catala

Catala est le plus récent des trois. Il a été initié en 2020 par [Denis
Merigoux](https://merigoux.fr) lors de [sa
thèse](https://theses.hal.science/tel-03622012) au sein de l'équipe
[PROSECO](https://team.inria.fr/prosecco/) de l'[Inria
Paris](https://www.inria.fr/fr/centre-inria-de-paris). Partant du constat que
les programmes informatiques permettant de calculer les prestations sociales ou
l'impôt doivent être considérés comme des programmes critiques, il a essayé d'utiliser
l'état de l'art en théorie des langages et méthodes formelles pour garantir la
fiabilité des calculs. Cela a donné naissance à [Catala](https://catala-lang.fr),
un DSL spécialement conçu pour l'implémentation d'algorithmes issus directement
de textes juridiques.

Catala est un projet open-source, activement développé par une équipe
internationale et pluridisciplinaire de chercheureuses et développeurs.

## Fonctionnalités

### Syntaxe

### Exécution

### Garanties

### Explicabilité

## Conclusion
