# Publicodes compiler

## Run in local

```sh
opam switch create . --deps-only
    # --with-test (to add testing lib)
    # --with-dev-setup (to add dev tools format and lsp server)

dune build # or dune exec publicodes -- <publicodes compiler flags>
```

## Run tests

To run [cram tests](./tests/README.md) and unit tests (defined in
`./lib/**/*_test.ml`):

```sh
dune test

# To promote cram test outputs
dune promote
```

> For inline tests, we use
> [`ppx_inline_test`](https://dune.readthedocs.io/en/stable/tests.html#inline-tests).
