---
title: 'Publicodes et IA : générer vite, auditer bien'
description: "Un LLM peut générer un simulateur en 30 secondes. Mais qui vérifie que les règles sont bonnes avant la mise en production ? Publicodes, langage déclaratif en français, permet à l'expert métier d'auditer le code généré directement, sans être développeur."
author: Johan Girod
date: 2026-05-13
tags: modelisation
featured: true
draft: true

---

<script>
import generatedSimulatorPng from './generated_simulator.png';
</script>

## Un simulateur en 30 secondes chrono

L'expérience est saisissante. Prenez [la page service-public.fr sur l'aide au permis de conduire](https://www.service-public.gouv.fr/particuliers/vosdroits/F13609), donnez-la à un LLM, et demandez-lui :

> _« Peux-tu créer un petit simulateur en JavaScript pour modéliser cette aide ? »_

![Capture d'écran d'un simulateur généré par IA en quelques secondes. L'interface montre des champs de saisie pour l'âge, la situation, le type de permis, et affiche un résultat d'éligibilité avec un montant d'aide.]({generatedSimulatorPng})

En moins d'une minute, vous obtenez un simulateur fonctionnel. L'utilisateur saisit son âge, sa situation, le type de permis visé, et le simulateur lui dit s'il est éligible et pour quel montant. Fonctionnel, oui. Mais à quel prix ?

## Le code généré : miracle en surface, casse-tête en profondeur

Regardons ce que le LLM a réellement produit pour l'aide réserviste, l'un des dispositifs inclus dans ce simulateur :

```javascript
{
    id: 'reserve',
    nom: 'Aide réserviste Garde nationale / armées',
    conditions: (d) => {
        if (d.situation !== 'reserve') return { statut: 'ko', raison: 'Réservée aux réservistes...' };
        if (d.age >= 25) return { statut: 'ko', raison: 'Contrat signé avant 25 ans requis.' };
        if (d.dejaPermis === 'B') return { statut: 'ko', raison: 'Vous ne devez jamais avoir été titulaire du permis B.' };
        if (d.reserveJours < 50) return { statut: 'ko', raison: 'Au moins 50 jours d\'activité requis.' };
        if (!d.plus2ans) return { statut: 'ko', raison: 'Plus de 2 ans avant fin de contrat requis.' };
        if (d.permis !== 'B') return { statut: 'ko', raison: 'Aide limitée au permis B.' };
        return { statut: 'ok', details: 'Versement de 1 000 €...' };
    },
    montant: '1 000 € (participation)',
    cumul: 'À vérifier avec votre employeur / réserve.'
}
```

Le résultat est fonctionnel, plutôt propre, mais pose trois problèmes fondamentaux.

**1. Code non standard.** Chaque LLM, chaque prompt produit un format différent. La structure `{ id, nom, conditions, montant }` est inventée pour l'occasion. Impossible de l'intégrer dans un existant sans réécrire toute la glue applicative.

**2. Code fragile.** Les chaînes de caractères sont en dur, les types inexistants. Un `>= 25` au lieu de `<= 25`, une faute de frappe dans `'reserve'` plutôt que `'réserve'`, et la condition s'inverse ou ne s'applique plus sans que rien ne lève d'erreur.

**3. Code invérifiable.** La seule façon de s'assurer que les règles sont bonnes, c'est de **relire ligne par ligne** et de tester tous les cas à la main. Exercice long, fastidieux, et surtout pas exhaustif. Le LLM a-t-il halluciné une condition qui n'existe pas dans le texte officiel ? Pour le savoir, il faut avoir lu le texte officiel soi-même, puis comparer chaque `if/else` une par une. On en revient au point de départ et on prie pour ne rien rater.

## Un défi qui dépasse largement la sphère publique

En 2024, le CEO de GitHub annonçait que **46 % du code écrit avec Copilot était déjà généré par l'IA**. En 2026, plus de la moitié des développeurs professionnels utilisent ces outils **quotidiennement** ([Stack Overflow Survey 2025](https://survey.stackoverflow.co/2025/ai)). La tendance est massive et ne fait que s'accélérer.

Mais derrière l'euphorie des commits accélérés, une autre statistique, plus inquiétante : **46 % des développeurs se méfient activement de l'exactitude du code généré**, contre seulement 33 % qui lui font confiance (Stack Overflow 2025). Pire : le problème n°1 cité par 66 % des développeurs, c'est _« des solutions presque bonnes, mais pas tout à fait »_ ce genre d'erreur subtile qu'on ne détecte qu'après coup.

Qui supporte le risque quand ce code « presque bon » atterrit en production ?

- Un **simulateur d'aides publiques** généré par IA : si une condition d'éligibilité est mal transcrite, c'est un citoyen qui se voit refuser une aide à laquelle il a droit.
- Une **banque** qui fait générer le moteur de scoring de ses crédits : une hallucination sur un critère réglementaire, et c'est un refus de prêt injustifié ou pire, un crédit accordé à un client non éligible.
- Un **assureur** qui automatise sa logique de tarification : une erreur dans le calcul des garanties engage directement la responsabilité de l'entreprise.

Dans tous ces cas, le développeur qui a prompté l'IA n'est pas le détenteur de la règle métier. L'expert métier, lui, ne lit pas le code. Et le management, qui signe la mise en production, ne peut pas auditer ce qu'il ne comprend pas.

**Le code généré par IA crée un vide de responsabilité.** Quelqu'un doit pouvoir lire, comprendre, et signer les règles avant qu'elles n'affectent des droits, des sous, ou des personnes. C'est précisément ce vide que Publicodes comble.

## Publicodes : un langage que l'expert peut auditer

Publicodes est un langage déclaratif, en français, conçu pour modéliser des règles métier complexes. Il est déjà utilisé en production par [mon-entreprise.fr](https://mon-entreprise.urssaf.fr), [Nos Gestes Climat](https://nosgestesclimat.fr), le [Code du travail numérique](https://code.travail.gouv.fr), [Mes Aides Réno](https://mesaidesreno.beta.gouv.fr/) et une [quinzaine d'autres services](/realisations).

Reprenons la même aide réserviste, écrite en Publicodes :

```yaml
aide réserviste:
    description: Aide financière pour les réservistes des armées ou de la gendarmerie.
    références:
        service-public.fr: https://www.service-public.gouv.fr/particuliers/vosdroits/F1188

aide réserviste . éligible:
    toutes ces conditions:
        - est réserviste
        - déjà permis B valide = non
        - jours activité réserviste >= 50
        - plus de 2 ans avant fin contrat réserve = non
        - âge <= 25
        - permis cible = B

aide réserviste . montant:
    applicable si: aide réserviste . éligible
    valeur: 1000 €
```

### Lisible par les humains, lisible par les machines

Le code Publicodes se lit comme du français. Un juriste, un chargé de mission, un gestionnaire n'importe qui ayant déjà écrit une formule dans un tableur peut comprendre chaque règle sans être développeur. Chaque condition est une phrase. Les noms de variables ne sont pas en `camelCaseIllisible` mais en français naturel : `déjà permis B valide`, `jours activité réserviste`. Pas de `if/else` imbriqués, pas de retours anticipés, pas de `!` qui inverse silencieusement la logique.

Mais cette lisibilité n'est pas qu'une affaire de syntaxe. C'est aussi une question de **structure**. Un LLM qui génère du JavaScript dispose d'une liberté infinie : fonctions fléchées, ternaires, boucles, closures. Chaque degré de liberté est une opportunité d'hallucination ou, plus vicieux, de _presque correct_ que personne ne remarquera. Publicodes impose un vocabulaire métier restreint et explicite (`toutes ces conditions`, `applicable si`, `somme`, `produit`, `remplace`). Pas de boucles, pas d'assignation, pas de types arbitraires. Résultat : le code généré est **structurellement prévisible**, et donc vérifiable par un humain comme par un validateur automatique.

### La documentation est l'audit littéralement

Au-delà de la syntaxe, Publicodes génère automatiquement une [page d'explication](/docs/manuel/documentation) pour chaque règle. Le point crucial : **il n'y a pas de couche de traduction entre le code et la documentation**. La page est une visualisation 1:1 du code source. Ce que l'expert lit dans son navigateur, c'est ce que le moteur exécute. Rien de plus, rien de moins.

Ce n'est pas un livrable séparé, rédigé après coup, susceptible d'être obsolète. La documentation **est** le code, présenté autrement. C'est ce qui rend l'audit possible : l'expert peut comparer directement ce qu'il lit avec le texte officiel, sans intermédiaire.

### Une séparation métier / applicatif par design

Le code JavaScript généré par le LLM mélange logique métier et préoccupations d'affichage au sein d'un même fichier, dans un même langage. Rien n'empêche de bien séparer les deux, mais rien ne l'impose non plus et en pratique, l'IA ne le fait pas.

Publicodes, lui, impose cette séparation par construction : le modèle contient **uniquement** la logique métier. Il se compile en une fonction JavaScript pure, se publie comme [paquet npm](/bibliotheque), s'expose en API REST. L'interface applicative ne touche jamais aux règles directement. Changez la règle, remplacez le modèle l'applicatif ne bouge pas.

## À quoi ressemblerait flux de développement LLM × Publicodes × Métier ?

Aujourd'hui, le développeur est le goulot d'étranglement : c'est lui qui traduit les besoins métier en code. L'expert connaît la règle mais ne peut ni la coder ni vérifier le code. Avec un LLM, la traduction va plus vite mais la vérification reste bloquée au même endroit.

Voici comment Publicodes redistribue les rôles :

1. Vous rassemblez les documents décrivant le dispositif (texte de loi, page service-public, convention collective, barème...)
2. Le LLM les interprète et génère une **première version du modèle en Publicodes**
3. L'expert métier ouvre la page d'explication autogénérée, lit chaque règle en français, et identifie les erreurs ou les imprécisions
4. Il corrige directement le fichier YAML ou ajuste le prompt et relance la génération puis revérifie. Le cycle génération/relecture peut tourner plusieurs fois
5. Une fois le modèle validé, il est intégré **directement** dans l'applicatif : le YAML est le code exécuté, sans retraduction par un développeur

Ce qui change fondamentalement, c'est que **l'expert métier devient le signataire du modèle**, pas seulement son prescripteur. L'IA propose, l'expert dispose, le résultat part en production et chaque règle est auditable par la personne la plus légitime pour le faire. C'est du _vibe coding_ pour experts métier, avec une différence de taille : on ne prie pas pour que ça marche, on le vérifie.

À terme, ce workflow pourrait être outillé par une interface SaaS dédiée où l'expert génère, relit, corrige et valide son modèle sans jamais ouvrir un IDE ni un terminal.

Bonne nouvelle : les LLM actuels sont déjà plutôt bons en Publicodes. Et pour cause, la documentation en ligne est complète, et les dépôts GitHub open source cumulent des centaines de milliers de lignes de règles en français, structurées, versionnées, publiques depuis 2020. Un corpus d'entraînement hors norme pour un langage de niche, possiblement déjà digéré par la plupart des modèles.

---

**Vous utilisez Publicodes avec un LLM ? Vous avez des idées, des retours, des critiques sur cette approche ?** [Rejoignez la discussion sur Matrix](https://matrix.to/#/#publicodes:matrix.org) ou [ouvrez une issue GitHub](https://github.com/publicodes/publicodes/discussions).
