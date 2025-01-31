---
sidebar_position: 3
title: Liste des mécanismes
---

## `applicable si`

**Mécanisme chaîné** ([plus d’infos](/docs/manuel/mecanismes#mécanismes-chaînés))

Renvoie `non` si la condition est égale à `non`. Renvoie la valeur sinon.

Permet de désactiver une règle ou une valeur.

```publicodes title="Exemple"
ancienneté: 4 mois
prime de vacances:
  applicable si: ancienneté >= 1 an
  valeur: 200€
```

## `non applicable si`

**Mécanisme chaîné** ([plus d’infos](/docs/manuel/mecanismes#mécanismes-chaînés))

Renvoit `non` si la condition n’est pas égale à `non`

Permet de désactiver une règle ou une valeur.

```publicodes title="Exemple"
ancienneté: 4 mois
prime de vacances:
  non applicable si: ancienneté < 1 an
  valeur: 200€
```

## `est non défini`

Renvoit `oui` si la valeur est non définie.

```publicodes title="Exemple"
age:
age inconnu:
  est non défini: age
```

## `est défini`

Renvoit `oui` si la valeur est non définie.

```publicodes title="Exemple"
age: 15 ans
age connu:
  est défini: age
```

## `est non applicable`

Renvoit `oui` si la valeur est non applicable.

<Callout type="info" title="Note">

La valeur booléenne `non` est applicable. Ce mécanisme est donc différent que la comparaison `valeur = non`.
[En savoir plus sur l’applicabilité](/docs/manuel#applicabilité)

</Callout>

```publicodes title="Exemple"
exonérations: oui
exonérations . lodeom: non

lodeom non applicable:
  est non applicable: exonérations . lodeom
```

## `est applicable`

Renvoit `oui` si la valeur est applicable.

<Callout type="info" title="Note">

La valeur booléenne `non` est applicable. Ce mécanisme est donc différent que la comparaison `valeur != non`.
[En savoir plus sur l’applicabilité](/docs/manuel#applicabilité)

</Callout>

```publicodes title="Exemple"
exonérations: oui
exonérations . lodeom: non

lodeom applicable:
  est applicable: exonérations . lodeom
```

## `une de ces conditions`

Renvoie `oui` si l’une des règles listées est _applicable_.

Équivaut à un `ou` logique.

```publicodes title="Exemple"
âge: 17 ans
mineur émancipé: oui
est majeur:
  une de ces conditions:
    - âge >= 18 ans
    - mineur émancipé
```

## `toutes ces conditions`

Renvoie `oui` si toutes toutes les règles listées sont _applicables_.

Équivaut à un `et` logique.

```publicodes title="Exemple"
âge: 17 ans
citoyenneté française: oui
peut voter:
  toutes ces conditions:
    - citoyenneté française
    - âge >= 18 ans
```

## `produit`

Produit des facteurs de la liste.

Si un des facteur n’est pas applicable, le produit est non applicable.

### Utilisation

```yaml
produit:
    - <facteur 1>
    - <facteur 2>
    - ...
```

```publicodes title="Exemple"
volume:
  produit:
    - 2.5 m
    - 3 m
    - 4 m
```

## `variations`

Contient une liste de conditions (`si`) et leurs conséquences associées
(`alors`), ainsi qu’un cas par défaut (`sinon`).

Pour la première condition vraie dans la liste, on retient la valeur qui lui
est associée.

Si aucune condition n’est vraie, alors ce mécanisme renvoie implicitement
`non`.

Ce mécanisme peut aussi être utilisé au sein d’un autre mécanisme avec des attributs,
tel que `produit` ou `barème`.

### Utilisation

```yaml
- si: <condition à vérifier>
  alors: <consequence évaluée si la condition est vrai>
- ...
- sinon: <consequence évaluée si aucune des conditions précédente n'était applicable>
```

```publicodes title="Exemple"
taux réduit: oui
taux majoré: non

taux allocation familiales:
  variations:
    - si: taux réduit
      alors: 3.45%
    - si: taux majoré
      alors: 10%
    - sinon: 5.25%
```

## `somme`

Somme de chaque terme de la liste.

Si un des termes n’est pas applicable, il vaut zéro.

On peut retrancher des valeurs grâce à l’opérateur unaire `-`

```publicodes title="Exemple"
exemple:
  somme:
    - 15.89 €
    - 12% * 14 €
    - (-20 €)
```

```publicodes title="Terme non applicable"
a: 50 €
b:
  applicable si: non
  valeur: 20 €

somme:
  somme:
    - a
    - b
    - 40 €
```

## `moyenne`

Moyenne de chaque terme de la liste.

Un terme non applicable n'est pas comptabilisé dans la moyenne.

```publicodes title="Exemple"
exemple:
  moyenne:
    - 15.89 €
    - 15% * 14 €
    - (-20 €)
```

```publicodes title="Terme non applicable"
a: 50 €
b:
  applicable si: non
  valeur: 20 €

moyenne:
  moyenne:
    - a
    - b
    - 40 €
```

## `le maximum de`

Renvoie la valeur numérique de la liste de propositions fournie qui est la
plus grande.

Pour ajouter un plancher à une valeur, préférer l’utilisation du
mécanisme [`plancher`](#plancher).

```publicodes title="Exemple"
max:
  le maximum de:
    - 50
    - 100
```

## `le minimum de`

Renvoie la valeur numérique de la liste de propositions fournie qui est la
plus petite.

Pour plafonner une valeur, préférer l’utilisation du mécanisme [`plafond`](#plafond).

```publicodes title="Exemple"
min:
  le minimum de:
    - 50
    - 100
```

## `arrondi`

**Mécanisme chaîné** ([plus d’infos](/docs/manuel/mecanismes#mécanismes-chaînés))

Arrondit à l’entier le plus proche, ou à une précision donnée.

```publicodes title="Exemple"
arrondi:
  arrondi: oui
  valeur: 12.45
```

```publicodes title="Nombre de décimales"
arrondi:
  arrondi: 2 décimales
  valeur: 2 / 3
```

## `contexte`

Spécifie le contexte d'évaluation d'une règle.

Permet d'effectuer l'évaluation d’une règle en écrasant les valeurs
par défaut ou présente dans la situation.

### Exemple

On peut par exemple, calculer le montant des cotisations au niveau du SMIC,
même si le salaire est plus élevé dans la situation actuelle.

```publicodes
brut: 2000€

cotisations: brut * 20%

cotisations pour un SMIC:
  valeur: cotisations
  contexte:
    brut: 1500 €
```

## `barème`

par son utilisation dans le calcul de l’impôt sur le revenu.

L’assiette est décomposée en plusieurs tranches, qui sont multipliées par un
taux spécifique et enfin additionnées pour donner le résultat.

Les tranches sont souvent exprimées sous forme de facteurs d’une variable
que l’on appelle `multiplicateur`, par exemple une fois le plafond de la
sécurité sociale.

### Exemple

```publicodes title="Sans multiplicateur"
revenu imposable: 54126 €
impôt sur le revenu:
  barème:
    assiette: revenu imposable
    tranches:
      - taux: 0%
        plafond: 9807 €
      - taux: 14%
        plafond: 27086 €
      - taux: 30%
        plafond: 72617 €
      - taux: 41%
        plafond: 153783 €
      - taux: 45%
```

```publicodes title="Avec multiplicateur"
assiette retraite: 54004 €
plafond sécurité sociale: 41136 €
cotisation retraite:
  barème:
    assiette: assiette retraite
    multiplicateur: plafond sécurité sociale
    tranches:
      - taux: 17.75%
        plafond: 1
      - taux: 0.6%
  arrondi: oui
```

## `grille`

C’est un barème sous la forme d’une grille de correspondance simple. C’est
le mécanisme de calcul de l’impôt neutre, aussi appelé impôt non
personnalisé.

Il est composé de tranches qui se suivent. Il suffit de trouver la tranche qui correspond à l’assiette, et de selectionner le montant associé à cette tranche.

```publicodes title="Exemple"
SMIC horaire: 10 €/heures
revenu cotisé: 1900€/an
trimestres validés:
  unité: trimestres validés/an
  grille:
    assiette: revenu cotisé
    multiplicateur: SMIC horaire
    tranches:
      - montant: 0
        plafond: 150 heures/an
      - montant: 1
        plafond: 300 heures/an
      - montant: 2
        plafond: 450 heures/an
      - montant: 3
        plafond: 600 heures/an
      - montant: 4
```

## `taux progressif`

Ce mécanisme permet de calculer un taux progressif. On spécifie pour chaque
tranche le plafond et le taux associé. Le taux effectif renvoyé est calculé
en lissant la différence de taux entre la borne inférieure et supérieure de
l’assiette.

Par exemple, si nous nous avons les tranches suivantes :

- taux: 50% / plafond: 0
- taux: 100% / plafond: 1000

Pour une assiette de 500, le taux retourné sera 75%, car il correspond au
taux situé à la moitié de la tranche correspondante.

```publicodes title="Exemple"
chiffre d'affaires: 30000 €/an
plafond: 3000 €/mois
taux réduction de cotisation:
  taux progressif:
    assiette: chiffre d'affaires
    multiplicateur: plafond
    tranches:
      - taux: 100%
        plafond: 75%
      - taux: 0%
        plafond: 100%
```

## `abattement`

**Mécanisme chaîné** ([plus d’infos](/docs/manuel/mecanismes#mécanismes-chaînés))

Permet de réduire le montant d’une valeur.

Le résultat vaudra toujours au moins zéro, y compris quand le montant de l’abattement est plus grand que le montant abattu.

Il est possible d’utiliser le mécanisme `abattement` de deux manières :

- soit en indiquant un montant de la même unité que la valeur, qui lui sera alors soustrait
- soit en indiquant un pourcentage qui sera utilisé pour calculer l’abattement de manière relative

### Exemple

```publicodes title="Abattement simple"
revenu imposable:
  valeur: 10000€
  abattement: 2000€
```

```publicodes title="Abattement supérieur à la valeur"
revenu imposable:
  valeur: 1000€
  abattement: 2000€
```

```publicodes title="Abattement relatif"
revenu imposable:
  valeur: 2000€
  abattement: 10%
```

## `plancher`

Applique un minimum à une valeur.

**Mécanisme chaîné** ([plus d’infos](/docs/manuel/mecanismes#mécanismes-chaînés))

```publicodes title="Exemple"
temperature mesurée:
  valeur:  -500 °C
  plancher: -273.15 °C
```

## `plafond`

Applique un maximum à une valeur.

**Mécanisme chaîné** ([plus d’infos](/docs/manuel/mecanismes#mécanismes-chaînés))

```publicodes title="Exemple"
déduction fiscale:
  valeur: 1300 €/mois
  plafond: 200 €/mois
```

## `durée`

Permet de calculer la durée entre deux dates (la dernière date est exclue)

Lorsqu'une des dates est omise, la date du jour est utilisée.

Il est possible de spécifier une unité pour le calcul de la durée. Les valeurs possibles sont :

- `jour` : jours entre les deux dates (par défaut)
- `mois` : mois complet (les mois incomplets sont proratisés par rapport à leur nombre de jours)
- `trimestre` : trimestres entre les deux dates (nombre de mois / 3)
- `an` : année complète (prend en compte les années bissextiles)
- `année civile` : nombre d'années civiles écoulées entre les deux dates
- `trimestre civil` : nombre de trimestres civils écoulées entre les deux dates

### Exemple

```publicodes title="Durée entre deux dates"
durée de 2024:
  durée:
    depuis: 01/01/2024
    jusqu'à: 01/01/2025

durée de 2024 en années:
  durée:
    unité: an
    depuis: 01/01/2024
    jusqu'à: 01/01/2025
```

```publicodes title="En ommettant une date"
date d'embauche: 12/04/2008
ancienneté:
  durée:
    unité: an
    depuis: date d'embauche
```

```publicodes title="Durée civile"
date de création: 31/12/2023
durée d'activité en année civile:
  durée:
    unité: année civile
    depuis: date de création
```

## `unité`

**Mécanisme chaîné** ([plus d’infos](/docs/manuel/mecanismes#mécanismes-chaînés))

Permet de convertir explicitement une unité.

Affiche un avertissement si la conversion n’est pas possible à cause d’unités incompatibles.

```publicodes title="Exemple"
salaire:
  valeur: 35 k€/an
  unité: €/mois
```

## `par défaut`

**Mécanisme chaîné** ([plus d’infos](/docs/manuel/mecanismes#mécanismes-chaînés))

Permet de donner une valeur par défaut pour le calcul, sans influer sur les variables manquantes retournées.

```publicodes title="Exemple"
prix HT: 50 €
prix TTC:
  assiette: prix HT * (100% + TVA)
TVA:
  par défaut: 20%
```

## `texte`

Permet de mettre en forme un texte avec des expressions évaluée dynamiquement.
Ce principe est connu en informatique sous le nom d’interpolation de chaine de
caractères.

### Exemple

```publicodes title="Texte documentation dynamique" selectedRuleInDoc="aide vélo"
aide vélo:
  texte: >
    La région subventionne l’achat d’un vélo à hauteur de
    {{ prise en charge }} et jusqu’à un plafond de {{ plafond }}.
    Les éventuelles aides locales déjà perçues sont déduites de
    ce montant.

    Par exemple, pour un vélo de {{ exemple }}, la région vous
    versera {{
      exemple * prise en charge
    }}.

  avec:
    prise en charge: 50%
    plafond: 500 €
    '[privé] exemple': 250 €
```

<Callout type="tip" title="Éviter les doubles quotes">

On peut utiliser ce mécanisme pour éviter d’avoir à [échapper les doubles quotes](/docs/manuel/types#texte) dans un texte.

```publicodes
# ces deux règles sont équivalentes :

exemple 1:
  valeur: "'Ministère de la transition écologique et solidaire'"

exemple 2:
  texte: Ministère de la transition écologique et solidaire

```

</Callout>

## `inversion numérique`

**Mécanisme chaîné** ([plus d’infos](/docs/manuel/mecanismes#mécanismes-chaînés))

Il est souhaitable de rédiger les règles de calcul
en publicodes de la même façon qu’elles sont décrites dans la loi ou les
interprétations administratives ou juridiques existantes. En conséquence,
certaines variables n’auront donc pas de méthode de calcul clairement
explicitée, il s’agira donc de la déduire des autres valeurs renseignées.

De façon simplifiée, il s’agira donc, à partir d’une règle existante
explicitant `y = ƒ(x)` de calculer `x` à partir de `y`.

L’inversion numérique permet d’estimer la valeur de la variable en question
au plus près à partir d’un des _objectifs_, listés dans les arguments.
Il faut alors renseigner une valeur cible pour ces objectifs.

L’algorithme utilisé est la [méthode de
Brent](https://fr.wikipedia.org/wiki/M%C3%A9thode_de_Brent). L’idée générale
est de prendre une valeur au hasard pour la variable en question, et
d’améliorer mathématiquement le choix jusqu’à ce que les valeurs cibles
soient toutes suffisamment proches des objectifs. La tolérance entre le choix et les valeurs cibles peut être configuré avec `tolérance d'erreur` (par défaut: `0.1`).

```publicodes title="Exemple tolérance d'erreur"
a: b + 10
b:
  inversion numérique:
    avec:
      - a
    tolérance d'erreur: 1
```

<Callout type="caution" title="Améliorer les performance">

L'inversion est un mécanisme couteux en temps de calcul. Afin d'optimiser ses performances, il est possible d'utiliser le champ `min` (par défaut: `-1000000`) et/ou `max` (par défault: `100000000`) afin de limiter à une certaine plage la valeur au hasard choisi en début de calcul.

Par exemple, si on sait qu'une valeur est forcément positive, on peut préciser `min: 0`.

```publicodes title="Exemple min/max"
a: b + 10
b:
  inversion numérique:
    avec:
      - a
    min: 0
    max: 100000
```

Cela a permis une amélioration du temps de calcul de 25% des inversions complexes.

</Callout>

Si on demande au moteur la valeur d’une variable qui a pour formule une
inversion, il va vérifier qu’une des variables `avec` a bien une valeur
(calculée ou saisie), et procéder à l’inversion décrite plus haut à partir
de celle-ci. Sinon, ces possibilités d’inversions seront listées comme
manquantes.

## résoudre la référence circulaire

Active le calcul itératif pour trouver la valeur de la règle qui résout
la référence circulaire.

Il est possible pour une règle de se référencer elle-même. Par défaut, le
moteur considère qu’il s’agit d’un cycle non voulu, et renvoie ‘undefined’ comme valeur
pour la règle en question, en affichant un avertissement.

Mais dans certains cas, la formule est bonne et le cycle est voulu. La valeur de la
règle attendue est donc celle qui résout l’équation obtenue via la référence cyclique.

Lorsque l’on active cette fonctionnalité, le moteur va procéder par essai-erreur jusqu’à
trouver cette valeur.

Note : la résolution de cycle est coûteuse en temps de calcul. Il faut donc veiller à
ne pas la cumuler avec l’évaluation d’un autre mécanisme coûteux comme l’inversion numérique
par exemple.

```publicodes title="Exemple"
x:
  valeur: 4 * x - 5
  résoudre la référence circulaire: oui
```

```publicodes title="Calcul du revenu professionnel"
chiffre d'affaires: 10000 €/an

cotisations: 25% * revenu professionnel

revenu professionnel:
  valeur: chiffre d'affaires - cotisations
  résoudre la référence circulaire: oui
  unité: €/an
```
