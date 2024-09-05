# publicodes

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
