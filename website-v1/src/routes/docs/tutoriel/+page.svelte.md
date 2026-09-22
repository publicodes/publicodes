---
sidebar_position: 1
title: Tutoriel
---

## Installation

Publicodes est distribué sous la forme d'une biblitothèque
JavaScript permettant de compiler un jeu de règles
publicodes et de l'évaluer dans une situation donnée.

Le paquet est disponible sur npm.

```bash
npm install publicodes
```

## Premiers pas

<Callout type="tip" title="Activer l'extension VSCode">

Une extension VSCode est disponible pour éditer les fichiers publicodes. Elle
permet de bénéficier de l'autocomplétion et de la documentation des règles.

> Le language serveur est en cours de réécriture, il est possible qu'il ne
> fonctionne pas correctement. En particulier, si vous utilisez le [sytème
> d'import de règles](/docs/manuel/importer-des-regles).

[➡ Installer
l'extension](https://marketplace.visualstudio.com/items?itemName=EmileRolley.publicodes-language-server)

</Callout>

La bibliothèque exporte une classe par défaut `Engine` qui permet d'instancier le moteur avec un
jeu de règles publicodes.

```js
import Engine from 'publicodes';
import { parse } from 'yaml';

// On définit une liste de règles publicodes
const rules = `
prix:
prix . carottes: 2€/kg
prix . champignons: 5€/kg
prix . avocat: 2€/avocat

dépenses primeur:
  formule:
    somme:
      - prix . carottes * 1.5 kg
      - prix . champignons * 500g
      - prix . avocat * 3 avocat
`;
// publicodes ne prend plus en entrée du YAML, vous devez parser vous-même votre code source
const parsedRules = parse(rules);

// On initialise un moteur en lui donnant le publicodes sous forme d'objet javascript.
// Ce publicodes va être parsé
const engine = new Engine(parsedRules);
```

<Callout type="info" title="Précompilation du YAML">

Bien que Publicodes soit basé sur la syntaxe YAML, pour des raisons de performances, l'interpréteur (`Engine`) doit être instancié un objet JSON correspondant au YAML compilé.

Cette étape peut être effectuée en amont de l'utilisation de Publicodes, par exemple lors de la compilation de votre application.

👉 [En savoir plus sur la compilation de modèle Publicodes](/docs/manuel/compilation)

</Callout>

### Évaluer une règle

L'objet `engine` permet en ensuite de calculer la valeur d’une règle avec la méthode `evaluate` :

```js
console.log(engine.evaluate('dépenses primeur'));
```

Cette méthode retourne un objet contenant la valeur de l'expression dans la propriété `nodeValue`, et son
unité dans la propriété `unit`.

Pour un formatage sans effort, on préfèrera utiliser la fonction `formatValue` :

```js
import Engine, { formatValue } from 'publicodes';
// ...
const dépenses = engine.evaluate('dépenses primeur');
console.log(`J'ai dépensé ${formatValue(dépenses)} chez le primeur.`);
```

### Modifier la situation

La méthode `setSituation` permet de forcer la valeur d'une liste de règles. Elle
est utile pour préciser les paramètres spécifiques à une simulation :

```js
// Ici on change le prix des avocats
engine.setSituation({
    'prix . avocat': '3€/avocat'
});
```

La valeur de `dépenses primeur` se base maintenant sur un avocat à 3€ :

```js
// On ré-évalue la règle dans la nouvelle situation
console.log(
    `Nouveau prix ! Dépenses mises à jour: ${formatValue(
        engine.evaluate('dépenses primeur')
    )}.`
);
```

### Évaluation d'expressions

La fonction `evaluate` permet d'évaluer des expressions Publicodes complètes :

```js
// On va au marché une fois par semaine, amortissons la dépense sur 7 jours
const depensesParJour = engine.evaluate('dépenses primeur / 7 jours');
console.log(`J'ai dépensé ${formatValue(depensesParJour)}.`);
```

**Conversion d'unité**

Pour faire une conversion d'unité, il faut
indiquer l'unité désirée via le mécanisme [`unité`](https://publi.codes/documentation/mécanismes#unité) :

```js
// on va au marché une fois par semaine en moyenne, combien dépense-t-on par mois ?
const depensesParMois = engine.evaluate({
    valeur: 'dépenses primeur / 7 jours',
    unité: '€/mois'
});
console.log(`J'ai dépensé ${formatValue(depensesParMois)}.`);
```

<Callout type="info">

[➡ en savoir plus sur les unités](/docs/manuel/unites)

</Callout>

### Variables manquantes

Publicodes calcule automatiquement les dépendances de chaque règle. Si la
valeur d'une dépendance est manquante et ne permet pas de faire le calcul, elle
apparaîtra dans la propriété `missingVariables` :

```js
const missingYEngine = new Engine({
    x: 'y + 5',
    y: null
});

console.log(missingYEngine.evaluate('x').missingVariables);
```

Cette information est utile pour intégrer Publicodes à votre application.

<!--
Il est aussi possible d'utiliser des valeurs par défaut. Dans ce cas la règle
sera calculée avec la valeur par défaut de sa dépendance, mais cette dernière
apparaîtra tout de même dans les `missingVariables`. Cette fonctionnalité est
utile pour réaliser des simulateurs où l'on veut proposer un résultat sans
attendre que l'utilisateur ait répondu à l'intégralité des questions tout en
utilisant la liste des variables manquantes pour déterminer les questions
restant à poser. -->

Les variables manquantes sont calculées lors de l'évaluation. Si une variable
apparaît dans la formule de calcul d'une règle elle ne sera rapportée que si
elle est effectivement nécessaire au calcul. Si elle est présente dans une
portion non active de l'évaluation (par exemple dans un bloc condition non
actif, ou la tranche d'un barème non actif) elle sera filtrée et n'apparaîtra
pas dans les `missingVariables`.

<Callout type="info">

Un "score" est attribué à chacune de ces variables manquantes. Ce score traduit le poids de la règle dans le calcul de la variable évaluée et est calculé selon une heuristique propre à Publicodes. Il prend en compte notamment le nombre d'occurences de la variable dans le calcul, le nombre de règles qui dépendent de cette variable, sa présence dans certains mécanismes. Ainsi, et à titre d'exemple, une variable qui conditionne l'applicabilité d'une autre sera prioritaire dans la liste des variables manquantes.

</Callout>

### Documentation interactive

Publicodes génère également pour vous une documentation interactive, très
facilement intégrable dans une app React. Pour cela, il vous suffit d'importer
le composant dédié, et passer l'`engine` à afficher dans les props.

Il faut commencer par installer la librairie `publicodes-react` :

```bash npm2yarn
npm install publicodes-react
```

Puis configurer le router en ajoutant les pages de documentations :

```jsx
import { BrowserRouter as Router, Link } from 'react-router-dom';
import { RulePage } from '@publicodes/react-ui';
import rules from './rules.yaml';

const engine = new Publicodes(rules);
function MonApp() {
    return (
        <Router>
            <Route
                path="documentation/:name+"
                render={({ match }) => (
                    <RulePage
                        engine={engine}
                        documentationPath="/documentation"
                        rulePath={match.params.name}
                        renderers={{ Link }}
                    />
                )}
            />
            {/* Composants de l'app */}
        </Router>
    );
}
```

> Note : si vous utilisez Next.js, utilisez l'option renderers suivante :

```js
renderers={{ Link: ({ to, ...rest }) => <Link href={to} {...rest} /> }}
```

Vous pourrez ensuite faire un lien vers la documentation avec le composant
`RuleLink`.

```jsx
import { Link } from 'react-router-dom';
import { RuleLink } from '@publicodes/react-ui';

function MesDépenses() {
    return (
        <p>
            Accéder aux{' '}
            <RuleLink
                dottedName={'dépenses primeur'}
                engine={engine}
                documentationPath={'/documentation'}
                linkComponent={Link}
            />
        </p>
    );
}
```
