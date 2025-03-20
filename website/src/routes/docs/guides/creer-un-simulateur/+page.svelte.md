---
sidebar_position: 2
title: Créer un simulateur
---

<div class="prose-xl prose">

Dans ce tutoriel, nous allons créer un **simulateur de TJM (Tarif Journalier Moyen)** pour freelances en utilisant Publicodes et React.

Vous découvrirez comment Publicodes simplifie la création d'outils de simulation en gardant une logique métier **claire et maintenable**.

</div>

## Ce que nous allons construire

Notre simulateur permettra à l'utilisateur de :

- Saisir son TJM (Tarif Journalier Moyen)
- Indiquer le nombre de jours facturés par mois
- Spécifier ses charges fixes annuelles
- Voir automatiquement le calcul de son chiffre d'affaires et sa rémunération nette

## Prérequis

Pour suivre ce tutoriel, vous aurez besoin de :

- [Node.js](https://nodejs.org/) (version 18 ou supérieure)
- npm, yarn ou pnpm
- Des connaissances de base en JavaScript et React

## Étape 1 : Initialiser le projet

Commençons par créer un nouveau projet React.

```bash
# Créer un nouveau projet React avec Vite
npm create vite@latest simulateur-tjm -- --template react

# Naviguer dans le dossier du projet
cd simulateur-tjm

# Installer les dépendances
npm install
```

Ensuite, installons les dépendances nécessaires pour notre simulateur :

```bash
npm install publicodes @publicodes/forms yaml
```

<Callout type="info" title="Pourquoi yaml ?">

Dans le cadre de ce tutoriel, nous utilisons la bibliothèque `yaml` pour parser les règles Publicodes.

Dans un projet réel, il est conseillé d'utiliser la CLI Publicodes qui facilite la compilation et le développement des règles. Consultez le guide [Créer un modèle](/docs/guides/creer-un-modele) pour plus d'informations sur cette approche.

</Callout>

## Étape 2 : Définir les règles Publicodes

Créons maintenant un fichier pour définir nos règles de calcul avec Publicodes. C'est ici que réside toute la puissance de Publicodes : nous allons définir notre logique métier de manière déclarative, ce qui la rendra facile à comprendre, à maintenir et à faire évoluer.

Créez un fichier `src/rules.js` avec le contenu suivant :

```javascript
// src/rules.js
import { parse } from 'yaml';

// Définition des règles en YAML dans un template string
const rulesText = `
nb jours:
  titre: Nombre de jours facturés par mois
  question: Combien de jours facturez-vous par mois en moyenne ?
  unité: jour facturé/mois

TJM:
  titre: Tarif journalier moyen
  question: Quel est votre tarif journalier ?
  description: Tarif journalier hors taxe facturé à vos clients
  unité: €/jour facturé

CA:
  titre: Chiffre d'affaires mensuel
  valeur: TJM * nb jours
  unité: €/mois

charges fixes:
  question: Quelles sont vos charges fixes ?
  description: Incluez tous vos frais fixes - comptabilité, assurances, locaux, etc.
  par défaut: 10 % * CA
  unité: €/mois

rémunération brute: CA - charges fixes

rémunération nette: rémunération brute - cotisations sociales

cotisations sociales:  rémunération brute * 30%

`;

// Parsing des règles
const rules = parse(rulesText);

export default rules;
```

<Callout type="caution" title="Développement de règles plus complexes">

Pour des modèles plus complexes, il est recommandé d'utiliser

```bash
npx @publicodes/cli init -y
```

Cette commande crée un package Publicodes avec une configuration minimale pour démarrer.
</Callout>

### A retenir :

- Définition des règles métier avec des titres, questions, unité et valeurs par défaut
- Modèle complètement découplé de l'interface utilisateur

## Étape 3 : Créer un formulaire simple avec FormBuilder

Maintenant, utilisons la bibliothèque `@publicodes/forms` pour créer notre formulaire interactif. Cette bibliothèque nous permet de générer automatiquement un formulaire basé sur nos règles Publicodes, en gérant pour nous la logique d'affichage, et les dépendances entre les champs.

### Initialiser l'Engine

Commençons par configurer le moteur Publicodes qui effectuera les calculs. Dans le fichier `src/App.jsx` :

```jsx
import Engine, { formatValue } from 'publicodes';
import rules from './rules';

// Initialiser le moteur Publicodes
const engine = new Engine(rules);
// La règle cible pour le calcul
const TARGET = 'rémunération nette';

export default function App() {
    return (
        <>
            <h1>Simulateur de TJM pour freelance</h1>

            <section>
                <h2>Résultats</h2>
                Rémunération nette : {formatValue(engine.evaluate(TARGET))}
            </section>
        </>
    );
}
```

**À noter :**

- L'Engine est initialisé avec les règles définies dans `rules.js` (un simple objet JavaScript) ;
- Pour calculer la rémunération nette, nous utilisons la méthode `evaluate` ;
- Nous utilisons la fonction `formatValue` pour afficher les résultats de manière lisible avec les unités ;
- L'`Engine` et la règle cible (`TARGET`) sont définis en dehors du composant pour éviter de les recréer à chaque rendu.

Pour modifier la situation utilisée pour le calcul, vous pouvez utiliser la méthode `setSituation` :

```jsx
// src/App.jsx
engine.setSituation({
    'nb jours': 15,
    TJM: 500,
    'charges fixes': 500
});
```

Testez que la page affiche correctement `rémunération nette: 4 900 €/mois` en lançant le serveur de développement :

```bash
npm run dev
```

### Initialiser l'état du formulaire

Ajoutons maintenant l'état initial du formulaire pour commencer à construire notre interface interactive.

```jsx
// src/App.jsx
import Engine, { formatValue } from 'publicodes';
import { FormBuilder } from '@publicodes/forms';
import { useState } from 'react';
import rules from './rules';

// Initialiser le moteur Publicodes
const engine = new Engine(rules);
// La règle cible pour le calcul
const TARGET = 'rémunération nette';
// Form Builder pour gérer le formulaire
const formBuilder = new FormBuilder({ engine });
// Initialiser l'état du formulaire
const initialState = formBuilder.start(FormBuilder.newState(), TARGET);

export default function App() {
    const [formState, setFormState] = useState(initialState);
    return (
        <>
            <h1>Simulateur de TJM pour freelance</h1>
            <h2>Valeurs à renseigner</h2>
            <ul>
                {formBuilder.currentPage(formState).map((element) => (
                    <li key={element.id}>{element.label}</li>
                ))}
            </ul>
            <section>
                <h2>Résultats</h2>
                Rémunération nette : {formatValue(engine.evaluate(TARGET))}
            </section>
        </>
    );
}
```

**A noter**

- FormBuilder analyse automatiquement les règles pour déterminer quelles questions poser
- L'état du formulaire est géré via React useState
- `formBuilder.currentPage(formState)` renvoie les éléments à afficher sur la page actuelle (pour l'instant, il n'y a qu'une seule page)

### Créer un composant pour l'affichage des champs de saisie

Créons maintenant un composant réutilisable pour afficher un champs de saisie de notre formulaire. Il devra afficher le label, l'unité et permettre à l'utilisateur de saisir une valeur.

```jsx
// src/Input.jsx
export default function Input({ element, onChange }) {
    return (
        <div>
            <label htmlFor={element.id}>{element.label}</label>
            <br />
            <input
                id={element.id}
                type="number"
                value={element.value ?? ''}
                onChange={(e) => onChange(element.id, e.target.value)}
            />
            {element.unit && <span>{element.unit}</span>}
        </div>
    );
}
```

<Callout type="info" title="Utilisation d'une bibliothèque de composants">

Il est tout à fait possible d'utiliser des composants existants. Dans ce cas, `Input.jsx` fera le pont entre les éléments du formulaire et les composants de votre bibliothèque.

</Callout>

Intégrez ce composant dans le composant principal `App` :

```jsx
// src/App.jsx

export default function App() {
    const [formState, setFormState] = useState(initialState);

    const handleChange = (id, value) => {
        const newState = formBuilder.handleInputChange(formState, id, value);
        setFormState(newState);
    };

    return (
        <>
            <h1>Simulateur de TJM pour freelance</h1>
            <form>
                {formBuilder.currentPage(formState).map((element) => (
                    <Input
                        key={element.id}
                        element={element}
                        onChange={handleChange}
                    />
                ))}
            </form>
            <section>
                <h2>Résultats</h2>
                Rémunération nette : {formatValue(engine.evaluate(TARGET))}
            </section>
        </>
    );
}
```

**A noter**

- Le changement des valeurs est géré avec `formBuilder.handleInputChange`, qui met à jour la situation de l'Engine et l'état du formulaire lorsque l'utilisateur saisit une valeur.
- Le composant `Input` affiche le label, l'unité et permet à l'utilisateur de saisir une valeur numérique.

## Étape 4 : Gérer les questions conditionnelles

Améliorons maintenant notre simulateur en ajoutant des questions conditionnelles. Cette fonctionnalité est particulièrement utile pour créer des formulaires dynamiques qui s'adaptent aux réponses de l'utilisateur. Dans notre cas, nous allons demander le type de statut du freelance pour calculer les cotisations sociales, avec l'option auto-entrepreneur disponible uniquement si le chiffre d'affaires est inférieur à 70 000 €.

Modifions nos règles pour ajouter cette logique conditionnelle :

```yaml
# Ajoutez ces règles à votre fichier rules.js

cotisations sociales:
  valeur: rémunération brute * taux
  unité: €/mois
  avec:
    taux:
      variations:
        - si: type de statut = 'auto-entrepreneur'
          alors: 24%
        - si: type de statut = 'indépendant'
          alors: 30%
        - si: type de statut = 'sasu'
          alors: 50%

type de statut:
  question: Quel est votre type de statut ?
  une possibilité:
    - auto-entrepreneur:
        applicable si: CA <= 70000 €/an
    - indépendant:
    - sasu:
`;
```

Pour pouvoir utiliser la désactivation de possibilité non applicable, il faut instancier l'engine avec un flag spécifique :

```javascript
// App.jsx
const engine = new Engine(rules, {
    flag: {
        filterNotApplicablePossibilities: true
    }
});
```

Ensuite, pour gérer les questions de type `possibilités`, nous devons ajouter un composant `RadioGroup` :

```jsx
// src/RadioGroup.jsx
export default function RadioGroup({ element, onChange }) {
    return (
        <fieldset>
            <legend>{element.label}</legend>
            {element.options.map((option) => (
                <label key={option.value}>
                    <input
                        type="radio"
                        name={element.id}
                        value={option.value}
                        checked={element.value === option.value}
                        onChange={() => onChange(element.id, option.value)}
                    />
                    {option.label}
                </label>
            ))}
        </fieldset>
    );
}
```

Intégrez ce composant dans le composant principal `App` :

```jsx
// src/App.jsx

export default function App() {
    const [formState, setFormState] = useState(initialState);

    const handleChange = (id, value) => {
        const newState = formBuilder.handleInputChange(formState, id, value);
        setFormState(newState);
    };

    return (
        <>
            <h1>Simulateur de TJM pour freelance</h1>
            <form>
                {formBuilder.currentPage(formState).map((element) => (
                    <FormElement
                        key={element.id}
                        element={element}
                        onChange={handleChange}
                    />
                ))}
            </form>
            <section>
                <h2>Résultats</h2>
                Rémunération nette : {formatValue(engine.evaluate(TARGET))}
            </section>
        </>
    );
}

function FormElement({ element, onChange }) {
    if (element.element === 'RadioGroup') {
        return <RadioGroup element={element} onChange={onChange} />;
    }
    return <Input element={element} onChange={onChange} />;
}
```

Si vous saisissez un TJM et un nombre de jour élévé (par exemple 15 jours à 500€/jour), vous devriez voir disparaître l'option auto-entrepreneur.

### Points clés

- Il est possible de spécifier des règles conditionnelles avec la clause `applicable si`
- Les règles avec plusieurs possibilités peuvent être saisie avec un élément de formulaire spécial « RadioGroup » pour gérer les choix multiples
- Le formulaire s'adapte automatiquement aux réponses de l'utilisateur, en fonction de la logique des règles publicodes

## Naviguer entre les pages du formulaire

Pour les formulaires plus complexes, @publicodes/forms gère automatiquement la pagination. Ajoutons cette fonctionnalité à notre simulateur pour améliorer l'expérience utilisateur, particulièrement utile lorsque le nombre de questions augmente.

Pour l'instant toutes les questions sont sur une seule page. En effet, par défaut, `FormBuilder` regroupe les questions en fonction de leur [espace de nom](/docs/manuel/principe-de-base#espace-de-nom).

Nous allons grouper les questions deux par deux pour créer une pagination.

```jsx
// src/App.jsx

function groupByTwo(array) {
    return array.reduce(
        (result, item, index) =>
            index % 2 === 0 ? [...result, [item, array[index + 1]]] : result,
        []
    );
}

const formBuilder = new FormBuilder({ engine, pageBuilder: groupByTwo });
```

Nous allons ensuite ajouter des boutons "Suivant" et "Précédent" et un indicateur de page courante :

```jsx
// src/App.jsx
export default function App() {
    const [formState, setFormState] = useState(initialState);

    const handleChange = (id, value) => {
        const newState = formBuilder.handleInputChange(formState, id, value);
        setFormState(newState);
    };

    const { current, pageCount, hasNextPage, hasPreviousPage } =
        formBuilder.pagination(formState);

    return (
        <>
            <h1>Simulateur de TJM pour freelance</h1>
            <small>
                Page {current} sur {pageCount}
            </small>
            <form>
                {formBuilder.currentPage(formState).map((element) => (
                    <FormElement
                        key={element.id}
                        element={element}
                        onChange={handleChange}
                    />
                ))}
            </form>
            <div>
                {hasPreviousPage && (
                    <button
                        onClick={() => {
                            setFormState(
                                formBuilder.goToPreviousPage(formState)
                            );
                        }}>
                        Précédent
                    </button>
                )}
                {hasNextPage && (
                    <button
                        onClick={() =>
                            setFormState(formBuilder.goToNextPage(formState))
                        }>
                        Suivant
                    </button>
                )}
            </div>
            <section>
                <h2>Résultats</h2>
                Rémunération nette : {formatValue(engine.evaluate(TARGET))}
            </section>
        </>
    );
}
```

### Points clés

- La pagination est gérée automatiquement par `@publicodes/forms`
- Les méthodes `goToNextPage` et `goToPreviousPage` permettent de naviguer entre les pages du formulaire
- Pour personnaliser la pagination, vous pouvez passer une fonction [`pageBuilder`](/docs/api/forms/type-aliases/pagebuilder) à `FormBuilder`

### Aller plus loin

Félicitations ! Vous avez créé un simulateur de TJM interactif avec Publicodes et React. Vous pouvez maintenant améliorer le style (qui est un peu brut), ou continuer dans une direction plus avancée :

#### Personnaliser l'interface utilisateur

Il est possible de personnaliser l'interface utilisateur directement depuis les règles Publicodes. Il est possible de modifier le type de saisie, les labels, ou encore l'ordre des questions.

Pour cela, vous pouvez ajouter des métadonnées avec la clé `form`.

```yaml
TJM:
    description: |
        Tarif journalier hors taxe facturé aux clients. 
        Généralement entre 300 et 800 €/jour.
    unité: €/jour facturé
    form:
        position: 1
        label: Tarif journalier
        description: Indiquez votre tarif journalier hors taxe
```

> [En savoir plus sur les métadonnées de formulaire](/docs/api/forms/type-aliases/RuleWithFormMeta)

#### Prendre en compte les propriétés additionnelles

Les éléments de formulaires retournés par `formBuilder.currentPage` contiennent de nombreuses propriétés utiles pour personnaliser l'interface utilisateur. Par exemple, vous pouvez utiliser `element.description` pour afficher des informations supplémentaires.

Par ailleurs, certaines propriétés permettent de fournir une experience utilisateur de meilleure qualité, en cachant ou désactivant des éléments en fonction de la situation.

Pour en savoir plus, consultez la [documentation de l'API](/docs/api/forms/classes/formbuilder#currentpage)

#### Ajouter des pages d'explications

La bibliothèque `@publicodes/react-ui` fournit des composants prêts à l'emploi pour afficher des explications de calculs. Pour savoir comment l'utiliser dans le cadre d'une application React, vous pouvez :

- [Lire le guide NextJS](/docs/guides/nextjs) - Pour expliquer les résultats aux utilisateurs
- [Consulter l'exemple sur le repo GitHub](https://github.com/publicodes/publicodes/tree/master/examples/create-react-app)

#### Déplacer le modèle dans un paquet séparé

Pour bénéficier de la meilleure expérience de développement, il est recommandé d'utiliser la CLI Publicodes pour gérer les règles et les modèles. Vous pouvez ensuite les publier sur npm pour les réutiliser dans d'autres projets.

[Voir le tutoriel](/docs/guides/creer-un-modele)
