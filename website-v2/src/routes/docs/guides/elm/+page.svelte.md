---
title: Utiliser Publicodes dans un projet Elm
author: Emile Rolley
---

# {title}

# Pourquoi ?

### Elm

[Elm](https://elm-lang.org/) est un langage de programmation purement
fonctionnel qui est compilé en JavaScript. Il est volontairement frugale en
fonctionnalités dans le but de faciliter la prise en main et de garantir la
maintenabilité des applications. Il y a généralement qu'une seule façon de faire
les choses en Elm, et c'est souvent la meilleure.

> **Tips** : [ekofest.fr](https://ekofest.fr) est un exemple de projet utilisant
> Elm et Publicodes.

### Le problème

La principale difficulté de l'utilisation de Publicodes dans un projet Elm et la
raison d'être de ce guide est que Publicodes est un langage interprété, et que
le seul interpréteur disponible actuellement est en JavaScript. Or, Elm étant un
langage purement fonctionnel, **il n'est pas possible d'appeler une fonction
JavaScript directement depuis Elm**.

### La solution

Pour cette raison nous allons devoir utiliser des
[`ports`](https://guide.elm-lang.org/interop/ports) pour communiquer entre
l'application Elm et l'interpréteur Publicodes.

> Pour la suite de ce guide, nous supposerons que vous êtes déjà familier avec
> Elm et possédez déjà une application Elm fonctionnelle à laquelle vous
> souhaitez y intégrer Publicodes.

## Appel de Publicodes depuis Elm

> **En résumé** :
>
> La base de l'utilisation de Publicodes depuis l'application Elm consiste à
> instancier un moteur Publicodes en JavaScript, qui étends la classe `Engine`
> en y ajoutant la synchronisation avec Elm via des `ports`.
>
> Pour cela, nous aurons besoin :
>
> 1.  d'un `port` (_command_) pour appeler la méthode souhaitée de l'interpréteur
>     Publicodes,
> 2.  d'un `port` (_subscription_) pour recevoir le résultat de l'appel,
> 3.  d'un `decoder` et d'un `encoder` pour convertir les données entre Elm et
>     JavaScript, comme par exemple la situation ou le jeu de règles.
>
> Un exemple de projet réel utilisant cette méthode est disponible
> [ici](https://github.com/ekofest/ekofest).

### Installation de Publicodes

Pour commencer, il vous faudra installer Publicodes dans votre projet Elm. Pour
ce faire, vous pouvez utiliser npm ou yarn :

```bash
yarn add publicodes
```

### Initialisation de l'interpréteur Publicodes et de l'application Elm

Pour commencer, nous allons devoir instancier un moteur Publicodes et préciser à
l'application Elm les règles du modèle à utiliser, ainsi que la situation de
départ.

> **Rappel** : la `situation` dans un projet Publicodes est un objet JavaScript
> qui contient les réponses aux questions de l'utilisateurice.

#### Initialisation du code JavaScript

Commencez par créer un fichier `main.ts` si vous n'en avez pas déjà un, et
ajoutez-y le code suivant.

Pour cet exemple, nous utilisons le plugin Vite
[`vite-plugin-elm`](https://github.com/hmsk/vite-plugin-elm), ainsi nous pouvons
importer directement le fichier Elm `Main.elm` dans notre fichier TypeScript :

```typescript
// main.ts
import { Elm } from './Main.elm';
import Engine, { Situation } from 'publicodes';
```

Ensuite, nous utilisons un paquet NPM pour importer les règles du modèle (vous
pouvez aussi les importer depuis un fichier JSON local ou une API) :

> **Remarque** : pour publier un modèle sur NPM et ainsi pouvoir séparer le
> modèle Publicodes du code de votre application, vous pouvez suivre le
> [guide dédié](https://publi.codes/docs/guides/model-template).

```typescript
// main.ts
import rules from 'publicodes-evenements';
```

Enfin, nous pouvons instancier le moteur Publicodes ainsi que l'application Elm
:

```typescript
// main.ts

// (optionnel) Récupération de la situation sauvegardée dans le localStorage
const situation = JSON.parse(localStorage.getItem('situation') ?? '{}');

const engine = new Engine(rules).setSituation(situation);

const app = Elm.Main.init({
    flags: { rules, situation },
    node: document.getElementById('app')
});
```

Vous avez à présent instancié le moteur Publicodes et l'application Elm.
Cependant, les règles du modèle et la situation de départ passées à
l'application via les `flags` ne sont pas encore utilisées.

#### Initialisation de l'application Elm

Pour utiliser les règles du modèle et la situation de départ dans l'application
Elm, nous allons devoir les récupérer via les `flags` et les stocker dans le
`Model` de l'application :

```elm
-- Main.elm

type alias Flags =
    { rules : P.RawRules
    , situation : P.Situation
    }


flagsDecoder : Json.Decode.Decoder Flags
flagsDecoder =
    Json.Decode.succeed Flags
        |> Decode.required "rules" P.rawRulesDecoder
        |> Decode.required "situation" P.situationDecoder


type alias Model =
    { rules : P.RawRules
    , situation : P.Situation
    , evaluations : Dict P.RuleName P.NodeValue
    , result : Maybe P.NodeValue
    , errorMsg : Maybe String
    }


emptyModel : Model
emptyModel =
    { rules = Dict.empty
    , situation = Dict.empty
    , evaluations = Dict.empty
    , result = Nothing
    , errorMsg = Nothing
    }


init : Json.Encode.Value -> ( Model, Cmd Msg )
init flags =
    case Json.Decode.decodeValue flagsDecoder flags of
        Ok { rules, situation } ->
            ( { emptyModel | rules = rules, situation = situation }
            , Effect.evaluateAll (Dict.keys rules)
            )

        Err e ->
            ( { emptyModel | errorMsg = Just (Json.Decode.errorToString e) }
            , Cmd.none
            )
```

#### Cas n°1 : Mettre à jour la situation

Maintenant que nous avons d'un côté le moteur et de l'autre l'application Elm,
nous allons devoir synchroniser les deux pour que la situation de l'application
Elm soit toujours à jour avec celle du moteur.

Pour cela, nous allons créer un `port` Elm qui permettra de mettre à jour la
situation du moteur à chaque fois que la situation de l'application Elm est
modifiée. Ainsi, qu'une souscription qui permettra de notifier l'application Elm
que la situation du moteur a été mise à jour.

```elm
-- Effect.elm

port module Effect exposing (..)

import Json.Encode
import Publicodes as P

-- COMMANDS

port updateSituation : ( P.RuleName, Json.Encode.Value ) -> Cmd msg

-- SUBSCRIPTIONS

port situationUpdated : (() -> msg) -> Sub msg
```

Ainsi, à chaque nouvelle réponse de l'utilisateurice, nous pouvons envoyer la
commande correspondante :

```elm
-- Main.elm

type Msg
    = NewAnswer ( P.RuleName, P.NodeValue )

update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        NewAnswer ( rule, value ) ->
            ( { model | situation = Dict.insert rule value model.situation }
            , Effect.updateSituation ( rule, P.nodeValueEncoder value )
            )
```

Côté JavaScript, nous allons devoir écouter les messages envoyés par le `port`
`updateSituation` et mettre à jour la situation du moteur Publicodes :

```typescript
app.ports.updateSituation.subscribe(([rule, value]: [RuleName, PublicodesExpression]) => {
    const newSituation = { ...engine.getSituation(), [rule]: value };
    engine.setSituation(newSituation);
    // (optionnel) localStorage.setItem('situation', JSON.stringify(newSituation));
    app.ports.situationUpdated.send(null);
});
```

### Cas n°2 : Évaluer les règles

Maintenant que nous avons synchronisé la situation, nous devons évaluer les
règles du modèles à chaque fois que la situation est mise à jour.

Pour cela, nous allons créer un nouveau `port` Elm qui permettra de demander
l'évaluation d'une règle du modèle, ainsi qu'une souscription qui permettra de
recevoir le résultat de l'évaluation.

```elm
-- Effect.elm

-- COMMANDS

port evaluateAll : List (P.RuleName) -> Cmd msg

-- SUBSCRIPTIONS

port evaluatedRules : (List ( P.RuleName, Json.Encode.Value ) -> msg) -> Sub msg
```

Ainsi, à chaque fois que l'application Elm est notifiée que la situation a été
mise à jour, nous pouvons demander l'évaluation de toutes les règles du modèle :

```elm
-- Main.elm

type Msg
    = NewAnswer ( P.RuleName, P.NodeValue )
    | Evaluate
    | UpdateEvaluations (List ( P.RuleName, Json.Encode.Value ))
    | NoOp


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        NewAnswer ( rule, value ) ->
            ( { model | situation = Dict.insert rule value model.situation }
            , Effect.updateSituation ( rule, P.nodeValueEncoder value )
            )

        Evaluate ->
            -- On demande l'évaluation de toutes les règles du modèle Publicodes
            ( model, Effect.evaluateAll (Dict.keys model.rules) )

        UpdateEvaluations evaluations ->
            -- On met à jour les évaluations des règles stockée dans le Model
            ( List.foldl updateEvaluation model evaluations
            , Cmd.none
            )

        NoOp ->
            ( model, Cmd.none )


updateEvaluation : ( P.RuleName, Json.Encode.Value ) -> Model -> Model
updateEvaluation ( name, encodedValue ) model =
    case Json.Decode.decodeValue P.nodeValueDecoder encodedValue of
        Ok eval ->
            { model | evaluations = Dict.insert name eval model.evaluations }

        Err e ->
            { model | errorMsg = Just (Json.Decode.errorToString e) }


subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.batch
        [ Effect.situationUpdated (\_ -> Evaluate)
        , Effect.evaluatedRules UpdateEvaluations
        ]
```

## Utilisation de `@publicodes/react-ui` pour la documentation

Publicodes propose une librairie React
[`@publicodes/react-ui`](https://publi.codes/docs/api/react-ui) qui permet
d'afficher [une documentation interactive](https://ekofest.fr/documentation) des
règles du modèle. Malheureusement, on ne peut pas utiliser directement des
composants React depuis une application Elm.

Pour contourner ce problème, nous allons utiliser les
[`customElements`](https://guide.elm-lang.org/interop/custom_elements.html).

Avec les `customElements`, nous pouvons créer des composants HTML personnalisés
qui peuvent être utilisés dans n'importe quelle application JavaScript, y
compris une application Elm.

### Création du composant `RulePage`

Pour commencer, nous devons créer la page de documentation à partir du composant
`RulePage` de `@publicodes/react-ui` comme on le ferait dans une application
React classique :

```typescript
// RulePage.tsx
import React from "react"
import Engine from "publicodes"
import { RulePage } from "@publicodes/react-ui"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"

import "./rule-page.css"

export type Props = {
    engine: Engine
    rulePath: string
    documentationPath: string
}

export default function ({ engine, rulePath, documentationPath }: Props) {
    return (
        <RulePage
            engine={engine}
            rulePath={rulePath}
            documentationPath={documentationPath}
            searchBar={true}
            language="fr"
            npmPackage="publicodes-evenements"
            renderers={{
                Text: ({ children }) => (
                    <Markdown
                        className={"markdown"}
                        remarkPlugins={[remarkGfm]}
                    >
                        {children}
                    </Markdown>
                ),
                Link: ({ to, children }) => (
                    <button
                        className="link"
                        onClick={(e) => {
                            e.preventDefault()
                            engine.getElmApp().ports.reactLinkClicked.send(to)
                        }}
                    >
                        {children}
                    </button>
                ),
            }}
        />
    )
}
```

### Création du `customElement`

Afin de pouvoir utiliser le composant `RulePage` dans une application Elm, nous
allons devoir effectuer le rendu du composant dans un `customElement`.

Pour cela, nous devons définir ce `customElement` :

```typescript
// RulePageCustomElement.tsx
import React, { Suspense } from "react"
import { Root, createRoot } from "react-dom/client"
import Engine from "publicodes"

// Chargement dynamique du composant RulePage
const RulePage = React.lazy(() => import("./RulePage.tsx"))

// id de la div racine de l'application React
const reactRootId = "react-root"

// Définition du customElement à partir d'un moteur Publicodes
export function defineCustomElementWith(engine: Engine) {
    customElements.define(
        "publicodes-rule-page",
        class extends HTMLElement {
            reactRoot: Root
            engine: Engine

            // Définition des attributs observés qui déclenchent un re-render du
            // composant
            static observedAttributes = [
                "rule",
                "documentationPath",
                "situation",
            ]

            constructor() {
                super()
                // Création de la racine de l'application React dans le DOM
                this.reactRoot = createRoot(
                    document.getElementById(reactRootId) as HTMLElement
                )
                this.engine = engine
                this.renderElement()
            }

            connectedCallback() {
                this.renderElement()
            }

            attributeChangedCallback() {
                this.renderElement()
            }

            renderElement() {
                // Récupère les attributs de l'élément HTML qui sont définis
                // dans l'appel de la balise customElement
                const rulePath = this.getAttribute("rule") ?? ""
                const documentationPath =
                    this.getAttribute("documentationPath") ?? ""

                if (!rulePath || !documentationPath) {
                    return null
                }

                // Rendu du composant RulePage dans le noeud React
                this.reactRoot.render(
                    <Suspense
                        fallback={
                            <div className="flex flex-col items-center justify-center mb-8 w-full">
                                <div className="loading loading-lg text-primary mt-4"></div>
                            </div>
                        }
                    >
                        <RulePage
                            engine={this.engine}
                            rulePath={rulePath}
                            documentationPath={documentationPath}
                        />
                    </Suspense>
                )
            }
        }
    )
}
```

Une fois le `customElement` défini, nous devons le créer avec le moteur
Publicodes courant :

```typescript
// main.ts
import { defineCustomElementWith } from './RulePageCustomElement';

const app = ...
const engine = ...

// Définition du customElement RulePage avec le moteur Publicodes courant
defineCustomElementWith(engine);

app.ports...
```

### Utilisation du `customElement` depuis Elm

Pour utiliser le `customElement` depuis Elm, il suffit d'utiliser le nouveau tag
HTML `publicodes-rule-page` dans la vue Elm, en passant les attributs
nécessaires :

```elm
-- Main.elm

-- [rule] ici est le nom de la règle à afficher, elle est récupérée à partir de
-- l'URL par exemple.
viewRulePage : Model -> Html Msg
viewRulePage { session, rule } =
    let
        serializedSituation =
            Json.Encode.encode 0 (P.encodeSituation session.situation)
    in
    node "publicodes-rule-page"
        [ attribute "rule" rule
        , attribute "documentationPath" "/documentation"
        , attribute "situation" serializedSituation
        ]
        []
```

Pour que le rendu React se fasse correctement, il est important de s'assurer
de rendre la div `react-root` dans laquelle le composant React sera rendu à
la racine de la vue Elm :

```elm
-- Main.elm

view : Model -> Html Msg
view model =
    div []
        [ if model.showReactRoot then
            div [ id "react-root" ] []

          else
            text ""
        , viewRulePage model
        ]
```
