# Publicodes compiler

The Publicodes compiler.

## Usage

Currently, the best way to use the compiler is via the
[`@publicodes/cli`](#using-the-npm-package) NPM package.

### Using the NPM package

```sh
# Install the compiler globally
npm install -g @publicodes/cli

# Install the compiler in your local dev dependencies
npm install --save-dev @publicodes/cli

# Use it directly with npx or bunx
npx @publicodes/cli init

```

### Using opam

The package is not yet available via [opam](https://opam.ocaml.org/).

### From source

See [Local developement](#local-developement).

## Local developement

To build it from source you need to have the [OCaml](https://ocaml.org/)
toolchain setup ([`Dune`](https://dune.build/) and
[`opam`](https://opam.ocaml.org/)) and
[Make](https://www.gnu.org/software/make/).

### Install dependencies

In OCaml, it's recommended to use [opam Switches](https://ocaml.org/docs/opam-switch-introduction):

```sh
opam switch create . --deps-only
    # --with-test (to add testing lib)
    # --with-dev-setup (to add dev tools format and lsp server)
```

### Build

To build the compiler you can simply run:

```sh
make build

# Or, to build in watch mode
make dev
```

### Run tests

To run [cram tests](./tests/crams/README.md) and unit tests (defined in
`./lib/**/*_test.ml`):

```sh
make test-ocaml

# To promote cram test outputs
make test-ocaml-promote
```

> For inline tests, we use
> [`ppx_inline_test`](https://dune.readthedocs.io/en/stable/tests.html#inline-tests).

#### Runtime specific tests

There is a dedicated test suite for the runtimes defined in
[`./tests/runtimes/`](./tests/runtimes/).

##### JavaScript

To run JS runtime tests defined in [`./tests/runtimes/JS`](./tests/runtimes/JS),
you need first to install JavaScript related deps:

```sh
make install-js
```

Then, you can run the test suite with:

```sh
make test-js
```

### Run benchmarks

#### JavaScript

Benchmarks are defined in
[`./examples/<benchmark-name>/benchmark.ts`](./examples/) and can be run with:

```sh
make bench-<benchmark-name>
```
### Reviewing with Gerrit

#### With Git

Setup:

```sh
git remote add gerrit \
    ssh://USER@review.gerrithub.io:29418/publicodes/publicodes
curl -Lo "$(git rev-parse --git-dir)/hooks/commit-msg" \
    https://gerrithub.io/tools/hooks/commit-msg
# Re-commit to add the Change-Id trailing
```

Usage:

```sh
git push gerrit HEAD:refs/for/2.0
```

#### With Jujutsu

Setup:

```sh
jj git remote add gerrit \
    ssh://USER@review.gerrithub.io:29418/publicodes/publicodes
jj config set --repo gerrit.default-remote gerrit
jj config set --repo gerrit.default-remote-branch 2.0
jj config set --repo templates.commit_trailers \
    'if(!trailers.contains_key("Change-Id"), format_gerrit_change_id_trailer(self))'
# Re-commit to add the Change-Id trailing
```

Usage:

```sh
jj gerrit upload
```
