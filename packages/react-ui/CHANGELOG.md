# @publicodes/react-ui

## 1.10.0

### Minor Changes

- [#758](https://github.com/publicodes/publicodes/pull/758) [`9f93973`](https://github.com/publicodes/publicodes/commit/9f939738ad7062ba3891bc11ab407d0230d95d68) Thanks [@Clemog](https://github.com/Clemog)! - Add displayIcon option and fix accessibility

- [#781](https://github.com/publicodes/publicodes/pull/781) [`79e5511`](https://github.com/publicodes/publicodes/commit/79e55116600880aa13f941c1cf073db57bd3bbd5) Thanks [@Clemog](https://github.com/Clemog)! - Improve documentation accessibility:

          - increase the contrast of the search field border color;
          - implement the ARIA disclosure pattern on the RulePage nav search bar + improve the screen reader UX (add visually hidden messages);
          - implement the ARIA disclosure pattern on the Accordion component;
          - add a configurable id to target the main content of the documentation page and prevent screen readers from having to traverse the entire docs navigation to reach the main content via a skip link;
          - add title attributes to buttons that have no visible label.

## 1.9.1

### Patch Changes

- [#756](https://github.com/publicodes/publicodes/pull/756) [`e545ca9`](https://github.com/publicodes/publicodes/commit/e545ca9506fca86f52c1ea2ccf7dca125f1aeed2) Thanks [@Clemog](https://github.com/Clemog)! - Fully hide `rulesToHide` rules in documentation

## 1.8.0

### Minor Changes

- [#754](https://github.com/publicodes/publicodes/pull/754) [`7d1716c`](https://github.com/publicodes/publicodes/commit/7d1716c2b276e17f9f246fdf367f8aee64856ed9) Thanks [@Clemog](https://github.com/Clemog)! - Add ui option for documentation to hide confidential values

## 1.7.1

### Patch Changes

- [`9c9c90b`](https://github.com/publicodes/publicodes/commit/9c9c90bc596631f430c9300a93fea1911409590f) Thanks [@johangirod](https://github.com/johangirod)! - Add visualisation for logarithme mecanism

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

## 1.5.4

### Patch Changes

- [#581](https://github.com/publicodes/publicodes/pull/581) [`a61f705`](https://github.com/publicodes/publicodes/commit/a61f705a2a634792d7f6fe1f174f471a120bed11) Thanks [@desoindx](https://github.com/desoindx)! - Multiple improvement on accessibility :

    - Change level of title inside accordion
    - Increase constrate on Copy button
    - Implement Aria Dialog pattern on mobile menu
    - Use proper ul/li imbrication on menu
    - Use title instead of aria label to specify that link open in a new window

    Note that the markup of the navigation menu is modified, which can lead to break its style if it was overridden manually by CSS from the application.

## 1.5.3

### Patch Changes

- [#568](https://github.com/publicodes/publicodes/pull/568) [`37db026`](https://github.com/publicodes/publicodes/commit/37db026f9770d14788c1e9567ef55c5a70422896) Thanks [@johangirod](https://github.com/johangirod)! - Improve documentation of export with TSDoc.

    - Export additional types in `publicodes` and `@publicodes/react-ui` packages to improve the developer experience.
    - Add TSDoc comments to all exported functions in `publicodes` and `@publicodes/react-ui` packages.
    - Add @internal tag to internal functions that are not meant to be used by users (even though they are exported).
    - Add @experimental tag to functions whose signature may change in the future, without a major version bump.

- Updated dependencies [[`37db026`](https://github.com/publicodes/publicodes/commit/37db026f9770d14788c1e9567ef55c5a70422896)]:
    - publicodes@1.5.3

## 1.5.2

### Patch Changes

- [#555](https://github.com/publicodes/publicodes/pull/555) [`da617c2`](https://github.com/publicodes/publicodes/commit/da617c2e159edd6bfc6a0d6e7d209056eee2f69e) Thanks [@JalilArfaoui](https://github.com/JalilArfaoui)! - better automatic scroll to active rule in documentation, compatible with iFrame integration

## 1.5.1

### Patch Changes

- [#548](https://github.com/publicodes/publicodes/pull/548) [`ed5b4e9`](https://github.com/publicodes/publicodes/commit/ed5b4e92160d46142832a6797b3d12e9f6446469) Thanks [@johangirod](https://github.com/johangirod)! - Improve significative digit handling

    Improve the logic for the number of significative digits displayed in the documentation page :

    - Use the number of digits specified in `arrondi` mecanism if it exists
    - If the value is a constant, use the number of digits in the constant

- Updated dependencies [[`78bc846`](https://github.com/publicodes/publicodes/commit/78bc846df64c50353e84484f8e7c66d559ec9747)]:
    - publicodes@1.5.1
