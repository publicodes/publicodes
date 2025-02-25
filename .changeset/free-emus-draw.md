---
'publicodes': patch
---

Fix breaking due to applicability evaluation of possibilites

In the new `une possibilité` mecanism, the engine evaluates the applicability of each possibility, in order to automatically select if there is only one possibility that is applicable.

This leads to difficult to debug issues rooted in cyclic evaluations not beeing handled well in the current version of the engine.

This patch fixes this issue by adding a `flag` option to filter out possibilities that are not applicable. This flag is set to `false` by default.

```ts
const engine = new Engine(rules, {
    flag: { filterNotApplicablePossibilities: true },
})
```

This is temporary, and will be removed in the future when the engine will be able to handle cyclic evaluations.
