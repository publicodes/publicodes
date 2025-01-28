# @publicodes/rest-api

## 1.5.3

### Patch Changes

- [#568](https://github.com/publicodes/publicodes/pull/568) [`37db026`](https://github.com/publicodes/publicodes/commit/37db026f9770d14788c1e9567ef55c5a70422896) Thanks [@johangirod](https://github.com/johangirod)! - Improve documentation of export with TSDoc.

    - Export additional types in `publicodes` and `@publicodes/react-ui` packages to improve the developer experience.
    - Add TSDoc comments to all exported functions in `publicodes` and `@publicodes/react-ui` packages.
    - Add @internal tag to internal functions that are not meant to be used by users (even though they are exported).
    - Add @experimental tag to functions whose signature may change in the future, without a major version bump.

- Updated dependencies [[`37db026`](https://github.com/publicodes/publicodes/commit/37db026f9770d14788c1e9567ef55c5a70422896)]:
    - publicodes@1.5.3
