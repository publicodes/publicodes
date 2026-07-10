---
title: 'Standards de conception des modèles publics'
description: 'Un guide pour les administration listant les prérequis pour proposer des modèles de calcul fiables, modernes, qui fassent référence et qui profitent un maximum aux autres acteurs.'
author: 'Mäel Thomas'
date: '2024-06-14'
tags: 'modelisation, open-data'
icon: '🏛️'
image: /og-images/standard-modeles-ouverts.png
---

Un modèle de calcul est un programme, qui prend des données en entrée (par exemple le gabarit d'une voiture et son type de moteur), et permet de calculer de nouvelles valeurs sur cette base (par exemple, son empreinte climat en gCO2e/km).

Aujourd'hui, les équipes de [Betagouv](https://beta.gouv.fr/) développent de nombreux modèles de calcul, dont voici une liste non exhaustive :

- [datagir/nosgestesclimat](https://github.com/datagir/nosgestesclimat)
- [datagir/aldo](https://github.com/datagir/aldo)
- [MTES-MCT/ecobalyse](https://github.com/MTES-MCT/ecobalyse)
- [betagouv/mon-entreprise](https://github.com/betagouv/mon-entreprise)
- [betagouv/aides-jeunes](https://github.com/betagouv/aides-jeunes)

L'idée ici est de présenter les prérequis pour que l'administration fasse sa révolution, service par service, pour proposer des modèles de calcul modernes qui fassent référence, fiables et qui profitent un maximum aux autres acteurs.

La plateforme publi.codes, utilisée par plusieurs startups d'État, est construite pour répondre à ces problématiques, mais n'est évidemment pas la seule solution pour un problème aussi vaste !

Cette liste n'est pas exhaustive, c'est davantage un document de travail.

> Le sujet de l'estimation des marges d'erreur, et des sujets spécifiques comme l'estimation de la sensibilité des modèles, ne sont pas abordés car plus spécfiques (notamment mais pas limités aux Analyses de cycle de vie) et secondaires par rapport à ces principes de base, mais pourtant très importants.

## Open source

Publier le code de nos modèles est une [obligation légale](https://guides.etalab.gouv.fr/algorithmes/guide/) portée par la loi République Numérique.

Le versionage du code est essentiel. Pour le faire, le standard c'est Github, ou Gitlab.

> Même si Github est un outil privé Microsoft, l'avantage c'est que la migration vers un des équivalents open source, comme Gitlab, pour plus de souveraineté, est immédiate, et que les membres de l'équipe ont par construction du protocole les donnée.

Le système git+issues+PR en général est incontournable comme outil de versionage, mettre le modèle sur un autre système doit être justifié.

La license permissive (par exemple MIT) est une obligation légale, sauf justification.

Les dépendances doivent elles-mêmes être open source : les outils de compilation, les outils de travail. Si une brique privée est jugée nécessaire (par ex. google spreadsheet) dans la chaine de reproduction, il faut le justfier.

> Par exemple, une dépendance au logiciel SimaPro pour les calculs d'ACV, logiciel qu'il faut acheter, n'est pas acceptable

> Un modèle constitué d'un fichier excel (et d'une éventuelle note d'explication en .doc) peut être qualifié d'ouvert et est évidemment mieux que rien du tout (un seul chiffre sans son explication), mais il n'est pas à proprement parler open source ni versionné. Les collaborateurs se partagent un fichier modèle-déchets.34.2.xlsx pas bien versionné donc, les formules de calcul sont peu lisibles (format excel à exprimer dans le champs texte très restreint, références à des cases alphanumériques non nommées, etc), l'excel fait référence à d'autres excel qu'il faut avoir téléchargé un à un, liens potentiellement cassé si on n'a pas payé Excel, etc.

## Reproductibles

En quelques minutes, tout développeur peut relancer et modifier les calculs sur sa machine, et tout non-développeur peut les lire et comprendre (l'édition des calculs pour les non-développeurs est un défi toujours un peu trop compliqué pour être intégré dans un premier niveau d'exigences).

> Par exemple sur un projet javascript, un `yarn && yarn start` permet de compiler le code et exposer l'interface sur le Web, par exemple nosgestesclimat.fr/documentation -> le calcul tourne sur ma machine, sous mes yeux.
> Sur un projet python, appuyer sur "Run" sur un notebook https://jupyter.org permet de lancer le calcul et visualiser les résultats.
> Javascript est une force, car il est exécutable directement dans le navigateur, mais pas requis : bcp de langages compilent en Javascript (e.g. Elm)

La reproduction implique zéro dépendance de données privées, ou dans le cas contraire, une justification argumentée et une source secondaire publique.

> Le modèle textile d'ecobalyse est utilisable directement sans logiciel, sans license, sans création de compte sur https://ecobalyse.beta.gouv.fr/#/textile/simulator. Son code est disponible et documenté sur github.com/MTES-MCT/ecobalyse

## Documentés, sourcés

Les calculs ("le métier", comme on dit souvent) doivent être documentés avec des sources primaires. Si pas de source primaire, il faut le dire. Si pas de source du tout, ou pas de source de confiance, il faut le dire également.

> À titre d'exemple, le fameux "en réduisant votre chauffage d'un degré, on réduit la consommation d'énergie de 7%" n'est pas sourcé. Sur [nosgestesclimat](https://nosgestesclimat.fr/documentation/logement/baisse-temp%C3%A9rature/gains-1-degr%C3%A9), nous avons franchement indiqué l'absence de source de qualité

Cela permet de bien noter les limites, d'informer les futurs collaborateurs ou relecteurs : c'est une forme d'évaluation qualitative des marges d'erreur.

> Sur publicodes, les variables du calcul contiennent une formule de calcul, une _description_ en texte (ce que fait cette variable) et une _note_ d'implémentation qui décrit les limites connues au moment de l'implémentation, avec potentiellement une liste de tâches déjà identifiée. L'attribut "références" permet de lister des URL constituant des sources ou des moyens d'aller plus loin.

La documentation doit être faite au moins partiellement sur le Web. C'est important : le Web est universel, accessible en 2 clics via une URL fixe et un minimum pérenne, contrairement à n'importe quel programme à installer ou par rapport à un fichier xlsx.

> Par exemple, tous les calculs de mon-entreprise.fr sont disponibles sur https://mon-entreprise.urssaf.fr/documentation
> Toute variable est exposée en ligne https://mon-entreprise.urssaf.fr/documentation/bénéficiaire/dividendes/nets

Il faut pouvoir faire un lien vers un bout de donnée granulaire.

> Par exemple, on ne peut pas référencer via une URL une entrée de la Base Carbone https://bilans-ges.ademe.fr. Ça rend les citations de cette source très compliquées.

L'explication des calculs fait partie des obligations de l'administration, mais les exigences portées par la loi sont peu satisfaisantes : il s'agit seulement d'expliquer si quelqu'un en fait la demande

## Contributifs

Dans de nombreuses situations, des gens que nous ne connaissons pas ont des compétences plus avancées que celles que nous avons eu à disposition dans notre équipe lors de l'écriture et la relecture des modèles. Dans l'industrie ou les éditeurs de logiciels privés, dans la recherche (chercheurs en ACV), dans les administrations, etc.

> Potentiellement leur contribution n'est pas pertinente... mais ce n'est pas grave : si on est noyés sous les retours, on peut toujours les ignorer (on peut par exemple rendre le lien de contribution moins accessible pour augmenter la barrière). C'est un problème sur lequel il faut agir seulement s'il intervient.

C'est le concept de la **revue par les pairs**, absolument central dans la recherche scientifique, qui doit nous inspirer et qui permet de tendre vers le moins d'erreurs possibles tout en favorisant l'évolution permantente.

> Un outil comme github propose des fonctionnalités de collaboration très poussées
>
> - les PR (pull request) permettent de proposer un changement, et c'est d'ailleurs ainsi que les membres coeur de l'équipe itérent
> - chaque bout de code peut dans le cadre d'une PR être commenté en un clic (comme sur google docs). Ce commentaire peut être discuté, résolu. Il peut entrainer une autre PR concurrente, mettre de côté un problème dans une issue, etc.
> - gérer la responsabilité : les rôles de collaboration peuvent être différents, du simple lecteur, à l'administrateur, en passant par la personne qui peut proposer des changements mais pas les mettre en ligne

Bien sûr, il ne suffit pas de poster sur github un ensemble de lignes de code pour satisfaire ce point : il faut que la contribution soit raisonablement accessible. Cela passe par un fichier README, CONTRIBUTING, un Wiki, des tutoriels, éventuellement des événements de découverte, etc.

:::info L'importance du code source

Cela fait des décennies que de nombreux développeurs tentent de trouver un moyen de remplacer le _code source_ par des interfaces qui permettraient d'ouvrir la contribution au-delà des équipes de développeurs. On voit que mis à part l'interface de tableur, rien n'a vraiment émergé. On voit aussi les limites du tableur (pas de variable, mais des cases alphanumériques, qui rompent le principe de base de toute base de code bien faite : nommer les choses).

L'interface de collaboration entre les différents profils d'un projet est un point important, dépendant de chaque projet. Il faut noter que plus une interface devient puissante (permet de faire plein de chose en autonomie), plus sa prise en main ressemble à l'apprentissage du code !

:::

## Modulaires et intéropérables

Plus un modèle est un gros blob non segmenté, moins il est utilisable par des pairs. Le temps d'apréhension d'un modèle vaste est plus important et peut décourager des réutilisateurs.

> Par exemple, nosgestesclimat est aujourd'hui un modèle assez vaste, chargé en bloc sur nosgestesclimat.fr. Nous sommes en train de travailler la modularisation pour pouvoir isoler des briques autonomes, telles que le modèle de calcul de l'empreinte carbone des déchets.

La modularisation permet de bien spécifier les _responsables_ de chaque brique.

Par exemple aujourd'hui, [Datagir](https://datagir.ademe.fr/) (ADEME-Betagouv) est responsable de nosgestesclimat, Ecobalyse (MTE-Betagouv) est responsable de Ecobalyse, mais Datagir pourrait réutiliser le modèle Ecobalyse/alimentation.

Ce principe induit notamment la nécessité de versioner le code, pour que les acteurs tiers puissent faire référence à une version fixe ou faire des mises à jours automatiques selon le versionage sémantique, donc sans risquer des changements cassants.

En pratique, plus le langage et les formats de données du modèle sont standards, plus cette réutilisation est facilitée.

## Conçus pour un objectif utilisateur

Quand on conçoit un modèle, il peut être tentant de vouloir le généraliser au maximum, et ainsi dédier une équipe (qui n'est parfois qu'une personne) à ce modèle, séparée d'une autre équipe qui réalise l'interface branchée sur ce modèle.

Une telle division du travail et conceptuelle est tentante, mais se révèle souvent dans l'informatique très problématique, car on développe alors une brique logicielle en ayant perdu l'objectif premier : servir à un cas utilisateur.

> Par exemple, si l'on me demande de créer un modèle de calcul d'empreinte carbone de l'avion, je vais probablement créer un modèle qui prend en entrée les km parcourus en avion. C'est rationnel, mais très éloigné de l'utilisateur : personne n'est capable de dire combien de km fait son avion entre Paris et Rabat ! Sur nosgestesclimat, le but premier est de servir les utilisateurs, il devient alors logique qu'il faut leur demander de saisir plutôt des _heures_ d'avion, à reconnecter aux km, ou implémenter une saisie d'itinéraires branchée sur des API non triviales. La charge de travail était en fait ailleurs et le modèle trop "deconnecté" !

Ce biais est aussi à surveiller pour un framework d'écriture de modèles. À titre d'exemple, il n'y a pas de développeur dédié au framework publicodes : chacun contribue au framework _pour défendre ses intérêts_ répondant à un usage utilisateur bien précis. L'équipe mon-entreprise l'améliore pour mon-entreprise, l'équipe mesaidesvélo pour mesaidesvélo, l'équipe nosgestesclimat pour nosgestesclimat (tout en gardant évidemment en tête que chaque contribution doit aller dans le bon sens pour une importante majorité).

Ce principe est une variation de [Eat your own dog food](https://en.wikipedia.org/wiki/Eating_your_own_dog_food).

Bref, un modèle doit toujours être accompagné d'une interface d'utilisation, même si cette interface est [dédiée aux experts](https://ecobalyse.beta.gouv.fr/#/textile/simulator) (qui sont un segment utilisateur légitime), et il n'y a pas de raison a priori d'abstraire une équipe hors de l'interface.

## Communiqués

La publicité est requise. Il faut expliquer l'avancement des travaux (kanban / feuille de route publique) et des mises en ligne (notes de version, articles de blog grand public).

> Toutes les nouveautés, ou en tout cas les nouveautés notables de nosgestesclimat (site et modèle, il pourrait être intéressant de segmenter les deux) sont publiés ici nosgestesclimat.fr/nouveautés, qui n'est autre qu'un lecteur branché sur les _releases_ github, inspiré de https://mon-entreprise.urssaf.fr/nouveautés

## Testés

Le sujet des tests est vaste. Souvent lorsque l'on créée un modèle, on n'a pas la référence contre laquelle confronter les résultats de nos modèles, car nous _sommes en train de construire la référence_.

Mais de nombreuses stratégies de test existent pour autant !

- La production de cas types d'usages et le stockage des résultats de calcul à partir de ces cas type, pour estimer à chaque changement si un écart au résultat est un problème ou pas
- Le test unitaire des fonctions de calcul : s'assurer que le _framework_ dans lequel est construit mon modèle est correcte. Somme, multiplication, barème, tableaux de facteurs d'émission, ces fonctions doivent être testées
- L'homogénéité des formules : mon calcul d'empreinte carbone d'une vidéo en streaming, fait à partir de variables typées (heures, heures / jour, kgCO2e/heure) doit _in fine_ produire la bonne unité
- etc.

<!-- TODO Ajouter un lien vers un futur guide : "Tester un modèle publicodes" -->
