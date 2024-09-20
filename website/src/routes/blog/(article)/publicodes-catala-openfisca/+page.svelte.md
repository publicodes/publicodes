---
title: 'Comparaison des langages Publicodes, Catala et OpenFisca'
description: 'Une comparaison des langages utilisés dans l’administration française pour modéliser le droit.'
author: 'Emile Rolley'
date: '2025-01-03'
tags: 'modelisation, open-data, rules-as-code'
icon: '🏛️'
featured: true
---

## Introduction

En tant que contributeur à [Publicodes](https://publi.codes) et
[Catala](https://catala-lang.org/fr), je suis régulièrement amené à expliquer
les différences entre ces deux langages et également avec
[OpenFisca](https://openfisca.org/fr). En effet, ces trois langages ont des
points communs, et sont utilisés dans les administrations françaises autour de
la modélisation du calcul prestations sociales et des impôts. **Tous partage la
volonté d'une meilleure transparence des programmes publics**. On les retrouve
ainsi présentés côte à côte dans [la page dédiée à
l'explicabilité](https://code.gouv.fr/fr/explicabilite/) de la DINUM. Cependant,
ces trois langages ont **des approches et philosophies différentes** et ne sont
pas **adaptés selon moi aux mêmes usages**.

C'est pourquoi j'ai décidé de synthétiser une présentation comparative de ces
trois langages. _Cette présentation, bien que validée par des membres des trois
communautés, n'engage que moi et ne prétend pas être exhaustive_.

### En bref

[**OpenFisca**](https://openfisca.org/fr) est un _framework_ Python spécialement
conçu pour modéliser la législation socio-fiscale d'un pays et de simuler
l'impact de réformes à différentes échelles pour une population donnée.

[**Publicodes**](https://publi.codes) est un langage conçu pour rapidement
modéliser un domaine métier en le décomposant en règle élémentaire lisible et
modifiable par des expert⋅es métiers. Les programmes Publicodes sont interprétés
en JavaScript et permettent de facilement créer un simulateur web avec une
documentation interactive du calcul.

[**Catala**](https://catala-lang.org/fr) est un langage dédié à l'implémentation
d'algorithmes issus de textes juridiques en formant des binômes
juriste-développeureuses. Avec des fondations solides en théorie des langages et
méthodes formelles, il permet de garantir la validité des calculs. Les
programmes Catala peuvent être compilés dans n'importe quel langages et ainsi
être intégrés dans des applications web ou bien utilisés pour la liquidation.

<details>
    <summary>Tableau comparatif</summary>

| Fonctionnalité            | Publicodes        | Catala                  | OpenFisca           |
| :------------------------ | :---------------- | :---------------------- | :------------------ |
| **Syntaxe**               | YAML/DSL          | DSL                     | Python/EDSL         |
| **Typage**                | Dynamique         | Statique                | Dynamique           |
| **Exécution**             | Interprété (JS)   | Compilé                 | Interprété (Python) |
| **Langage cible**         | JavaScript        | C, Python, JS, OCaml, R | Python              |
| **Modélisation du droit** | Mécanismes dédiés | Formellement défini     | ?                   |
| **Garanties**             | Aucune            | Preuves d'exactitude    | Aucune              |

</details>

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
l'impôt doivent être considérés comme des programmes critiques, il a décider d'utiliser
l'état de l'art en théorie des langages et méthodes formelles pour garantir la
fiabilité des calculs. Cela a donné naissance à [Catala](https://catala-lang.fr),
un DSL spécialement conçu pour l'implémentation d'algorithmes issus directement
de textes juridiques.

Catala est un projet open-source, activement développé par une équipe
internationale et pluridisciplinaire de chercheureuses et développeureuses.

## Fonctionnalités

Afin de mettre en lumière les différences entre ces trois langages, nous allons
implémenter un impôt sur le revenu fictif dans chacun d'entre eux. Cet exemple
est tiré du [tutoriel de Catala](https://catala-lang.org/fr/examples/tutoriel/)
il est volontairement simpliste pour en faciliter la compréhension mais permet
d'illustrer les différentes mécaniques qui apparaissent lorsque que l'on essaie
de modéliser la loi.

<Callout type="info" title="Sur le choix du domaine">

Il est important de relever que Publicodes, contrairement à Catala et OpenFisca,
n'est pas limité à la modélisation du droit. Par exemple, il est utilisé dans
[nosgestesclimat.fr](https://nosgestesclimat.fr/documentation) pour calculer
l'empreinte carbone et hydrique individuelle. Cependant, la comparaison ne me
semble pertinente seulement si nous la restreignons au domaine commun des trois
langage.

</Callout>

Le code complet des trois implémentations est disponible
[ici](https://github.com/EmileRolley/catala-publicodes-openfisca).

### Aperçu de la syntaxe

Avant de rentrer dans le vif du sujet, passons en revue les principales
caractéristiques syntaxiques des différents langages.

Les **trois langages ont comme point commun d'être des langages dédiés**,
c'est-à-dire qu'ils proposent des spécificités permettent de modéliser un
domaine particulier au contraire des langages plus répandus comme
[C](<https://en.wikipedia.org/wiki/C_(programming_language)>) ou
[Python](https://www.python.org/) qui permettent de créer toutes sortes de
programmes indépendamment du domaine métier.

#### OpenFisca

OpenFisca possède la particularité d'être _embarqué_. Cela signifie, qu'au lieu
de créer un nouveau langage avec sa propre syntaxe et sémantique, il est créer
au sein d'un langage (dit _hôte_) plus général existant.
En effet, pour écrire un modèle OpenFisca, il faut en réalité écrire du Python.

Cette méthode permet de tirer partie de tout l'historique de développement de
Python et de son écosystème : pas besoin de devoir réécrire un interpréteur ou
compilateur, ni de créer des plugin pour son éditeur, etc...

En revanche, OpenFisca est donc également contraint par les limites de Python et
nécessite d'utiliser sa syntaxe.

<Callout type="info" title="Exemple de code">

Voici par exemple le calcul du taux moyen d'imposition de l'impôt sur le revenu
extrait du modèle
[`OpenFisca-France`](https://github.com/openfisca/openfisca-france/blob/ebfa5bc52ac537a20a3615fd15d00eb4bf69e680/openfisca_france/model/prelevements_obligatoires/impot_revenu/ir.py#L3596-L3607)
:

```python
class taux_moyen_imposition(Variable):
    value_type = float
    entity = FoyerFiscal
    label = "Taux moyen d'imposition"
    definition_period = YEAR

    def formula(foyer_fiscal, period, parameters):
        rni = foyer_fiscal('rni', period)
        impot_revenu_restant_a_payer = foyer_fiscal('impot_revenu_restant_a_payer', period)
        return (
            (- impot_revenu_restant_a_payer) / (rni + (rni == 0))
            ) * (rni > 0)
```

</Callout>

#### Publicodes

#### Catala

### Modélisation du droit

Comme évoqué précédemment, ces trois langages ont en commun la volonté de
modéliser le droit, ou du moins une partie de celui-ci qui est calculatoire et
concerne principalement la gestion de flux monétaires.

Cependant, la manière dont sont écrits les textes de lois est régie par une
logique propre et qui ne se prête pas facilement à une modélisation dans des
langages de programmations basé sur une logique _classique_. En effet, la
plupart du temps **est définit un cas de base** (pouvant être défini à plusieurs
endroits sous conditions) et **des exceptions à ce cas de base**.

> TODO: chercher un exemple parlant dans
> https://code.gouv.fr/demos/catala/allocations-familiales/sources.

Dans un langage de programmation classique, on serait obligé de le définir
de la manière suivante :

```javascript
let montant = casDeBase();

if (condition1) {
    montant = exception1();
} else if (condition2) {
    montant = exception2();
} else if (condition3) {
    montant = exception3()();
}
```

### Exécution

### Garanties

### Explicabilité

## Conclusion
