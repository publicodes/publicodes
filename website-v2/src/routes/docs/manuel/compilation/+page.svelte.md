---
sidebar_position: 2
title: Compilation
hide_table_of_contents: false
---

Pour [des raisons de
performances](https://github.com/publicodes/publicodes/pull/254) le moteur de
règles Publicodes attend en entrée un objet JSON regroupant l'ensemble des
règles à évaluer. Ainsi, les fichiers de règles (`.publicodes` ou `.yaml`)
doivent être compilés en un objet JSON avant d'être utilisés.

Cette étape de compilation a été factorisée dans un module dédié :
[`@publicodes/tools/compilation`](https://publicodes.github.io/tools/modules/compilation.html).

<Callout type="info">

Pour l'instant le module exporte uniquement une fonction
[`getModelFromSource`](https://publicodes.github.io/tools/functions/compilation.getModelFromSource.html)
, mais il est prévu de publier un CLI autour du [script de
compilation](https://github.com/publicodes/model-template/blob/main/build.js).

</Callout>

## Générer un modèle JSON à partir des fichiers sources

La fonction
[`getModelFromSource`](https://publicodes.github.io/tools/functions/compilation.getModelFromSource.html)
permet de compiler un ensemble de fichiers Publicodes en un seul objet JSON.

<Callout type="tip">

Cette fonction permet de résoudre les [imports de règles](./importer-des-regles) depuis des
paquets NPM via la macro `importer!`.

</Callout>

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

#### Exemple d'utilisation

```javascript title="build.js"
import { writeFileSync } from "fs"
import { getModelFromSource } from '@publicodes/tools/compilation'

const model = getModelFromSource(
	'data',
	{
		ignore: ['data/test/**'],
		verbose: true
	},
)

writeFileSync('dist/model.json', JSON.stringify(model, null, 2))
```
