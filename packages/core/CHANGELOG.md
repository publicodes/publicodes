# publicodes

## 1.5.4

### Patch Changes

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
