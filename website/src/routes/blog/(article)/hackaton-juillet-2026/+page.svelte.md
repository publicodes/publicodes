---
title: 'Premier Hackaton'
description: "Cette première semaine de juillet a été pour nous l'occasion de nous regrouper, initier de nouveaux chantiers, et remettre en commun ce projet Publicode v2."
author: L'équipe Publicodes
date: 2026-07-18
tags: nouveautés, langage, V2
icon: 🌱
featured: true
image: /og-images/publicodes-v2.png
---

Cette première semaine de juillet a été pour nous l'occasion de nous regrouper,
initier de nouveaux chantiers, et remettre en commun ce projet Publicode v2.
Grâce aux 10% de temps alloué pour notre R&D internes, nous avons pu réserver
un moment et travailler simultanément sur Publicodes.

Les travaux Publicodes V2 ont été initiés il y a maintenant plus d'un
an. En parallèle de leurs travaux externes, Johan et Emile ont mis en place
le projet, remis à plat, re-designé, et implémenté les différentes
fonctionnalités. Willow a rejoint l'équipe et travaille majoritairement
sur Publicodes depuis plusieurs mois, et Clément de son côté est resté
à distance sur ce projet de refonte. Cette semaine est l'occasion parfaite
pour remettre en commun notre connaissance sur la nouvelle base de code, et
initier de gros chantiers qui demandent de faire des choix de design importants.

Emile et Johan ont eu l'occasion de se retrouver physiquement, tandis que
Clément et Willow sont restés en distanciel. Nous avons toustes été en
vocal presque toute la semaine, et avons rapidement identifié plusieurs
taches sur lesquelles nous pouvions avancer efficacement. La plus importante
étant le démarrage de l'outil de debuging des modèles, mais d'autres
plus modestes était de meilleures entrées en matière pour embarquer
Clément. Nous avons donc formé deux équipes, Willow à mentoré Clément,
et iels ont re-designés et améliorés le mécanisme de `remplace`. Tandis
que Johan et Emile ont travaillé sur l'interface de debug.

## Refonte du Remplace

Le mécanisme de `remplace` permet remplacer une valeur du modèle depuis
un autre endroit. Il est fréquemment utilisé avec le `applicable si` pour
appliquer un `remplace`, ou un autre de façon conditionnelle. Lorsqu'il y
a plusieurs `remplace`, la V1 les trie alphabétiquement, et utilise le
premier qui est applicable.

Pendant cette première phase de la V2, nous avons tenté de rendre plus
explicite l'ordonnancement des `remplace`, en ajoutant une clef `priotité:
x`. Mais nous avons rapidement rencontré des situations où plusieurs centaines
de `remplace` doivent maintenir une valeur de priorité unique. Ajouter un
`remplace` en milieu de chaîne implique donc de modifier toutes les autres
priorités. Ces cas s'accompagnant souvent d'`applicable si` qui les rendent
exclusifs, cette priorité devient donc purement artificielle et contraignante.

Nous avons envisagé plusieurs pistes d'améliorations, plus ou moins
orthogonales entre elles. L'ensemble des changements que nous avons planifié
d'effectuer au cours de cette semaine permet à la fois d'alléger la syntaxe,
tout en rendant plus prédictible l'ordre des `remplace`.

Finalement, on peut simuler le fonctionnement de `priorité` en formant une
chaîne de `remplace`, un `remplace` venant en remplacer un autre. Ici la chaîne
s'arrête au premier cas de non-applicabilité, mais c'est bien là l'unique
différence. Nous avons donc simplement retiré `priorité: x`, et interdit
plusieurs `remplace` de cibler une même règle.

Ensuite pour autoriser des `remplace` qui se veulent exclusifs, nous avons
choisis une approche déclarative. Elle pourra être complêtée à l'avenir par une
vérification statique plus ou moins partielle. En ajoutant `exclusif: oui`, on
indique qu'un seul `remplace` doit être applicable en même temps. Une
vérification est effectuée au runtime pour s'en assurer, et une erreur est
levée dans le cas contraire.

Ainsi, il reste tout à fait possible de former une chaîne de `remplace`
complexe, tout en limitant la verbosité de la syntaxe au maximum:

```yaml
a:
    valeur: 10
b:
    valeur: 20
    remplace: a
c:
    valeur: 30
    remplace: b
    exclusif: oui
    applicable si: ...
d:
    valeur: 50
    remplace: b
    exclusif: oui
    applicable si:
        est non applicable: c
```

<script>
	import graph from './schema1.svg';
</script>
<img src={graph} />
<style>
	.code-graph {
		display: flex;
		justify-content: space-between;
	}
	.code-graph pre {
		width: 40%;
	}
	.code-graph img {
		width: 40%;
	}
</style>

C'est finalement la première fois que Clément et Willow ont eu l'occasion de
travailler ensemble sur un même chantier. Le premier a assez vite pris en
main le langage Ocaml, et les deux ont atteint leurs buts avant même vendredi.
Les commits sont aujourd'hui en phase de review, mais ces travaux devrait se
conclures rapidement.
