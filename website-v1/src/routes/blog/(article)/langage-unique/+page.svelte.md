---
title: Pourquoi publicodes alors que X existe ?
description: Une comparaison de publicodes avec d'autres outils de modélisations utilisés dans l’administration
author: Maël Thomas
date: 2019-04-02
tags: open-data
icon: 👀
image: /og-images/langage-unique.png
---

## X = Moteurs de calcul numérique, comme OpenFisca

Il existe aujourd'hui un certain nombre de simulateurs numériques du système social français. Par exemple INES, développé par l'INSEE. OpenFisca, ouvert, relativement étendu et _collaboratif_ en est un représentant inédit.\*

OpenFisca permet aujourd'hui de faire des simulations économiques (menant à des rapports de politique publique, ou à des travaux de recherche), et des services numériques de type simulateur en ligne. C'est un calculateur numérique : on lui donne une situation (ex. une famille avec deux parents salariés ayant un certain revenu brut et un enfant scolarisé), on lui demande des variables de sortie (ex. le revenu net, le revenu après impôts), et on en obtient les résultats sous forme de liste de couples variable = valeur (ex. revenu du ménage après impôts = 3000€).

OpenFisca est bâti comme le sont beaucoup de serveurs : du code métier (ex. comment votre cotisation de retraite est calculée), et une API Web pour servir des interfaces. Une particularité cependant : le moteur (OpenFisca Core) est (de mieux en mieux) séparé du code métier du pays initial (OpenFisca France), ce qui a permis à d'autres pays ou régions d'ébaucher le code de leur système socio-fiscal (pour l'instant, la Tunisie, le Sénégal, la Catalogne).

Le code métier, comme le moteur d'exécution, est écrit en Python, langage très commun, et en Numpy \*\*. Ces choix historiques entraînent ces limitations importantes :

- les règles (le code représentant la législation) ne sont pas réutilisables en dehors d'OpenFisca (il est très spécifique et surtout difficile à _parser_)
- en conséquence, le moteur est destiné (et limité) à fournir des résultats purement numériques.
- il faut être développeur expérimenté, habitué au calcul vectoriel imposé par Numpy, pour lire ou modifier ces règles. En bref, l'outil fait des calculs bien plus rapides, mais les règles et le moteur sont bien plus complexes.

Le développement de toute une gamme d'applications est fortement compliqué par ces limitations. Un simulateur Web devra recopier la liste des lignes d'une fiche de paie, pourtant présente dans le moteur, pour en afficher les valeurs numériques; on ne peut construire une vue pédagogique dans le navigateur qui explique les calculs; le code métier est ouvert (disponible en ligne) mais très complexe, même pour un développeur; les outils d'exploration de la législation sont très coûteux à construire et maintenir; etc.

Une simplification a été faite dans cet exposé : le code métier est aujourd'hui en partie externalisé dans des paramètres contenant les nombres historisés utilisés par les règles de calcul. Par exemple, les valeurs historisées de votre taux de cotisation de retraite complémentaire, ou celles du SMIC. Contrairement au code métier, ces paramètres sont théoriquement de la donnée facilement exploitable par d'autres applications : on peut par exemple les visualiser sous forme de tableaux. Malheureusement, la loi n'est que rarement si simple, et l'on s'en apercevra vite : les paramètres sont eux même paramétrés... par exemple, il y a deux retraites complémentaires dans le régime général : pour les cadres et les non-cadres. Il y a donc de la logique incrustée dans ces paramètres (liste historique des taux cadres, liste historique des taux non-cadre), exploitée par le code métier pour pouvoir calculer la bonne valeur de votre cotisation retraite.

L'idée de notre projet est de prendre clairement le parti d'inscrire toute la logique métier sous forme déclarative dans de la donnée. Dans notre exemple, c'est toute la description de la retraite et son calcul (des références législatives, un barème à taux marginal, des exceptions etc.) qui seront inscrits dans une base de règles lisible. Différents moteurs d'exécution pourront exploiter cette donnée pour construire les applications aujourd'hui manquantes. Il faut donc définir une nouvelle syntaxe, un format de données interprétable par un programme et assez expressif pour être lisible et agréable à écrire, car il faudra tout réécrire à la main \*\*\* ! Voir ce [paragraphe de la feuille de route](https://github.com/laem/syso/wiki/Feuille-de-route/_edit#-une-base-documentaire-explorable) pour plus d'informations. Un effort de modélisation du domaine est donc nécessaire, d'où le domaine volontairement restreint de ce moteur : les prélèvements sur les salaires.

Ce site présente une première version de cette syntaxe.

Pour aller plus loin, un example d'implémentation d'une fonction de calcul dans ces deux plateformes : [coder un barème](https://github.com/betagouv/publicodes/wiki/Coder-un-barème-:-publicodes-ou-OpenFisca-%3F).

> (\*) il couvre notamment les 3 grands domaines impôts sur le revenu, prestations sociales et prélèvements sur les salaires. Ceci grâce au travail de l'Institut des Politiques Publiques, d'Étalab et de l'Incubateur des Services numériques, services de l'État, ainsi qu'un certain nombre d'autres acteurs.

> (\*\*) Numpy est une brique logicielle qui permet en théorie au moteur de simuler des populations entières (millions d'individus) dix fois plus rapidement. Eh oui, les processeurs qui font tourner nos ordinateurs et smartphones sont souvent mal exploités !

> (\*\*\*) Il est aujourd'hui beaucoup trop coûteux, voir tout simplement impossible, d'écrire un programme qui analyse une base de règles et la transforme en quelque chose de plus lisible.

## X = Créateurs de simulateurs

### G6K

G6K : Générateur de simulateurs de calcul utilisé par [service-public.fr](http://service-public.fr/).

- Code du générateur : https://github.com/eureka2/G6K
- Code généré de plusieurs formulaires de Service-public.fr : https://gitlab.com/pidila/sp-simulateurs-data/tree/master

Outil utilisé par la DILA pour générer plusieurs de ses simulateurs, dont carte grise et gratification minimale d'un stagiaire.

Sa valeur réside dans le fait qu'il permet de créer des simulateurs dans une interface graphique, c'est-à-dire sans coder (enfin presque, une formation est nécessaire), ce qui le rend très intéressant pour un certain nombre de services. Il permet de charger ou d'utiliser des APIs ou bases de données (voir un tableur), de définir les variables du système, d'éditer graphiquement des requêtes sur ces données en fonction des variables, puis les écrans et champs de l'interface (saisie ou résultat), et finalement de définir des règles de calcul.

La grosse différence est dans l'objectif : le but de G6K est de créer des formulaires sur des sujets différents et restreints, mais pas de constituer une grande base de règles (base documentaire lisible et calculable) d'un domaine législatif (comme les cotisations sociales).

La grosse différence de méthode est que les formulaires sont à renseigner entièrement à la main : on construit l'interface de saisie champ par champ, étape par étape. Ici à l'inverse, le formulaire est construit automatiquement à partir des règles législatives.

Les règles de G6K sont aujourd'hui éditables directement sur le Web ! Par contre, on ne peut pour l'instant les écrire et les modifier comme une base de code source.

## X = Créateurs de formulaires

Ces outils se concentre davantage sur le recueil de données : leur capacité de faire des calculs est limitée ou absente.

- l'outil de GDS : un DSL Ruby qui produit des formulaires (je ne retrouve pas le lien !).

- TypeForm ?

- [Téléprocédures simplifiées, TPS](https://tps.apientreprise.fr/)
