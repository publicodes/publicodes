# autodoc playground

Two models documented with `@publicodes/autodoc`: `simple-TJM` shows the model's
own sheet (no context), `auto-entrepreneur` shows a calculation.

The compiled models it imports are build outputs, not sources. Generate them
first — this needs the compiler's OCaml toolchain:

```sh
pnpm build:autodoc-example
pnpm --filter autodoc-playground dev
```

The example is only served — it has no `build` of its own, so the repository's
`pnpm build` does not need the compiler.
