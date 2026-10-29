# autodoc playground

Three models documented with `@publicodes/autodoc`: `simple-TJM` and
`auto-entrepreneur` come from `examples/models`, `ekofest` from the
[road-to-v2](https://github.com/publicodes/publicodes-road-to-v2) model — 306
rules, one import, a real one.

The compiled models it imports are build outputs, not sources. `ekofest`'s
sources are a git submodule, so initialise it first:

```sh
git submodule update --init
pnpm build:autodoc-example
pnpm --filter autodoc-playground dev
```

`pnpm build:autodoc-example` compiles every model — this needs the compiler's
OCaml toolchain. The example is only served: it has no `build` of its own, so
the repository's `pnpm build` does not need the compiler.
