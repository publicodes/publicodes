# Changelog

## 1.0.0-beta.23

**core**
-   Corrige l'ordre des règles imbriquées dans l'objet parsedRules

## 1.0.0-beta.22

**core**

-   Correction: Build en mode "production"

## 1.0.0-beta.20

**core**

-   Corrige l'omission des types Typescript dans le paquet

## 1.0.0-beta.19

**core**

-   Ajout d'un export `cyclicDependencies` pour permettant de détecter un cycle de références dans les règles

## 1.0.0-beta.18

**core**

-   Export ESM sans dépendance à d'autres formats de module (UMD)

## 1.0.0-beta.17

**core**

-   Prise en compte des variables manquantes pour l'assiette des grilles et barèmes

**publicodes-react**

-   Changement cassant : Le composant `<Documentation />` n'est plus exporté
-   Nouveau composant exporté `<RulePage />` qui affiche une seule page
-   Possibilité de fournir des composants personnalisés pour l'affichage
-   Suppression de la dépendance à react-router et react-helmet
-   Suppression de dépendences utilitaires : ramda, classnames, react-easy-emoji
-   Corrige le style du remplacement dans les sommes
-   Corrige l'affichage des règles remplacées

## 1.0.0-beta.16

**core**

-   Répare un bug dans le mécanisme résoudre le cycle
-   Suppression des variables temporelles
-   Optimisation de la désactivation de branches
-   Meilleures performances

## 1.0.0-beta.15

**core**

-   Fix bug sur le mécanisme minimum, une valeur non applicable n'est plus considérée comme valant "0" (#1493)
## 1.0.0-beta.14

**publicodes-react**

-   Corrige un bug bloquant qui empêchait l'utilisation de la bibliothèque
-   Enlève la dépendance à i18n et react-i18n et toute la traduction qui n'était pas utilisée de toute façon
-   Ajoute des tests et une publication automatique des paquets publicodes

## 1.0.0-beta.13

**core**

-   Ajout d'un nouveau mécanisme : `résoudre la référence circulaire` (#1472)
-   Simplification de l'API de Engine (#1431)

**publicodes-react**

-   Améliore l'affichage des règles virtuelles dépliée dans une somme
-   Ajoute les meta dans les pages de règles (#1411)


**publicodes-react**

-   Meilleur affichage des données manquantes et règles associées dans la documentation
-   Legères retouches visuelles
