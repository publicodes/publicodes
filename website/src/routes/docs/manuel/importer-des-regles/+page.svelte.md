---
sidebar_position: 6
title: Imports de règles
hide_table_of_contents: false
---

Afin de pouvoir réutiliser des règles d'un modèle à un autre, il est nécessaire
de pouvoir importer des règles d'un autre modèle.

Pour ce faire nous avons défini une macro `importer!` qui permet de spécifier
une liste de règles à importer depuis un fichier JSON d'un [modèle
compilé](../compilation/). Par défaut, le fichier JSON est recherché dans le
package NPM du modèle ou bien il est possible de spécifier un chemin vers un
fichier local.

<Callout type="warning" title="Fonctionnalité en cours de développement">

L'API d'import/export de règles est en cours de réécriture, et va changer de spécification dans une prochaine version de [@publicodes/tools](/docs/api/tools).

</Callout>

<Callout type="caution">

La macro `importer!` est une macro de compilation. Pour qu'elle puisse fonctionner, le modèle doit être compilé avec [@publicodes/tools](../compilation/)

</Callout>

## Importer des règles depuis un modèle compilé

Pour pouvoir utiliser un ensemble de règles d'un autre modèle, il faut spécifier
la macro `importer!` au début d'un fichier publicodes.

### Usage

La macro `importer!` possède la syntaxe suivante :

```yaml
importer!:
  depuis:
  	nom: <npm_package_name>
	source: <path_to_the_model_file> (optional)
	url: <url_to_the_package_documentation> (optional)
  dans: <namespace> (optional)
  les règles:
    - <rule_name_from_the_npm_package>
    - <rule_name_from_the_npm_package>:
      <attr_to_overwrite>: <value>
      ...
    ...
```

Avec :

- `depuis` : les informations sur le modèle à importer
    - `nom` : le nom du package NPM du modèle à importer
    - `source` : le chemin vers le fichier JSON du modèle à importer (optionnel)
    - `url` : l'URL vers la documentation du modèle à importer (optionnel)
- `dans` : le namespace dans lequel importer les règles (optionnel)
- `les règles` : la liste des règles à importer. Il est possible de spécifier
  des attributs à écraser pour chaque règle (optionnel)

Par défaut, si aucune `source` n'est spécifiée, le modèle est supposé être
[compilé](../compilation/) dans le fichier `<package_name>.model.json` à la racine
du package NPM. Le package NPM du modèle à utiliser doit donc **être publié sur
NPM** et être **ajouté aux dépendances du projet** courant.
Il est également possible de spécifier le chemin vers un fichier local avec
`source`.

Si `dans` n'est pas spécifié, les règles seront importées dans le namespace
correspondant au nom du package NPM (`nom`).

<Callout type="info" title="Fonctionnement">

A la compilation, chaque macro `importer!` est remplacée par les règles
importées **ainsi que leurs dépendances**.

</Callout>

#### Exemple

```yaml title="nosgestesclimat/data/logement/piscine.publicodes"
importer!:
    depuis:
        nom: futureco-data
        url: https://github.com/laem/futureco-data
    dans: logement
    les règles:
        - piscine . empreinte eau froide
        - piscine . traitement chimique
        - piscine . construction
        - piscine . surface:
              applicable si: piscine . présent
              question: Quelle est la taille de votre piscine ?
              description: |
                  💡 Pensez à prendre en compte **les consommations d'énergie de la piscine dans celles de votre logement**. Votre facture devrait d'ailleurs être fortement impactée si votre piscine est chauffée !
              unité: m2
              suggestions:
                  3 x 5 mètres: 15
                  5 x 5 mètres: 20
                  5 x 8 mètres: 40
```

## Liste des modèles publiés

- [`futureco-data`](https://github.com/laem/futureco-data)
    - _modèle de [futur.eco](https://futur.eco)._
- [`@incubateur-ademe/nosgestesclimat`](https://github.com/incubateur-ademe/nosgestesclimat)
    - _modèle de [Nos Gestes Climat](https://nosgestesclimat.fr)._
- [`@incubateur-ademe/publicodes-impact-livraison`](https://github.com/incubateur-ademe/publicodes-impact-livraison)
    - _modèle du simulateur Impact Livraison de [Impact
      CO2](https://impactco2.fr)._
- [`@incubateur-ademe/publicodes-negaoctet`](https://github.com/incubateur-ademe/publicodes-negaoctet)
    - _modèle publicodes de la base de données de
      [NegaOctet](https://negaoctet.org/en/home/#Donnees) utilisé par [Impact
      CO2](https://impactco2.fr)._
- [`@incubateur-ademe/publicodes-commun`](https://github.com/incubateur-ademe/publicodes-commun)
    - _ensemble de règles communes utilisées pour l'implémentation des modèles
      publicodes de l'incubateur de l'ADEME._
