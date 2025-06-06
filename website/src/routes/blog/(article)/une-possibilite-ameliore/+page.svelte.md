---
title: '« une possibilité » : une clarification bienvenue'
description: 'Utilisé dans toutes les bases de règles mais jamais vraiment spécifié, le mécanisme `une possibilité` fait peau neuve. Plus robuste, plus cohérent, et surtout rétrocompatible : découvrez comment cette nouvelle version va simplifier vos modèles.'
author: Johan Girod
date: 2025-02-13
tags: nouveautés, langage
icon: 🎡
image: /og-images/une-possibilite-ameliore.png
---

Bonne nouvelle ! Avec la [`v1.7`](https://github.com/publicodes/publicodes/releases/tag/publicodes%401.7.0), Publicodes solidifie son type `enum` en le rendant **plus robuste et cohérent**. `une possibilité` prend sa place en tant que fonctionalité clé du langage !

Il est maintenant possible de :

- Déclarer directement des règles dans le mécanisme :

    ```publicodes
    contrat:
      une possibilité:
        - CDD:
            titre: Contrat à durée déterminée
        - CDI:
    ```

- Utiliser des constantes (nombres ou textes) :

    ```publicodes
    tva:
      une possibilité:
        - 0%
        - 5.5%
        - 10%
        - 20%
    ```

> [👉 Voir toutes les nouveautés dans la page de documentation dédiée](/docs/manuel/une-possibilite)

`une possibilité` est un mécanisme historique de Publicodes, **présent dans pratiquement toutes les bases de règles**. Pourtant, jusqu'à maintenant, la documentation n'en parlait que très peu.

Pourquoi ? Nous n'étions pas totalement convaincus de son implémentation et de sa sémantique.

[Les retours de la communauté](./state-of-publicodes-2024) ont été clairs : **l'amélioration du langage est la priorité absolue**. Nous avons donc exploré l'ajout d'un [véritable type enum](https://fr.wikipedia.org/wiki/Type_%C3%A9num%C3%A9r%C3%A9) dans Publicodes. Après un [premier brouillon d'une nouvelle syntaxe](https://github.com/publicodes/publicodes/discussions/571), nous avons réalisé que le mécanisme existant avait de bonnes bases et pouvait être enrichi et mieux spécifié, et cela **en gardant la même syntaxe**.

Le gros avantage ? **Pas besoin de migrer les modèles existants** pour profiter des améliorations !

Dans cette version 1.7, nous avons conservé le mécanisme `une possibilité` identique - même l'AST reste compatible ! - tout en ajoutant de nouvelles fonctionnalités :

- Une nouvelle méthode [`getPossibilitiesFor`](/docs/api/publicodes/classes/Engine#getpossibilitiesfor) pour faciliter l'affichage et la manipulation des possibilités dans vos simulateurs et formulaires
- Une option stricte [`checkPossibleValues`](https://publi.codes/docs/api/publicodes/type-aliases/strictoptions) qui détecte les valeurs non listées dans les possibilités
- Le support de nouveaux types dans la liste des possibilités : nombres, textes, et même définition directe de règles
- L'évaluation de l'applicabilité des possibilités (et la sélection automatique de la valeur si une seule possibilité est applicable)

Résultat : **toutes les bases de règles peuvent passer à la v1.7 immédiatement** et profiter des améliorations, tout en adoptant progressivement les nouvelles fonctionnalités selon leurs besoins.

Cette approche de migration en douceur guidera aussi nos prochains développements.

N'hésitez pas à nous faire part de vos retours sur cette fonctionnalité sur [l'espace de discussion de la communauté](https://matrix.to/#/!YRcQoqdiDpEfylLMDr:matrix.org) !
