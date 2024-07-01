---
sidebar_position: 1
title: Créer un formulaire
---

Publicodes permet de générer un formulaire intéractif tout autant qu’un simulateur affichant une liste de questions. Vous pouvez implémenter l’interface utilisateur la plus adaptée à votre application à partir des informations calculées par le moteur.

## Questions et méta-données

Les questions sont définies via la création d'une règle publicodes :

```yaml
age:
  question: Quel âge avez-vous ?
  type: nombre

# La règle "age" contient la réponse à la question correspondante
personne majeure: age >= 18

prénom:
	question: Quel est votre prénom ?
	type: texte
```

On peut filtrer les règles publicodes pour obtenir uniquement la liste des questions :

```js
const engine = new Publicodes(rules)
const questions = engine.parsedRules.filter(
	(rule) => rule.rawNode.question !== undefined,
)
```

Vu qu'il s'agit de règles publicodes standard, on peut utiliser l'applicabilité pour déterminer la liste des questions à afficher :

```yaml
commande:
commande . bière:
	applicable si: personne majeure
	question: Souhaitez-vous une bière ?
	par défaut: non
```

```js
const questionsToDisplay = questions.filter((question) =>
	engine.evaluate({ 'est applicable': question }),
)
```

<Callout type="caution" title="Composants UI pour afficher un formulaire">

Nous ne proposons pas de bibliothèque de composants graphiques directement interfacés avec Publicodes. En effet sur les différents utilisateurs actuels, le besoin de personnalisation de l'interface est fort, et il n'est pas évident de déterminer quels éléments partager.

Vous devez donc interfacer votre UI avec le moteur Publicodes :

- Pour lire la valeur courante : `engine.evaluate('age')`
- Pour modifier la valeur suite à une saisie de l'utilisateur : `engine.setSituation({ age: 17 })`

À l’avenir, il est possible que nous exportions des fonctions utilitaires pour simplifier ce travail d’interfaçage.
</Callout>

<!-- TODO : parler du typage des règles ou référencer un guide tiers -->

## Variables traversées

L'utilisation de l'applicabilité permet déjà d'afficher ou de cacher des questions en fonction des réponses précédentes. Mais pour certains formulaires par nature très dynamiques, on veut en plus pouvoir ordonner automatiquement les questions.

Là encore, l'implémentation concrète dépendra de chaque application. Mais généralement il faudra prendre en compte les dépendences entre les questions. Ainsi dans l'exemple ci-dessus, on veut d'abord déterminer si la personne est majeure avant de lui demander s'il elle veut commander une bière. Il faut donc poser la question de l'âge en premier.

Pour exploiter cette notion de dépendance des questions, on peut utiliser les **variables manquantes**. Les variables manquantes sont une méta-donnée retournée lors de l'évaluation d'une expression publicodes qui permet de connaître l'ensemble des règles qui interviennent dans son calcul dont la valeur par défaut a été utilisée.

```yaml
commande . vin:
	applicable si:
		toutes ces conditions:
			- personne majeure
			- bière = non
	question: Voulez-vous une bouteille de rouge ?
	par défaut: non
```

On peut évaluer la règle `commande . vin` pour déterminer sa valeur actuelle ainsi que les variables manquantes dans le calcul :

```js
const commandeVin = engine.evaluate('commande . vin')
console.log(commandeVin.nodeValue) // false - la valeur par défaut
console.log(commandeVin.missingVariables) // { 'personne majeure' : <number>, 'bière': <number> }
```

Les missingVariables sont des variables qui n'ont pas de valeur dans la situation courante. On peut donc les utiliser pour déterminer les questions à poser.
Le nombre associé à chaque variable correspond au nombre de fois où elle a été utilisée, et à l'incidence sur le calcul de la règle.

À noter que les variables manquantes disparaitront si on évalue la règle avec une situation complète :

```js
const engine.setSituation({ 'personne majeure': 'oui', 'bière': 'non' })
const commandeVin = engine.evaluate('commande . vin') // { nodeValue: true, missingVariables: {} }
```

<!-- TODO : parler des dépendances statiques engine.rulesDependencies[dottedName] ou référencer un guide tiers sur l’arbre des dépendances -->

<Callout type="info" title="Limites des variables manquantes">

Dans le cas d'un formulaire, les variables manquantes disparaitront au fur et à mesure que l'utilisateur répond aux questions.
Par conséquent, il faudra stocker l'état de la liste des questions initiale (avant que l'utilisateur ne commence à répondre) pour pouvoir continuer à afficher les questions répondues.

Une autre approche est en cours de développement pour connaître la liste des questions à poser, qu'elles ait été répondu ou non dans la situation.

</Callout>
