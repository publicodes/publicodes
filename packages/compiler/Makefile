.POSIX:
.SUFFIXES:

JS_TESTS_DIR = ./tests/runtimes/JS
TEST ?=
CLI_DIR = ../cli
COMPILER_PATH = _build/default/bin/main.exe

help:
	@echo "Available targets:"
	@echo "  install                  | Install OCaml dependencies using opam"
	@echo "  install-js               | Install JavaScript dependencies using pnpm"
	@echo "  build                    | Build the compiler using dune"
	@echo "  dev                      | Run the dune build in watch mode for development (needed for LSP server)"
	@echo "  test-all                 | Run all tests (JavaScript and OCaml)"
	@echo "  test-js                  | Run JavaScript tests using pnpm"
	@echo "  test-ocaml               | Run OCaml unit and cram tests using dune"
	@echo "  test-ocaml-promote       | Run OCaml tests and promote cram test outputs"

#> install                  | Install OCaml dependencies using opam
install:
	@echo "Installing dependencies..."
	opam switch create . --deps-only --with-test --with-dev-setup

#> install-js               | Install JavaScript dependencies using pnpm
install-js:
	@echo "Installing JavaScript dependencies..."
	pnpm install

#> build                    | Build the compiler using dune
build:
	@echo "Building the compiler..."
	dune build

#> dev                      | Run the dune build in watch mode for development (needed for LSP server)
dev:
	dune build --watch

#
# Tests
#

#> test-js                  | Run JavaScript tests using pnpm
test-js: build
	@echo "Running JavaScript tests..."
	PUBLICODES_COMPILER_PATH=../../../$(COMPILER_PATH) pnpm -C $(JS_TESTS_DIR) test:compiler $(TEST)

#> test-ocaml               | Run OCaml unit and cram tests using dune
test-ocaml:
	@echo "Running OCaml tests..."
	dune test

#> test-ocaml-promote       | Run OCaml tests and promote cram test outputs
test-ocaml-promote:
	@echo "Running OCaml tests and promoting cram test outputs..."
	dune promote

#> test-json-schema         | Run JSON-Schema checks
test-json-schemas:
	@echo "Running JSON-Schema checks..."
	$(MAKE) -C ./autodoc/

#> test-all                 | Run all tests (JavaScript, OCaml, JSON-Schema)
test-all: test-ocaml test-js test-json-schemas
