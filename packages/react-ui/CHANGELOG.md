# @publicodes/react-ui

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
