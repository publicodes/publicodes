# publicodes

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
