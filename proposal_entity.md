## [Proposal] : nouveaux types publicodes

### Introduction

Aujourd'hui, les seuls types de données que l'on peut manipuler dans publicodes sont les nombres, les chaînes de caractères et les booléens.

Hors, lorsqu'on manipule des règles publicodes en Javascript, il est parfois utile de pouvoir manipuler des objets plus complexes, comme des enum (`possibilité`) ou même des objets.

Cette proposition vise à ajouter de nouveaux types de données à publicodes, pour permettre de manipuler ces objets via l'API Javascript.

Note : cette proposition est dans la continuité de https://gist.github.com/johangirod/eb637f4d536135c9de87d0b6421cb7a1

### Types `une possibilité`

```yaml
a:
  type: une possibilité
  par défaut: +option 1
  avec:
    option 1:
    option 2:
```

**Possible de préciser quelles règles**

```yaml
a:
  type:
    une possibilité:
      - option 1
      - option 2
  avec:
    option 1:
    option 2:
    autre règle:
```

Maintenant que nous avons un type option de premier niveau, la vérification statique de type peut s'assurer de la validité des égalités.

```yaml
b:
  applicable si: a = +option 1 # OK
c:
  applicable si: a = +option 3 # KO
```

Par ailleurs, la vérification statique de type fonctionne avec des réf

```yaml
d: -> option 1
ma condition:
  applicable si: a = d # OK car option 1 existe aussi dans a
```

Grâce à la nouvelle syntaxe, pas d'ambiguité de type

```
e: "'option 1'"
type incompatible:
  applicable si: a = e # KO car 'option 1' est une chaine de caractère dans e alors qu'il s'agit d'une option dans d
```

**A savoir**

- Les sous règles options qui ne sont pas selectionnées sont `non applicable` (ainsi que leurs enfants)

**Questions** :

- Le nom du type `une possibilité` est-il clair ? Autres options : `selection unique` ou `enum`
- Pourquoi avoir un constructeur de type avec une syntaxe spécifique pour les options ? `a: -> option 1`
  - **Avantages** : permet de distinguer les options des chaînes de caractères et éviter le côté magique de la conversion (qui peut être source d'erreur cf `type incompatible`). On gagne en cohérence et en prédictibilité. Permet d'affecter des options directement à une variable, sans passer par une règle. Pas de double guillemets.
  - **Inconvénients** : une nouvelle syntaxe introduite, plus de complexité. Pas rétrocompatible.
- Possibilités de grouper les options (cf mon-entreprise) ?

**API**

```ts
interface Possibility<PossibleValues> extends Rule {
	type: 'une possibilité'

	options: Record<PossibleValues, ReadOnlyRule>
	applicableOptions(): Record<PossibleValues, Rule>

	value(): PossibleValues
	set(option: PossibleValues): void
}
```

### Types choix multiple

```yaml
a:
  type: plusieurs possibilités
  par défaut: +option 1 +option 2
  avec:
    option 1:
    option 2:
    option 3:
```

````ts
interface Possibilities<PossibleValues> extends Rule {
	type: 'plusieurs possibilités'

	options: Record<PossibleValues, Rule>
	applicableOptions(): Record<PossibleValues, Rule>

	value(): Array<PossibleValues>
	set(option: Array<PossibleValues>): void
}


> TODO : children type option or can be whatever ?
> If whatever, it seems that the value of the option is the value of the select, but it's not.
> Besides, how to differentiate not applicable because of the select and not applicable because of the option itself ? For instance if we want to retrieve the applicable options of a select.
> So it's best to have a type option for children (which means boolean)
> The downside is that it's not possible to set a domain value to a children option, but it's not a big deal. If necessary, it can be done with a indirection
>
> ```yaml
> contrat . type:
>   type: une possibilités
>   par défaut: CDI
>   avec:
>     CDD:
>       type: option
>     CDI:
>       type: option
>
> contrat . CDD:
>   type: entité
>   applicable si: contrat . type = CDD
> ```

### Types objet

```yaml
a:
  type: objet
  avec:
    clé 1:
      type: nombre
    clé 2:
      type: texte
````

### Types collection (défaut d'un noeud avec le mot-clé `liste` sans `valeur`)

```yaml
a:
  type: collection
  liste:
    - 1
    - 2
    - 3
```

```js
engine.setSituation({
	commune: {
		nom: 'Paris',
		'code postal': '75000',
		département: {
			nom: 'Paris',
			code: '75',
		},
	},
})
```
