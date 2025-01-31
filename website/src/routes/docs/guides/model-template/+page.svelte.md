---
sidebar_position: 1
title: Créer un paquet de règles réutilisable
---

Dans ce tutoriel, nous verrons comment créer un paquet de règles Publicodes réutilisable, et l'importer dans une application JS.

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
- un dossier `src/` contenant les fichiers de règles en `.publicodes`
- un dossier `test/` avec un exemple de test unitaire (`salaire.test.js`)
