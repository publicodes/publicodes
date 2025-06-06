---
title: 'Publicodes 2'
description: "Après cinq ans d'évolution organique, Publicodes franchit une étape majeure : nous travaillons depuis un mois sur une nouvelle version entièrement repensée..."
author: L'équipe Publicodes
date: 2025-06-06
tags: nouveautés, langage, V2
icon: 🌱
featured: true
image: /og-images/publicodes-v2.png
---

Après cinq ans d'évolution organique, Publicodes franchit une **étape
majeure** : nous travaillons depuis un mois sur une **nouvelle version
entièrement repensée**. Les premiers résultats sont très encourageants et nous
confortent dans ce choix ambitieux.

## Pourquoi une V2 ?

Publicodes a grandi rapidement et est utilisé à présent par de **nombreuses
équipes**, dans des cas d'usage toujours plus variés. Cette adoption a également
révélé les limites de la version actuelle. En particulier, des problèmes de :

- **Performance** : sur des bases de règles importantes, les temps de calcul
  deviennent problématiques
- **Fiabilité** : le système d'évaluation actuel manque de spécifications
  claires, ce qui génère des comportements imprévisibles
- **Usabilité** : pensé pour le domaine du calcul de cotisation sociale, il se
  retrouve aujourd'hui utilisé pour modéliser des domaines beaucoup plus varié.

Résoudre tous ces problèmes en profondeur nécessite de repenser l'architecture
et de se permettre d'effectuer des changements cassants. C'est pour cette raison
que nous avons initié le développement de cette V2, dont le développement a été
financé jusque là par [mon-entreprise.fr](https://mon-entreprise.fr) (Urssaf).

### Faciliter la modélisation

L'objectif est que vous puissiez continuer à implémenter des modèles sans être
bridé par la complexité et les limites de l'actuel.

Nous pensons que Publicodes a démontré qu'il répondait à sa promesse :
**rassembler les expert·es métiers et les développeur·euses pour construire des
outils d'intérêt général**. Il ne reste plus qu'un pas pour passer à l'échelle, et
en faire un langage qui toujours plus plaisant à utiliser !

## Ce qui va changer...

### Des mécanismes réadaptés

L'un des enjeux importants est de repenser l'écriture des règles pour de
nouveaux cas d'usage, ce qui implique de redéfinir les comportements actuels.
Nous pensons par exemple à la notion l'applicabilité, du remplacement, et de la
désactivation de branche… Il est temps d'effectuer un ménage de printemps.

### Plus de limitations dûes aux performances

Choisir Publicodes ne doit pas être synonyme de baisse de performances, et ce,
quelque soit la taille du modèle, et de l'équipement utilisé pour l'exécuter.
Cela passe également par la réduction de la taille des informations nécessaire à
l'exécution, et par un chargement du modèle **instantané**.

### Fiabilité

Le flot d’exécution des programmes doivent être plus explicite possible et ne
**pas laisser de surprises**. Pour cela, nous considérons qu'il est nécessaire
d'avoir :

- **Une vérification statique** : les erreurs sont détectées le plutôt possible,
  au moment de l'écriture des règles (incohérence de types ou d'unité, détection
  de cycles, etc…).
- Des messages d'erreur **précis et clairs**, localisés dans le code source.
- Une **intégration TypeScript native**, pour utiliser des modèles Publicodes
  sans avoir à connaître le langage en lui-même.

### De nouveaux concepts

Il nous semble nécessaire d'introduire de nouveaux éléments :

- Un attribut `public` permettant de spécifier les règles à exporter d'un
  modèle.
- Le concept de **variables manquantes** (`missingVariable`) a été repensé, au
  profit d'un concept plus commun de **paramètres**.
- Et bien d'autres à venir…

### Une nouvelle architecture

Nous avons fait le choix technique fort de passer d'un langage interprété en un
langage compilé. Cela nous permet de déplacer la logique et les coûts de
l'analyse au moment de la rédaction du modèle et non plus lors de son exécution.
Concrètement :

1. un **compilateur en OCaml** analyse et transforme vos règles Publicodes,
2. il génère un **arbre d'évaluation minimal et optimisé** prêt à être exécuté,
3. un runtime **très léger** se charge uniquement de l'exécution.

<Callout type="info" title="Pourquoi OCaml ?">

[OCaml](https://ocaml.org/about) est un langage fonctionnel statiquement typé
particulièrement adapté l'écriture de compilateurs. Des projets comme
[Catala](https://catala-lang.fr) (droit algorithmique) ou
[Rust](https://rust-lang.org) (pour ses premiers compilateurs) l'ont choisi pour
sa robustesse et son expressivité dans la manipulation d'arbres syntaxiques.

</Callout>

Après un mois de développement, le prototype dépasse déjà nos attentes.

## On a besoin de vous !

Ce changement majeur est l'occasion de construire ensemble le futur de
Publicodes. De nombreuses décisions de design restent à prendre :

- Quelle syntaxe pour la désactivation de branche ?
- Comment traiter les cycles détectés ?
- Quid du mécanisme une possibilité ?
- Quelle meta (e.g. description, titre) doivent être gardée en racine des règles ?
- Doit-on garder le _s_ à la fin de Publicodes ? ;)
- Et sûrement plein d'autres sujets que vous souhaitez remonter...

Nous pensons qu'il est nécessaire de prendre ces décisions **collectivement**
afin que Publicodes soit **utile au plus grand nombre**.

### Rejoignez les cafés Publicodes !

Pour discuter de tout cela, nous orienterons les prochains cafés sur les choix
de design pour la V2.

_Pour rappel les Publicodes cafés ont lieux un jeudi sur deux à 14h. Pour plus
d'informations n'hésitez pas à [rejoindre le canal
Matrix](https://matrix.to/#/!YRcQoqdiDpEfylLMDr:matrix.org)._

<Callout type='caution' title="Premier rendez-vous : jeudi 12 juin à 14h">

Au programme :

- **Démo du prototype actuel**, et des premiers benchmarks
- **Présentation des choix de design** déjà effectués
- Discussion sur les **prochains sujets** à trancher et sur l'**embarquement**
  des personnes intéressées

👉 [Inscrivez-vous sur
Matrix](https://matrix.to/#/!YRcQoqdiDpEfylLMDr:matrix.org) pour recevoir le
lien de connexion.

</Callout>

Cette nouvelle version est une opportunité unique de repenser Publicodes avec
toute l'expérience accumulée. Votre expertise et vos retours sont essentiels
pour faire les bons choix.

À très bientôt pour construire ensemble le futur de Publicodes !
