---
sidebar_position: 5
title: Compilation
hide_table_of_contents: false
---

Les modèles Publicodes V2 ne sont pas directement utilisables par un système
d'information. Les modèles passent par un compilateur qui lit, vérifie, et
génére les simulateurs dans un langage de programmation cible.

Cette étape de compilation peut être effectué via le compilateur directement,
ou via un enrobage adapté au langage cible. Le [`paquet NPM`](#paquet-npm)
simplifie par exemple la génération des simulateurs pour des environnements
Javascript.

## Compilateur direct

La commande `publicodes compile` permet de compiler un modèle Publicodes,
c'est-à-dire un dossier contenant un ensemble de fichiers `.publicodes`.

Usage :

```shell
$ publicodes compile [-t TYPE] [-o OUTPUT] <DIR>
```

Avec :

- `<DIR>` : le chemin vers le modèle.
- `[TYPE]` : le langage de programmation cible (absent `js`).
- `[OUTPUT]` : le chemin de destination (absent `model.publicodes.[TYPE]`).

## Paquet NPM

Le paquet NPM embarque l'executable, et une configuration qui simplifie
l'usage du compilateur pour des environnements Javascript.

Usage :

```shell
$ npx publicodes compile [-o OUTPUT] <DIR>
```

Avec :

- `<DIR>` : le chemin vers le modèle.
- `[OUTPUT]` : le chemin de destination (absent `model.publicodes.js`).

Pour importer un modèle Publicodes depuis un paquet NPM, il suffit alors
d'utiliser le même nom de paquet :

```shell
$ npm install futureco-data
```

```publicodes
piscine:
  importer:
    modèle: piscine
    paquet: futureco-data
```
