---
sidebar_position: 1
title: Tutoriel
---

## Installation

Publicodes permet de générer des simulateurs dans plusieurs langages
de programmation. Vous pouvez installer le compilateur depuis votre
distribution pour avoir un accès complêt à toutes les options.

Il est également possible d'installer le compilateur spécifiquement pour un
langage cible, et ainsi avoir une version pré-configuré de celui-ci. Dans
ce tutoriel, nous allons utiliser le paquet npm pour générer des modèles
Javascript.

```bash
$ npm install publicodes
```

## Premiers pas

Les modèles Publicodes sont structurés en dossier. Tous les fichiers avec
l'extension `.publicodes` d'un dossier forment un seul modèle. Nous allons donc
préparer notre premier modèle :

```publicodes title="./basket/rules.publicodes"
prix:
prix . carottes: 2€/kg
prix . champignons: 5€/kg
prix . avocat: 2€/avocat

dépenses primeur:
  public: oui
  formule:
    somme:
      - prix . carottes * 1.5 kg
      - prix . champignons * 500 g
      - prix . avocat * 3 avocat
```

Nous pouvons maintenant compiler ce modèle, pour construire notre module
Javascript :

```shell
$ npm exec publicodes2 compile basket/
```

Le compilateur génére notre module `model.publicodes.js` que nous allons
pouvoir importer dans notre projet Javascript :

```javascript
import { default as rules } from 'model.publicodes.js';
```

### Évaluer une règle

L'objet `rules` expose les rêgles qui sont publiques. Ces rêgles ont
différents attributs, dont la méthode `evaluate` :

```js
console.log(rules['dépenses primeur'].evaluate());
```

La méthode `evaluate` prend deux arguments optionnels, dont le premier permet
de passer un contexte d'évaluation :

```js
// Ici on passe un contexte pour évaluer la règle.
const result = rules['dépenses primeur'].evaluate({
    'prix . avocat': '3€/avocat'
});
```

### Variables manquantes

Publicodes calcule automatiquement les dépendances de chaque règle. Si la
valeur d'une dépendance est manquante, et ne permet pas de faire le calcul,
elle apparaîtra dans l'attribut `missing` :

```js
const context = {
    x: 'y + 5',
    y: null
};

console.log(rules['x'].evaluate(context).missing);
```

Cette information est utile pour intégrer Publicodes à votre application.

<!--
Il est aussi possible d'utiliser des valeurs par défaut. Dans ce cas la règle
sera calculée avec la valeur par défaut de sa dépendance, mais cette dernière
apparaîtra tout de même dans les `missingVariables`. Cette fonctionnalité est
utile pour réaliser des simulateurs où l'on veut proposer un résultat sans
attendre que l'utilisateur ait répondu à l'intégralité des questions tout en
utilisant la liste des variables manquantes pour déterminer les questions
restant à poser. -->

<Callout type="info">

Les variables manquantes sont calculées lors de l'évaluation. Si une variable
apparaît dans la formule de calcul d'une règle elle ne sera rapportée que si
elle est effectivement nécessaire au calcul. Si elle est présente dans une
portion non active de l'évaluation (par exemple dans un bloc condition non
actif, ou la tranche d'un barème non actif) elle sera filtrée et n'apparaîtra
pas dans les `missing`.

</Callout>

## Structurer un projet

Ce dossier depuis lequel nous travaillons est le paquet racine. Publicodes
permet d'importer des règles depuis un autre modèle au sein du même paquet,
ou depuis un autre paquet se trouvant ailleurs dans le _filesystem_. Nous allons
commencer par voir comment utiliser l'import pour structurer nos modèles.

Le mécanisme `importer` nous permet d'importer toutes les règles d'un
autre modèle, comme si elles faisaient partie de l'espace de nom. Cela
permet de réutiliser un jeu de règles dans plusieurs de nos modèles,
mais également de partager une partie de nos rêgles internes qui sont
génériques à d'autres projets :

```publicodes title="./basket/rules.publicodes"
prix:
  importer: prix

dépenses primeur:
  public: oui
  formule:
    somme:
      - prix . carottes * 1.5 kg
      - prix . champignons * 500 g
      - prix . avocat * 3 avocat
```

```publicodes title="./prix/rules.publicodes"
carottes:
  public: oui
  valeur: 2€/kg
champignons:
  public: oui
  valeur: 5€/kg
avocat:
  public: oui
  valeur: 2€/avocat
```

<Callout type="warning">

Il est à noter que seules les rêgles qui sont publiques sont référencable
via l'import.

</Callout>

Maintenant que nous avons déplacé les prix dans un modèle séparé, il
est possible de les réutiliser depuis un tout autre projet. Considérons que
celui-ci soit publié en tant que paquet NPM sous le nom de "publicodes-basket",
alors un autre projet peut réutiliser ce modèle "prix" :

<Callout type="info">

Nous n'avons rien de plus à configurer puisque nous utilisons le compilateur à
travers le paquet Javascript. Il se charge d'indiquer que les paquets se
trouvent dans le dossier `node_modules/`.

</Callout>

```shell
$ npm install publicodes-basket
$ npm exec publicodes2 compile cantine/
```

```publicodes title="./cantine/rules.publicodes"
prix:
  importer:
    modèle: prix
    paquet: publicodes-basket

prix course semaine:
  public: oui
  formule:
    somme:
      - prix . carottes * 20 kg
      - prix . champignons * 10 kg
      - prix . avocat * 200 avocat
```
