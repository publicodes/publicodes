---
sidebar_position: 4
title: Métadonnées et documentation
---

Les métadonnées permettent d'ajouter des informations supplémentaires à vos règles.

Certaines métadonnées sont standardisées et sont affichées sur les pages de documentation auto-générées. D'autres sont personnalisées et peuvent être utilisées pour ajouter des informations spécifiques à votre domaine d'application.

Elles sont définies directement en dessous de la règle, et sont de la forme `clé: valeur`.

```publicodes*
prix:
    valeur: 10€
    titre: Prix HT
```

Pour écrire une métadonnée sur plusieurs lignes, il faut la précéder du symbole `|`.

```publicodes
prix:
    valeur: 10€
    description: |
        C'est le prix total à payer de l'article.
        Il n'inclut pas la TVA.
```

## Documentation

<Callout type="tip">

Pour parcourir la documentation d’un jeu de règles, vous pouvez utiliser [l'éditeur en ligne](https://publi.codes/studio).

Si vous souhaitez publier une documentation directement sur votre site web, vous pouvez vous référer aux guides [Next.JS](/docs/guides/nextjs) ou [Svelte](/docs/guides/svelte).

</Callout>

La documentation automatique de publicodes génère une page web par règle. Cette règle contient l'explication des calculs, ainsi que des métadonnées standardisées qui sont définies directement dans le code :

-   `titre` : si défini, il est utilisé à la place du nom de la règle dans l'interface utilisateur.
-   `description` : elle est affichée comme paragraphe d'introduction sur la documentation
-   `icônes` : permet d'ajouter des emojis qui sont affichées à côté du titre (mais pas dans l'explication des calculs).
-   `note` : on l'utilise pour ajouter des informations complémentaires à la règle, généralement les détails d'implémentation ou des informations techniques. Elle est affichée en bas de la page de documentation.
-   `question` : utilisée pour la [génération automatique de formulaire](/docs/guides/formulaire). Elle est affichée dans la page de documentation en l'absence de la métadonnée `description`.
-   `références` : utilisée pour ajouter des liens vers des sources externes. Elle est affichée en bas de la page de documentation.

**Exemple :**

```publicodes

pesanteur:
  valeur: 9.80665 m/s2
  icônes: 🌍
  titre: Accélération de la pesanteur terrestre
  description: |
    L'accélération de la pesanteur terrestre est la force exercée par la Terre sur un objet en chute libre.
  note: |
    On utilise une précision de 5 chiffres après la virgule, suffisante pour la plupart des applications.

  références:
    Article wikipedia: https://fr.wikipedia.org/wikiAcc%C3%A9l%C3%A9ration_normale_de_la_pesanteur_terrestre

```

<Callout type="info" title="Extension VSCode">

Les métadonnées `title` et `description` sont également affichées au survol de la règle avec l'extension VSCode.

</Callout>

## Métadonnées personnalisées

Il est possible d'ajouter des métadonnées personnalisées à vos règles. Vous pouvez ainsi ajouter des informations spécifiques à votre domaine d'application.

```publicodes
notif zéro déchet:
  type: notification
  message: "Vous avez atteint le zéro déchet !"
```

<Callout type="warning">

Les mécanismes et les métadonnées étant définis au même niveau d'indentation, il y a un risque de changement cassant lorsqu'un nouveau mécanisme est introduit dans le langage.

Pour éviter ce problème, il est recommandé de :

-   Préfixer les métadonnées personnalisées avec `_`
-   Rassembler toutes les métadonnées personnalisées dans le même objet ayant pour clé un nom spécifique à votre domaine.

**Exemple :**

```publicodes
notif zéro déchet:
  _NGC:
    type: notification
    message: "Vous avez atteint le zéro déchet !"

```

</Callout>

### Accéder aux métadonnées dans le code

Les métadonnées sont accessibles dans le code via la clé `rawRule` :

```javascript
const rule = engine.getRule('notif zéro déchet');
const metadata = rule.rawRule._NGC;
```
