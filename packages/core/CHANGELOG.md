# publicodes

## 1.9.0

### Minor Changes

- [#702](https://github.com/publicodes/publicodes/pull/702) [`c1b8205`](https://github.com/publicodes/publicodes/commit/c1b8205fba1a12abfa0118e02249501fed550337) Thanks [@johangirod](https://github.com/johangirod)! - Add flag `automaticNamespaceDisabling` to control automatic namespace disabling

    By default, all the children of a rule that evaluate to "false" or "not applicable" are not applicable.
    This new flag allow to remove this behavior.

## 1.8.5

### Patch Changes

- [#688](https://github.com/publicodes/publicodes/pull/688) [`841ab02`](https://github.com/publicodes/publicodes/commit/841ab022cadf900cdc5318e2cdd115efa51cc95e) Thanks [@Clemog](https://github.com/Clemog)! - fix(core): use dottedName to access ruleName instead of name for context missing variables evaluation

- [#688](https://github.com/publicodes/publicodes/pull/688) [`841ab02`](https://github.com/publicodes/publicodes/commit/841ab022cadf900cdc5318e2cdd115efa51cc95e) Thanks [@Clemog](https://github.com/Clemog)! - fix(core): `contexte` rules can't be missingVariables

## 1.8.4

### Patch Changes

- [#684](https://github.com/publicodes/publicodes/pull/684) [`c00ddef`](https://github.com/publicodes/publicodes/commit/c00ddefdff5cd2edb970066a7d6d7975fe77eeba) Thanks [@Clemog](https://github.com/Clemog)! - fix(core): `contexte` rules can't be missingVariables

- [#681](https://github.com/publicodes/publicodes/pull/681) [`6aa06de`](https://github.com/publicodes/publicodes/commit/6aa06de353f5a4ae22f311227c812690202dc1ce) Thanks [@Clemog](https://github.com/Clemog)! - fix(core): situation error now throw

## 1.8.3

### Patch Changes

- [#678](https://github.com/publicodes/publicodes/pull/678) [`4746642`](https://github.com/publicodes/publicodes/commit/47466427260ea6f2e382d9537710907a35135390) Thanks [@Clemog](https://github.com/Clemog)! - Use `warning` function for situation issues

## 1.8.2

### Patch Changes

- [#662](https://github.com/publicodes/publicodes/pull/662) [`9a49053`](https://github.com/publicodes/publicodes/commit/9a49053cec5c87d6b046e461d2d2aae29c45bce8) Thanks [@Clemog](https://github.com/Clemog)! - Fix typing: RawRule can be `null` now

## 1.8.1

### Patch Changes

- [#646](https://github.com/publicodes/publicodes/pull/646) [`366b86b`](https://github.com/publicodes/publicodes/commit/366b86b46d6b7c9a523d24aa43e9df1180ab02f9) Thanks [@johangirod](https://github.com/johangirod)! - Improve type signature

## 1.8.0

### Minor Changes

- [`366e235`](https://github.com/publicodes/publicodes/commit/366e23545055d66048c09cf703f3f5e305eff54d) - Add a `warn` option to define which warnings should be displayed

    **Example:**

    ```ts
    const rules = new Engine(rules, {
        warn: {
            experimentalRules: false,
        },
    })
    ```

    See [the documentation](https://publi.codes/docs/api/publicodes/type-aliases/engineoptions) for more information.

### Patch Changes

- [`366e235`](https://github.com/publicodes/publicodes/commit/366e23545055d66048c09cf703f3f5e305eff54d) - Add missing `title` property in the Possibility type

- [`366e235`](https://github.com/publicodes/publicodes/commit/366e23545055d66048c09cf703f3f5e305eff54d) - ⚡ Performance improvements for parsing rules

    Rework parser implementation from Nearley to a hand-written recursive descent parser.

    - 3.5x faster parsing of modele-social rules / 5x faster parsing of nosgestesclimat rules
    - Zero dependencies for publicodes
    - Improved error messages for parsing errors
    - Added tests for the new parser

    Thanks @bjlaa, @Clemog, @EmileRolley, @JalilArfaoui, @johangirod!

- [`366e235`](https://github.com/publicodes/publicodes/commit/366e23545055d66048c09cf703f3f5e305eff54d) - Fix breaking due to applicability evaluation of possibilites

    In the new `une possibilité` mecanism, the engine evaluates the applicability of each possibility, in order to automatically select if there is only one possibility that is applicable.

    This leads to difficult to debug issues rooted in cyclic evaluations not beeing handled well in the current version of the engine.

    This patch fixes this issue by adding a `flag` option to filter out possibilities that are not applicable. This flag is set to `false` by default.

    ```ts
    const engine = new Engine(rules, {
        flag: { filterNotApplicablePossibilities: true },
    })
    ```

    This is temporary, and will be removed in the future when the engine will be able to handle cyclic evaluations.

## 1.7.2

### Patch Changes

- [#623](https://github.com/publicodes/publicodes/pull/623) [`92e15d2`](https://github.com/publicodes/publicodes/commit/92e15d2bcc778a295908984a2374d07c5d7c1462) Thanks [@johangirod](https://github.com/johangirod)! - Fix replace in private rule disactivated by parent

## 1.7.0

### Minor Changes

- [#607](https://github.com/publicodes/publicodes/pull/607) [`eaa9636`](https://github.com/publicodes/publicodes/commit/eaa963644e17360110b23c45f4617eb69122f805) Thanks [@johangirod](https://github.com/johangirod)! - Improved `une possibilité` mecanism

    ### Une possibilité improvements

    `Une possibilité` now accepts inlined rule and constant.
    For instance, you can write :

    ```yaml
    a:
        une possibilité:
            - 6 mois
            - 12 mois
            - 2 ans
    ```

    or

    ```yaml
    a:
        une possibilité:
            - b:
                  titre: 'Option b'
            - c:
                  non applicable si: x
    ```

    See the [documentation](https://publi.codes/docs/manuel/une-possibilité) for more details.

    The possible values are parsed and added to the rule node under the key `possibleChoices`.

    Add a new strict option `checkPossibleValues` to checks if the evaluated value is in the list of possible choices and throws an error if not (default to false).

    ### Other changes

    - Improve type inference of rule.
    - Slight performance improvement (+5% on the publicodes benchmark)
    - 🚨 AST BREAKING CHANGE (AST change are not in semantic versioning) :
      `parseExpression` of number with unit returns a constant node with the unit as a `rawUnit` property, instead of a unit node to be parsed:
        ```js
        parseExpression('3 €')
        // Before : { unité: '€', constant: { nodeType: 'constant', value: 3 }
        // Now : { nodeType: 'constant', value: 3, rawUnit: '€' }
        ```

- [#609](https://github.com/publicodes/publicodes/pull/609) [`48ab070`](https://github.com/publicodes/publicodes/commit/48ab0703e8c8017766fa785aa02f11482d6998ba) Thanks [@pbourdu](https://github.com/pbourdu)! - Ajout du mécanisme logarithme néperien

- [#605](https://github.com/publicodes/publicodes/pull/605) [`ac107c4`](https://github.com/publicodes/publicodes/commit/ac107c4ee2ea6c316d4f56bc318e6fc04accadc8) Thanks [@johangirod](https://github.com/johangirod)! - Add option to detect cycles at runtime and improve type inference

    The strict option `noCycleRuntime` can be set to detect cycles at
    runtime. When a cycle is detected, the engine will throw an error
    (disabled by default).

    Reactivate runtime warning for cycles in the engine.

    Improved type inference for rules, adding the possibility to enforce
    the type of rule with the `type` key.

## 1.6.1

### Patch Changes

- [#602](https://github.com/publicodes/publicodes/pull/602) [`db92224`](https://github.com/publicodes/publicodes/commit/db92224a803bb024616e7c0decf79fbf7746faf1) Thanks [@johangirod](https://github.com/johangirod)! - Fix missingVariables in text mecanism

- [#600](https://github.com/publicodes/publicodes/pull/600) [`cb4d878`](https://github.com/publicodes/publicodes/commit/cb4d878172a711f49fee6751e35a2eccaafdaa5c) Thanks [@johangirod](https://github.com/johangirod)! - Fix a bug with setSituation and keepPreviousSituation

## 1.6.0

### Minor Changes

- [#585](https://github.com/publicodes/publicodes/pull/585) [`ed32af2`](https://github.com/publicodes/publicodes/commit/ed32af259a347dae6f289120f02d9b6c08f2e056) Thanks [@totakoko](https://github.com/totakoko)! - Ajoute le mécanisme division entière via la syntaxe `//`

### Patch Changes

- [`27a7f75`](https://github.com/publicodes/publicodes/commit/27a7f751c5e02e3e52e29c87d5e02f8112dd1d27) Thanks [@johangirod](https://github.com/johangirod)! - Use external dependencies for moo and nearley.
  (instead of devDependencies, which means that the packages were bundled with publicodes even with esm)

## 1.5.4

### Patch Changes

- [#584](https://github.com/publicodes/publicodes/pull/584) [`da688c7`](https://github.com/publicodes/publicodes/commit/da688c76b47fb327ef9d3dcde835f6165c3c8423) Thanks [@johangirod](https://github.com/johangirod)! - Fix bug with contexte

    v1.3.2 introduced a bug when using contexte :

    - If a contexte was evaluated before and after `setSituation` with `keepPreviousSituation` on, the returned value would be the one of the first evaluation (before setSituation)
    - If a contexte was used within a `inversion numérique`, the returned value would be `undefined`

    This fixes it.

- [#570](https://github.com/publicodes/publicodes/pull/570) [`8688aba`](https://github.com/publicodes/publicodes/commit/8688abaed51924b461ae77184cad332ac338e8f8) Thanks [@johangirod](https://github.com/johangirod)! - Improve type inference

## 1.5.3

### Patch Changes

- [#568](https://github.com/publicodes/publicodes/pull/568) [`37db026`](https://github.com/publicodes/publicodes/commit/37db026f9770d14788c1e9567ef55c5a70422896) Thanks [@johangirod](https://github.com/johangirod)! - Improve documentation of export with TSDoc.

    - Export additional types in `publicodes` and `@publicodes/react-ui` packages to improve the developer experience.
    - Add TSDoc comments to all exported functions in `publicodes` and `@publicodes/react-ui` packages.
    - Add @internal tag to internal functions that are not meant to be used by users (even though they are exported).
    - Add @experimental tag to functions whose signature may change in the future, without a major version bump.

## 1.5.1

### Patch Changes

- [`78bc846`](https://github.com/publicodes/publicodes/commit/78bc846df64c50353e84484f8e7c66d559ec9747) Thanks [@johangirod](https://github.com/johangirod)! - Fix arrondi mecanism error

    For certain case, the value returned by the `arrondi` mecanism was not correct. For instance :

    ```yaml
    arrondi:
        valeur: 4.55
        arrondi: 1 décimales
    ```

    The value returned was `4.5` instead of `4.6`. This is now fixed.
