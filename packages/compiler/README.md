# Publicodes compiler

## Run in local

```
opam switch create . --deps-only
    # --with-test (to add testing lib)
    # --with-dev-setup (to add dev tools format and lsp server)

dune build # or dune exec publicodes-compiler
```
