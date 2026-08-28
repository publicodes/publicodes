# Système de base:

Les projets Publicodes v2 sont structurés par dossier que l'on appelle
module. Pour importer un module dans un autre, il faut utiliser le mécanisme
`importer`. Les modules sont recherchés depuis l'espace de travail courant,
ou depuis le paquet courant (voir plus loin). Seules les rêgles qui sont
publiques, ou qui sont des dépendances d'autres rêgles publiques, sont
accessibles grâce à l'import.

```
./
├── main.publicodes:
│ module 1:
│   importer: module 1
│ rêgle a:
│   valeur: module 1 . rêgle b
│ 
└── module 1/
    ├── main.publicodes:
    │ module 2:
    │   importer: module 1/module 2
    │ rêgle b:
    │   valeur: module 2 . rêgle c
    │   public: oui
    │ 
    └── module 2/
        ├── main.publicodes:
        │ rêgle c:
        │   valeur: 10
        │   public: oui
        └ 
```

Les paquets permettent de réutiliser des modules publicodes dans plusieurs
projets. La recherche des paquets est pensée pour s'intégrer avec la
plupars des systèmes de distributions. Pour importer un module d'un autre
paquet, il faut utiliser la forme plus verbeuse de `importer`. Le compilateur
utilise la variable d'environnement `PUBLICODESPATH` pour savoir où trouver les
paquets (ici `PUBLICODESPATH=vendor`).

```
./
├── main.publicodes:
│ module 1:
│   importer:
│     module: module 1
│     paquet: paquet 1
│ rêgle a:
│   valeur: module 1 . regle b
│ 
└── vendor/
    └── paquet 1/
        ├── module 1/
        │   ├── main.publicodes:
        │   │ module 2:
        │   │   importer: module 2
        │   │ rêgle b:
        │   │   valeur: module 2 . rêgle c
        │   │   public: oui
        │   └ 
        └── module 2/
            ├── main.publicodes:
            │ rêgle c:
            │   valeur: 10
            │   public: oui
            └ 
```

# Rêgles avancées:

Il est possible d'utiliser le préfixe `./` dans le nom d'un module pour
le rechercher depuis le dossier du module courant. Cela simplifie le nom des
modules lorsque l'arborescence est plus profonde.

```
./
├── main.publicodes:
│ module 1:
│   importer: module 1
│ rêgle a:
│   valeur: module 1 . rêgle b
│ 
└── module 1/
    ├── main.publicodes:
    │ module 2:
    │   importer: ./module 2
    │ rêgle b:
    │   valeur: module 2 . rêgle c
    │   public: oui
    │ 
    └── module 2/
        ├── main.publicodes:
        │ rêgle c:
        │   valeur: 10
        │   public: oui
        └ 
```

Ce préfixe peut aussi être utilisé avec les élements de `PUBLICODESPATH`,
et cela permet de rechercher les paquets de manière imbriquée. Par exemple
pour supporter les `node_modules` en mode _nested_
`PUBLICODESPATH=./node_modules`:

```
./
├── main.publicodes:
│ module 1:
│   importer:
│     module: module 1
│     paquet: paquet 1
│ rêgle a:
│   valeur: module 1 . regle b
│ 
└── node_modules/
    └── paquet 1/
        ├── module 1/
        │   ├── main.publicodes:
        │   │ module 2:
        │   │   importer:
        │   │     module: module 2
        │   │     paquet: paquet 2
        │   │ rêgle b:
        │   │   valeur: module 2 . rêgle c
        │   │   public: oui
        │   └ 
        └── node_modules/
            └── paquet 2/
                └── module 2/
                    ├── main.publicodes:
                    │ rêgle c:
                    │   valeur: 10
                    │   public: oui
                    └ 
```
