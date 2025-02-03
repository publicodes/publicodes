---
sidebar_position: 1
title: Créer un modèle Publicodes
---

<script lang="ts">
    import quickdocSrc from './quickdoc.png';
</script>

Dans ce tutoriel, nous verrons comment créer un modèle Publicodes, et l'importer dans une application JS.

## 1. Initialiser un projet publicodes

Pour commencer, nous allons initialiser un projet publicodes. Le plus simple est d'utiliser `npx @publicodes/tools init` :

```bash
mkdir mon-projet-publicodes
cd mon-projet-publicodes
npx @publicodes/tools init
```

Cette dernière commande va mettre en place un nouveau projet publicodes, en demandant quelques informations de base (nom du projet, auteur, gestionnaire de paquets, etc.).

Ce projet contient :

- un fichier `package.json` avec les dépendances nécessaires
- un dossier `src/` contenant les fichiers de règles en `.publicodes` (avec un exemple de règle `salaire.publicodes`)
- un dossier `test/` avec un exemple de test unitaire (`salaire.test.js`)

## 2. Compiler le modèle

Les règles publicodes sont écrites en YAML, et doivent être compilées en JS pour être utilisées dans une application JS. Pour cela, on utilise la commande :

```bash
npx publicodes compile
```

Par défaut, cette commande va compiler tous les fichiers `.publicodes` du dossier `src/` en un fichier `index.js` dans le dossier `publicodes-build/`. Par ailleurs, un fichier `index.d.ts` est également généré contenant les types TypeScript correspondant aux règles compilées.

> 👉 En savoir plus sur la [compilation des règles](/docs/manuel/compilation)

## 3. Utiliser le modèle dans une application JS

Pour utiliser le modèle dans une application, il suffit d'importer le fichier `index.js`.

```ts
import rules from './publicodes-build';
import Engine, { formatValue } from 'publicodes';

const engine = new Engine(rules);
engine.setSituation({
    'salaire brut': '2415 €/mois'
});
console.log(formatValue(engine.evaluate('salaire net')));
```

A noter que si vous utilisez TypeScript, l'engine sera typé, et vous pourrez bénéficier de l'autocomplétion pour les règles et les valeurs de situation.

Les types disponibles dans le fichier `index.d.ts` sont :

- `Situation` : le type de l'objet passé à `engine.setSituation`
- `RuleValue` : le type de la valeur dans la clé `nodeValue` retourné par [`engine.evaluate`](/docs/api/publicodes/classes/Engine#evaluate)
- `RuleName` : tous les noms de règles

## 4. Développer le modèle avec la quick-doc

```bash
npx publicodes dev
```

Cette commande va lancer un serveur de développement local, qui permet de visualiser les règles compilées, et de calculer leurs valeurs pour différentes situations d'entrée.

<img src={quickdocSrc} alt="Capture d'écran de la quick-doc" />

Pour ajouter une situation, créer une règle publicodes dans le dossier `situations/` en précisant un `contexte` d'évaluation :

```yaml
salaire élevé:
    contexte:
        salaire brut: 70000 €/an
```

> 👉 En savoir plus sur le [mécanisme `contexte`](/docs/mecanismes#contexte)

Les règles sont recompilées à chaque modification des fichiers `.publicodes`, et les résultats sont actualisés en temps réel, ce qui permet d'itérer rapidement sur le modèle.

<!--
## 5. Publier le paquet

<Callout type="warning" title="Bientôt disponible">

L'API pour exporter / importer des règles publicodes est en cours de réécriture, et n'est pas encore disponible. Nous mettrons à jour ce tutoriel dès que cette fonctionnalité sera disponible.

</Callout> -->
