.POSIX:
.SUFFIXES:

JS_TESTS_DIR = ./tests/runtimes/JS
CLI_DIR = ../cli
COMPILER_PATH = _build/default/bin/main.exe

EXAMPLES_DIR = examples
SIMPLE_TJM_DIR = $(EXAMPLES_DIR)/simple-TJM
SIMPLE_TJM_DEPS = $(SIMPLE_TJM_DIR)/TJM.publicodes
AUTO_ENTREPRENEUR_DIR = $(EXAMPLES_DIR)/auto-entrepreneur
AUTO_ENTREPRENEUR_DEPS = \
	$(AUTO_ENTREPRENEUR_DIR)/auto-entrepreneur.publicodes \
	$(AUTO_ENTREPRENEUR_DIR)/cotisations-et-contributions.publicodes \
	$(AUTO_ENTREPRENEUR_DIR)/exoneration.publicodes \
	$(AUTO_ENTREPRENEUR_DIR)/external.publicodes \
	$(AUTO_ENTREPRENEUR_DIR)/impot.publicodes

help:
	@echo "Available targets:"
	@echo "  install                  | Install OCaml dependencies using opam"
	@echo "  install-js               | Install JavaScript dependencies using yarn"
	@echo "  build                    | Build the compiler using dune"
	@echo "  dev                      | Run the dune build in watch mode for development (needed for LSP server)"
	@echo "  test-all                 | Run all tests (JavaScript and OCaml)"
	@echo "  test-js                  | Run JavaScript tests using yarn"
	@echo "  test-ocaml               | Run OCaml unit and cram tests using dune"
	@echo "  test-ocaml-promote       | Run OCaml tests and promote cram test outputs"
	@echo "  bench-all                | Run all benchmarks"
	@echo "  bench-simple-TJM         | Run the benchmark for the simple-TJM example"
	@echo "  bench-auto-entrepreneur  | Run the benchmark for the auto-entrepreneur example"

#> install                  | Install OCaml dependencies using opam
install:
	@echo "Installing dependencies..."
	opam install . --deps-only --with-test --with-doc --with-dev-setup

#> install-js               | Install JavaScript dependencies using yarn
install-js:
	@echo "Installing JavaScript dependencies..."
	yarn --cwd $(JS_TESTS_DIR) install
	yarn --cwd $(EXAMPLES_DIR) install

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

#> test-js                  | Run JavaScript tests using yarn
test-js: build
	@echo "Running JavaScript tests..."
	PUBLICODES_COMPILER_PATH=../../../$(COMPILER_PATH) yarn --cwd $(JS_TESTS_DIR) test

#> test-ocaml               | Run OCaml unit and cram tests using dune
test-ocaml:
	@echo "Running OCaml tests..."
	dune test

#> test-ocaml-promote       | Run OCaml tests and promote cram test outputs
test-ocaml-promote:
	@echo "Running OCaml tests and promoting cram test outputs..."
	dune promote

#> test-all                 | Run all tests (JavaScript and OCaml)
test-all: test-ocaml test-js

#
# Benchmarks
#

$(SIMPLE_TJM_DIR)/publicodes-build/index.js: $(SIMPLE_TJM_DEPS)
	@echo "Recompiling legacy publicodes-build for simple-TJM..."
	yarn --cwd $(SIMPLE_TJM_DIR) run publicodes compile '*.publicodes'

$(SIMPLE_TJM_DIR)/model.publicodes.js: $(SIMPLE_TJM_DEPS) $(COMPILER_PATH)
	@echo "Recompiling new model.publicodes.js for simple-TJM..."
	cd $(SIMPLE_TJM_DIR) && ../../$(COMPILER_PATH) compile *.publicodes

#> bench-simple-TJM         | Run the benchmark for the simple-TJM example
bench-simple-TJM: build $(SIMPLE_TJM_DIR)/publicodes-build/index.js $(SIMPLE_TJM_DIR)/model.publicodes.js
	@echo "Running benchmark for simple-TJM..."
	yarn --cwd $(SIMPLE_TJM_DIR) run bun --expose-gc benchmark.ts

$(AUTO_ENTREPRENEUR_DIR)/publicodes-build/index.js: $(AUTO_ENTREPRENEUR_DEPS)
	@echo "Recompiling legacy publicodes-build for auto-entrepreneur..."
	yarn --cwd $(AUTO_ENTREPRENEUR_DIR) run publicodes compile '*.publicodes'

$(AUTO_ENTREPRENEUR_DIR)/model.publicodes.js: $(AUTO_ENTREPRENEUR_DEPS) $(COMPILER_PATH)
	@echo "Recompiling new model.publicodes.js for auto-entrepreneur..."
	cd $(AUTO_ENTREPRENEUR_DIR) && ../../$(COMPILER_PATH) compile *.publicodes

#> bench-auto-entrepreneur  | Run the benchmark for the auto-entrepreneur example
bench-auto-entrepreneur: build $(AUTO_ENTREPRENEUR_DIR)/publicodes-build/index.js $(AUTO_ENTREPRENEUR_DIR)/model.publicodes.js
	@echo "Running benchmark for auto-entrepreneur..."
	yarn --cwd $(AUTO_ENTREPRENEUR_DIR) run bun --expose-gc benchmark.ts

#> bench-all                | Run all benchmarks
bench-all: bench-simple-TJM bench-auto-entrepreneur
