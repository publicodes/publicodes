help : Makefile
	@sed -n 's/^#> //p' $<

JS_TESTS_DIR = ./tests/runtimes/JS
CLI_DIR = ../cli

#> install            | Install OCaml dependencies using opam
install:
	@echo "Installing dependencies..."
	opam install . --deps-only --with-test --with-doc --with-dev-setup

#> install-js         | Install JavaScript dependencies using yarn
install-js:
	@echo "Installing JavaScript dependencies..."
	yarn --cwd $(JS_TESTS_DIR) install

#> build              | Build the compiler using dune
build:
	@echo "Building the project..."
	dune build

#> dev                | Run the dune build in watch mode for development (needed for LSP server)
dev:
	dune build --watch

#> test-all						| Run all tests (JavaScript and OCaml)
test-all: test-ocaml test-js

#> test-js            | Run JavaScript tests using yarn
test-js: build
	@echo "Running JavaScript tests..."
	yarn --cwd $(JS_TESTS_DIR) test

#> test-ocaml         | Run OCaml unit and cram tests using dune
test-ocaml:
	@echo "Running OCaml tests..."
	dune test

#> test-ocaml-promote | Run OCaml tests and promote cram test outputs
test-ocaml-promote:
	@echo "Running OCaml tests and promoting cram test outputs..."
	dune promote
