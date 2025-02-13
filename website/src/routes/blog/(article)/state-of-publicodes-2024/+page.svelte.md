---
title: State of Publicodes 2024
description: "Un état des lieux de l'écosystème Publicodes en 2024 : satisfaction, fonctionnalités, améliorations souhaitées..."
author: Johan Girod
date: 2024-11-07
tags: communauté
icon: 📊
featured: true
---

<script>
    import Tag from '$lib/ui/tag.svelte';
    import Callour from '$lib/ui/callout.svelte';
   
    const { data } = $props();
    const { topProjets, topAméliorations, nombreRépondants, enProduction, NPSValue } = data;
</script>

**Publicodes a eu 4 ans cette année 🎂**

Et il a bien grandi ! En 2024, Publicodes est utilisé dans de nombreux projets, par des administrations, des entreprises, des associations, des collectifs, des particuliers...

Voici un petit retour sur les accomplissements de l'année :

- 🚀 Le **passage en v1** tant attendu
- 📚 Un **nouveau site** pour la documentation
- 🧑‍💻 Une **extension VSCode** avec coloration syntaxique et autocomplétion
- ⚡ Des **améliorations de performances** (entre 30% et 50% plus rapide)
- 🗨️ Beaucoup d'échanges dans la **communauté** (Publicodes café, [Github](https://github.com/publicodes/publicodes/discussions) et [Matrix](https://matrix.to/#/#publicodes:matrix.org))
- 📦 Ainsi que de [**nombreuses évolutions du langage**](https://github.com/publicodes/publicodes/blob/master/CHANGELOG.md).

Cela nous a semblé un bel âge pour prendre le pouls de la communauté sur ce langage un peu particulier. Nous avons donc **lancé un questionnaire** pour en savoir plus sur les usages de Publicodes en 2024.

## Un langage bien installé

Parmis les {nombreRépondants} répondants, **{enProduction}** l'utilisent pour des applications en production. Voici les projets avec le plus de réponses au questionnaire, merci à eux 💜

<span class="inline-flex gap-2">
{#each topProjets as [projet, count]}

<Tag>{projet} ({count})</Tag>

{/each}

</span>

<small>

[👉 Voir tous les autres projets](/realisations)

</small>

### ...et apprécié

Le Net Promoter Score (NPS) est de **{NPSValue}** (cela signifie qu'il y a {NPSValue} points de pourcentage de plus de promoteurs que de détracteurs). C'est une belle preuve de confiance, et cela explique le **nombre toujours croissant** de projets qui utilisent Publicodes.

## Les fonctionalités existantes

### Utilisées et appréciées 🌟

Dans le top, on trouve les [pages d'explications autogénérées](https://publi.codes/) et le [mécanisme `contexte`](https://publi.codes/), avec plus de **70 %** d'utilisateurs et **100 % d'opinions positives** de la part de ces derniers.

Cela nous conforte dans l'idée de continuer à **améliorer l'existant**, et à améliorer les **performances du mécanisme `contexte`** ([#92](https://github.com/publicodes/publicodes/discussions/92) et [#393](https://github.com/publicodes/publicodes/discussions/393)).

On peut également citer la [désactivation de branche](), très connue, mais avec un peu plus d'avis négatifs. Cela **corrobore les discussions** qui pointent les limites de cette fonctionnalité et proposent des **pistes d'amélioration** ([#373](https://github.com/publicodes/publicodes/discussions/373) et [#206](https://github.com/publicodes/publicodes/issues/206)).

### Connues avec sentiments mitigés 🤷‍♀️

Le **mécanisme remplace** est connu de plus de **80 %** des personnes interrogées, pourtant seulement la moitié l'utilise, ce malgré un intérêt partagé. C'est un signe que nous devons **améliorer la documentation** à son sujet (tutoriel, exemples, cas limites).

**L'extension VSCode** a une belle notoriété, mais quelques personnes ont remonté des problèmes d'installation. Par ailleurs, **30 %** des sondés utilisent **un autre éditeur** pour écrire des règles Publicodes. Si vous êtes dans ce cas, n'hésitez pas à nous contacter, le [langage server](https://github.com/publicodes/language-server) est publié, et permet un portage facile.

### Peu connues 🔎

**@publicodes/tools** n'est pas très connu et peu utilisé, mais la vaste majorité des personnes y voit un intérêt. Cela tombe bien, nous travaillons sur un **CLI** pour encapsuler ces outils et les rendre plus facile d'accès ([#394](https://github.com/publicodes/tools/pull/50)).

La **gestion des dates** est également à améliorer et à mettre en avant dans un tutoriel.

Enfin, la génération d'API REST est une fonctionnalité de niche, peu utilisée, mais appréciée.

## Les améliorations souhaitées

Enfin le cœur du sujet ! Voici le top des améliorations les plus demandées :

<ul>

{#each topAméliorations.slice(0,3) as [amélioration, count], i}

<li>{#if i === 0} 🏅{:else if i === 1} 🥈{:else if i === 2} 🥉 {/if} <strong>{amélioration}</strong> - <small>{count} demandes </small></li>

{/each}

</ul>

Cela tombe bien, nous avons **déjà commencé à réfléchir à ces sujets**, et nous avons quelques idées de par où commencer.

<Callout type="caution" title="Coming soon ...">

- Faire évoluer `une possibilité` vers un type `enum` [#571](https://github.com/publicodes/publicodes/discussions/571)
- Utiliser un modèle précompilé pour améliorer les perfomances [#256](https://github.com/publicodes/publicodes/discussions/256)
- Une nouvelle CLI avec la commande `publicodes compile` [#567](https://github.com/publicodes/publicodes/discussions/567)

</Callout>
<small>
Voici les autres améliorations demandées :

<ul>
{#each topAméliorations.slice(3) as [amélioration, count]}
<li>{amélioration} - <small>{count} demandes </small></li>
{/each}
</ul>
</small>

## Et maintenant ?

Publicodes est un **commun numérique** porté par des contributeurs bénévoles.

Nous souhaiterions pouvoir rétribuer ce travail grâce à un modèle de **financement participatif de fonctionnalités**.

L'idée est que chaque équipe puisse **contribuer à la pérennité du projet** en fonction de ses moyens.

Nous reviendrons très vite avec des **propositions concrètes**, et nous espérons que vous serez **nombreux à nous suivre dans cette aventure**.

Un grand merci à celles et ceux qui ont pris le temps de répondre à ce questionnaire, et à très bientôt pour la suite !
