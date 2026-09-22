---
sidebar_position: 5
title: Compilation
hide_table_of_contents: false
---

Bien que Publicodes soit basé sur la syntaxe YAML, pour [des raisons de
performances](https://github.com/publicodes/publicodes/pull/254) le moteur de
règles Publicodes attend en entrée un objet JSON regroupant l'ensemble des
règles à évaluer. Ainsi, les fichiers de règles (`.publicodes` ou `.yaml`)
doivent être compilés en un objet JSON avant d'être utilisés.

Par ailleurs, cette étape permet de résoudre les [imports de règles](./importer-des-regles) depuis des paquets NPM via la macro `importer!`.

Enfin, la compilation permet de générer des types TypeScript pour le modèle, facilitant ainsi son utilisation dans un projet TypeScript.

Cette étape de compilation peut être effectué via la ligne de commande ou via une fonction JavaScript.

## Ligne de commande (recommandé)

La commande `npx publicodes compile` du package `@publicodes/tools` permet de compiler un ensemble de fichiers Publicodes.

### Usage

```bash
npx publicodes compile <glob> [options]
```

Avec :

- `<glob>` : un ou plusieurs [_glob_](https://www.npmjs.com/package/glob) (ou chemins vers un dossier) listant les fichiers à compiler.
    > Si le paramètre est un chemin vers un dossier, `<dossier>/**/*.publicodes` est utilisé par défaut.
- `options` :

    - `--output` : le chemin du dossier de sortie (par défaut `publicodes-build`)

### Types TypeScript

La commande `npx publicodes compile` génère également les types TypeScript associés au modèle compilé, dans un fichier `index.d.ts` à la racine du dossier de sortie.

- `Situation` : le type de l’objet passé à engine.setSituation
- `RuleValue` : un `Record` associant un nom de règle au type de son évaluation (valeur `nodeValue` retournée par `engine.evaluate`)
- `RuleName` : tous les noms de règles

La commande génère également un fichier `index.js` à la racine du dossier de sortie, exportant le modèle compilé. Ce dernier est typé avec le fichier `index.d.ts`, ce qui permet de bénéficier de l'autocomplétion dans un projet TypeScript.

### Exemple d'utilisation

```bash
npx publicodes compile data/ --output modele
```

```typescript title="app.ts"
import { Engine } from 'publicodes';
import modele from './modele';

const engine = new Engine(modele);
engine.getRule(...); // Auto-complétion disponible
```

## Avec une fonction JavaScript

La fonction
[`getModelFromSource`](https://publicodes.github.io/tools/functions/compilation.getModelFromSource.html)
permet de compiler un ensemble de fichiers Publicodes en un seul objet JSON.

### Usage

La fonction
[`getModelFromSource`](https://publicodes.github.io/tools/functions/compilation.getModelFromSource.html)
prend en paramètre :

- un [_glob_](https://www.npmjs.com/package/glob) (ou un chemin vers un dossier)
  permettant de définir les fichiers à compiler.
    > Si le paramètre est un chemin vers un dossier, `<dossier>/**/*.publicodes`
    > est utilisé par défaut.
- un objet de configuration optionnel :
    - `ignore` : un tableau de [_globs_](https://www.npmjs.com/package/glob) à
      ignorer
    - `verbose` : un booléen permettant d'afficher les logs de compilation

Elle retourne un objet JSON représentant le modèle compilé, utilisé pour instancier un moteur de règles Publicodes.

### Exemple d'utilisation

```javascript title="build.js"
import { writeFileSync } from 'fs';
import { getModelFromSource } from '@publicodes/tools/compilation';

const model = getModelFromSource('data', {
    ignore: ['data/test/**'],
    verbose: true
});

writeFileSync('dist/model.json', JSON.stringify(model, null, 2));
```

<Callout type="warning" title="Attention">

La fonction `getModelFromSource` retourne un objet JSON, mais ne génère pas les types TypeScript.

</Callout>
