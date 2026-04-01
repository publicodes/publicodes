JS_TESTS_DIR = ./tests/runtimes/JS
CLI_DIR = ../cli
COMPILER_PATH = _build/default/bin/main.exe

help:
	@sed -n 's/^#> //p' Makefile
.PHONY: help

#> install            | Install OCaml dependencies using opam
install:
	@echo "Installing dependencies..."
.PHONY: install
	opam install . --deps-only --with-test --with-doc --with-dev-setup

#> install-js         | Install JavaScript dependencies using yarn
install-js:
	@echo "Installing JavaScript dependencies..."
	yarn --cwd $(JS_TESTS_DIR) install
.PHONY: install-js

#> build              | Build the compiler using dune
build:
	@echo "Building the project..."
	dune build
.PHONY: build

#> dev                | Run the dune build in watch mode for development (needed for LSP server)
dev:
	dune build --watch
.PHONY: dev

#> test-all           | Run all tests (JavaScript and OCaml)
test-all: test-ocaml test-js
.PHONY: test-all

#> test-js            | Run JavaScript tests using yarn
test-js: build
	@echo "Running JavaScript tests..."
	PUBLICODES_COMPILER_PATH=../../../$(COMPILER_PATH) yarn --cwd $(JS_TESTS_DIR) test
.PHONY: test-js

#> test-ocaml         | Run OCaml unit and cram tests using dune
test-ocaml:
	@echo "Running OCaml tests..."
	dune test
.PHONY: test-ocaml

#> test-ocaml-promote | Run OCaml tests and promote cram test outputs
test-ocaml-promote:
	@echo "Running OCaml tests and promoting cram test outputs..."
	dune promote
.PHONY: test-ocaml-promote
