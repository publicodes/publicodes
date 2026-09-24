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
npm install publicodes
```

## Premiers pas

Les modèles Publicodes sont structurés en dossier. Tous les fichier avec
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
      - prix . champignons * 500g
      - prix . avocat * 3 avocat
```

Nous pouvons maintenant compiler ce modèle, pour construire notre module
Javascript :

```shell
$ npm run publicodes2 compile basket/
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

La méthode `evaluate` prends deux arguments optionnel, dont le premier permet
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

Les variables manquantes sont calculées lors de l'évaluation. Si une variable
apparaît dans la formule de calcul d'une règle elle ne sera rapportée que si
elle est effectivement nécessaire au calcul. Si elle est présente dans une
portion non active de l'évaluation (par exemple dans un bloc condition non
actif, ou la tranche d'un barème non actif) elle sera filtrée et n'apparaîtra
pas dans les `missing`.
