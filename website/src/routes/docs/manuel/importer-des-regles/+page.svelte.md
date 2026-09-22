---
sidebar_position: 6
title: Imports de règles
hide_table_of_contents: false
---

## Modèles publicodes

Les projets Publicodes v2 sont structurés par dossier que l'on appelle
modèle. Le mécanisme `importer` permet d'importer un modèle depuis un autre.
Structurer un projet en plusieurs modèles permet de factoriser des expressions
pour, par exemple, les ré-utiliser.

Lorsque le paquet n'est pas précisé, les modèles sont recherchés depuis
le paquet courant, ou depuis l'espace de travail courant dans le cas du paquet
racine (détails [plus loin](#paquets-publicodes)). Seules les rêgles
qui sont publiques, ou qui sont des dépendances d'autres rêgles publiques,
sont référencable via l'import.

```publicodes title="./src/main.publicodes"
modèle 1:
  importer: modèle 1
rêgle a:
  valeur: modèle 1 . rêgle b
```

```publicodes title="./modèle 1/rules.publicodes"
modèle 2:
  importer: modèle 1/modèle 2
rêgle b:
  valeur: modèle 2 . rêgle c
  public: oui
```

```publicodes title="./modèle 2/rules.publicodes"
rêgle c:
  valeur: 10
  public: oui
```

## Paquets publicodes

Les paquets Publicodes permettent de réutiliser des modèles publicodes
dans plusieurs projets. La forme la plus verbeuse de `importer` permet
d'importer un modèle depuis un autre paquet.

<Callout type="info">

Le système de recherche de paquets est pensé pour s'intégrer avec la
pluparts des systèmes de distributions. Le compilateur utilise la variable
d'environnement `PUBLICODESPATH` pour trouver les paquets. Cette variable
spécifie une liste de chemin, séparé par des `:`, auquel le compilateur va
attacher le chemin du paquet qu'il recherche. Lorsque le paquet est trouvé,
le compilateur importe alors le modèle ciblé. Ce paquet devient le nouveau
paquet courant, et les imports qu'il contient seront relatif à celui-ci.

</Callout>

Ici un exemple avec `PUBLICODESPATH=vendor` :

```publicodes title="./src/main.publicodes"
modèle 1:
  importer:
    #  Forme verbeuse pour importer depuis un autre paquet
    #  ici la cible "vendor/paquet 1/modèle 1/".
    modèle: modèle 1
    paquet: paquet 1
rêgle a:
  valeur: modèle 1 . regle b
```

```publicodes title="./vendor/paquet 1/modèle 1/rules.publicodes"
modèle 2:
  # Forme non-verbeuse pour importer depuis le même paquet
  # ici "vendor/paquet 1/modèle 2/"
  importer: modèle 2
rêgle b:
  valeur: modèle 2 . rêgle c
  public: oui
```

```publicodes title="./vendor/paquet 1/modèle 2/rules.publicodes"
rêgle c:
  valeur: 10
  public: oui
```

## Sucres syntaxiques

Il est possible d'utiliser le préfixe `./` dans le nom d'un modèle pour le
rechercher depuis le dossier du modèle courant. Ce sucre syntaxique permet
de racourcir le chemin des modèles, dans le cas d'arborescences plus profondes.

```publicodes title="./src/main.publicodes"
modèle 1:
  importer: modèle 1
rêgle a:
  valeur: modèle 1 . rêgle b
```

```publicodes title="./modèle 1/rules.publicodes"
modèle 2:
  importer: ./modèle 2
rêgle b:
  valeur: modèle 2 . rêgle c
  public: oui
```

```publicodes title="./modèle 1/modèle 2/rules.publicodes"
rêgle c:
  valeur: 10
  public: oui
```

## Vendors imbriqués

Ce préfixe `./` peut aussi être utilisé avec les chemins du `PUBLICODESPATH`,
et cela permet de rechercher les paquets de manière imbriquée. Par exemple
pour supporter les `node_modules` en mode _nested_, avec
`PUBLICODESPATH=./node_modules:node_modules`:

```publicodes title="./src/main.publicodes"
modèle 1:
  importer:
    modèle: modèle 1
    paquet: paquet 1
rêgle a:
  valeur: modèle 1 . regle b
```

```publicodes title="./mode_modules/paquet 1/modèle 1/rules.publicodes"
modèle 2:
  importer:
    # Ce paquet contient son propre dossier "node_modules",
    # et celui-ci contient un paquet "paquet 2".
    modèle: modèle 2
    paquet: paquet 2
rêgle b:
  valeur: modèle 2 . rêgle c
  public: oui
```

```publicodes title="./mode_modules/paquet 1/mode_modules/paquet 2/modèle 2/rules.publicodes"
rêgle c:
  valeur: 10
  public: oui
```
