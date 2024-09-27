---
'@publicodes/react-ui': patch
'@publicodes/rest-api': patch
'publicodes': patch
---

Improve documentation of export with TSDoc.

- Export additional types in `publicodes` and `@publicodes/react-ui` packages to improve the developer experience.
- Add TSDoc comments to all exported functions in `publicodes` and `@publicodes/react-ui` packages.
- Add @internal tag to internal functions that are not meant to be used by users (even though they are exported).
- Add @experimental tag to functions whose signature may change in the future, without a major version bump.
