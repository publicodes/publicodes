---
title: 'Publicodes V2'
description: 'Après cinq ans à faire évoluer Publicodes de façon organique, nous franchissons une étape majeure : nous travaillons depuis un mois sur une nouvelle version entièrement repensée...'
author: Johan Girod
date: 2025-06-06
tags: nouveautés, langage, V2
icon: 🌱
featured: true
---

## Publicodes V2 : un compilateur pour fiabiliser et accélérer vos calculs

Après cinq ans à faire évoluer Publicodes de façon organique, nous franchissons une **étape majeure** : nous travaillons depuis un mois sur une **nouvelle version entièrement repensée**. Les premiers résultats sont très encourageants et nous confortent dans cette direction ambitieuse.

## Pourquoi une V2 ?

Publicodes a grandi rapidement. A présent, il est utilisé par de **nombreuses équipes** dans des cas d'usage toujours plus variés… Cette adoption révèle aussi les limites du système actuel :

- **Performance** : sur des bases de règles importantes, les temps de calcul deviennent problématiques
- **Fiabilité** : le système d'évaluation actuel manque de spécifications claires, ce qui génère des comportements imprévisibles
- **Usabilité** : pensé pour le domaine du calcul de cotisation sociale, il se retrouve aujourd'hui utilisé pour modéliser des domaines beaucoup plus varié
  Résoudre ces problèmes en profondeur nécessite de repenser l'architecture. D'où cette V2, dont le développement a été financé jusque là par mon-entreprise (Urssaf).

### Faciliter la modélisation

Notre but ? Que vous puissiez continuer à implémenter des modèles sans être bridé par la complexité et les limites de l'actuel. Nous pensons que Publicodes a prouvé qu'il répondait à sa promesse : rassembler les expert·es métiers et les développeur·euses. Il n'y a qu'un pas à faire passer à l'échelle, et en faire un langage qui toujours plus plaisant à utiliser !

## Ce qui va changer...

### Des mécanismes réadaptés

L'un des enjeux importants est de repenser l'écriture des règles pour de nouveaux cas d'usage, et de repenser les comportements actuels. On pense par exemple à la notion l'applicabilité, du remplacement, de la désactivation de branche… Il est temps d'effectuer un ménage de printemps.

### Plus de limitations dûes aux performance

Choisir Publicodes ne doit pas être synonyme de baisse de performances, et ce, quelque soit la taille du modèle, et quelque soit l'équipement utilisé pour l’exécuter. Cela passe également par la réduction de la taille des informations nécessaire à l’exécution, et par un chargement du modèle **instantané**.

### Fiabilité

Le flot d’exécution des programmes doivent être plus explicite possible et ne **pas laisser de surprises**. Pour cela, il est nécessaire d'avoir :

- **Une vérification statique** : les erreurs sont détectées plutôt possible, au moment de l'écriture des règles (incohérence de types ou d'unité, détection de cycles, etc…).
- Des messages d'erreur **précis et clairs**, localisés dans le code source
- Une **intégration Typescript native**, pour utiliser des modèles publicodes sans avoir à connaître le langage en lui même.

#### De nouveaux concepts

La V2 introduit de nouveaux éléments :

- Un attribut **« public »** pour spécifier les règles à exporter dans le modèle
- Le concept de **« missingVariable »** a été repensé, au profit d'un concept de « parameters »
- Et bien d'autres à venir…

## Une nouvelle architecture

Le choix technique fort de cette V2 : passer d'un langage interprété en TypeScript à un langage compilé. Concrètement :

1. Un **compilateur en OCaml** analyse et transforme vos règles Publicodes
2. Il génère un **arbre d'évaluation minimal** prêt à être exécuté
3. Un runtime **très léger** se charge uniquement de l'exécution

### Pourquoi OCaml ?

OCaml est un langage fonctionnel particulièrement adapté pour écrire des compilateurs. Des projets comme Catala (droit algorithmique) ou les premiers compilateurs de Rust l'ont choisi pour sa robustesse et son expressivité dans la manipulation d'arbres syntaxiques.

Après un mois de développement, le prototype dépasse déjà nos attentes.

## On a besoin de vous !

Cette V2 est l'occasion de construire ensemble le futur de Publicodes. De nombreuses décisions de design restent à prendre :

- Quelle syntaxe pour la désactivation de branche ?
- Comment traiter les cycles détectés ?
- Quid du mécanisme une possibilité ?
- Quelle meta (e.g. description, titre) doivent être gardée en racine des règles ?
- Doit-on garder le s à la fin de publicodes ? ;)

Et sûrement plein d'autres sujets que vous souhaitez remonter !

## Rejoignez les cafés Publicodes !

Pour discuter de tout cela, nous orienterons les prochains cafés sur la V2.

**📅 Premier rendez-vous : jeudi 12 juin à 14h**

Au programme :

- **Démo du prototype actuel**, et des gains de performance.
- **Présentation des choix de design** déjà effectués
- Discussion sur les **prochains sujets** à trancher

👉 [Inscrivez-vous sur Matrix](https://matrix.to/#/!YRcQoqdiDpEfylLMDr:matrix.org) pour recevoir le lien de connexion

Cette V2 est une opportunité unique de repenser Publicodes avec toute l'expérience accumulée. Votre expertise et vos retours sont essentiels pour faire les bons choix.

À très bientôt pour construire ensemble le futur de Publicodes !
