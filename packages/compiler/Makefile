.POSIX:
.SUFFIXES:

JS_TESTS_DIR = ./tests/runtimes/JS
TEST ?=
CLI_DIR = ../cli
COMPILER_PATH = _build/default/bin/main.exe

EXAMPLES_DIR = examples
SIMPLE_TJM_DIR = $(EXAMPLES_DIR)/simple-TJM
SIMPLE_TJM_DEPS = $(SIMPLE_TJM_DIR)/inputs/TJM.publicodes
AUTO_ENTREPRENEUR_DIR = $(EXAMPLES_DIR)/auto-entrepreneur
AUTO_ENTREPRENEUR_DEPS = \
	$(AUTO_ENTREPRENEUR_DIR)/inputs/auto-entrepreneur.publicodes \
	$(AUTO_ENTREPRENEUR_DIR)/inputs/cotisations-et-contributions.publicodes \
	$(AUTO_ENTREPRENEUR_DIR)/inputs/exoneration.publicodes \
	$(AUTO_ENTREPRENEUR_DIR)/inputs/external.publicodes \
	$(AUTO_ENTREPRENEUR_DIR)/inputs/impot.publicodes

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
	@echo "  bench-all                | Run all benchmarks"
	@echo "  bench-simple-TJM         | Run the benchmark for the simple-TJM example"
	@echo "  bench-auto-entrepreneur  | Run the benchmark for the auto-entrepreneur example"

#> install                  | Install OCaml dependencies using opam
install:
	@echo "Installing dependencies..."
	opam switch create . --deps-only --with-test --with-dev-setup

#> install-js               | Install JavaScript dependencies using pnpm
install-js:
	@echo "Installing JavaScript dependencies..."
	pnpm -C $(EXAMPLES_DIR) install

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

#
# Benchmarks
#

$(SIMPLE_TJM_DIR)/publicodes-build/index.js: $(SIMPLE_TJM_DEPS)
	@echo "Recompiling legacy publicodes-build for simple-TJM..."
	cd $(SIMPLE_TJM_DIR) && pnpm exec publicodes compile 'inputs/*.publicodes'

$(SIMPLE_TJM_DIR)/model.publicodes.js: $(SIMPLE_TJM_DEPS) $(COMPILER_PATH)
	@echo "Recompiling new model.publicodes.js for simple-TJM..."
	$(COMPILER_PATH) compile -C $(SIMPLE_TJM_DIR) inputs

$(SIMPLE_TJM_DIR)/model.publicodes.json: $(SIMPLE_TJM_DEPS) $(COMPILER_PATH)
	@echo "Recompiling new model.publicodes.json for simple-TJM..."
	$(COMPILER_PATH) compile -t json -C $(SIMPLE_TJM_DIR) inputs

#> bench-simple-TJM         | Run the benchmark for the simple-TJM example
bench-simple-TJM: build $(SIMPLE_TJM_DIR)/publicodes-build/index.js $(SIMPLE_TJM_DIR)/model.publicodes.js
	@echo "Running benchmark for simple-TJM..."
	cd $(SIMPLE_TJM_DIR) && pnpm exec bun --expose-gc benchmark.ts

$(AUTO_ENTREPRENEUR_DIR)/publicodes-build/index.js: $(AUTO_ENTREPRENEUR_DEPS)
	@echo "Recompiling legacy publicodes-build for auto-entrepreneur..."
	cd $(AUTO_ENTREPRENEUR_DIR) && pnpm exec publicodes compile 'inputs/*.publicodes'

$(AUTO_ENTREPRENEUR_DIR)/model.publicodes.js: $(AUTO_ENTREPRENEUR_DEPS) $(COMPILER_PATH)
	@echo "Recompiling new model.publicodes.js for auto-entrepreneur..."
	$(COMPILER_PATH) compile -C $(AUTO_ENTREPRENEUR_DIR) inputs

$(AUTO_ENTREPRENEUR_DIR)/model.publicodes.json: $(AUTO_ENTREPRENEUR_DEPS) $(COMPILER_PATH)
	@echo "Recompiling new model.publicodes.json for auto-entrepreneur..."
	$(COMPILER_PATH) compile -t json -C $(AUTO_ENTREPRENEUR_DIR) inputs

#> bench-auto-entrepreneur  | Run the benchmark for the auto-entrepreneur example
bench-auto-entrepreneur: build $(AUTO_ENTREPRENEUR_DIR)/publicodes-build/index.js $(AUTO_ENTREPRENEUR_DIR)/model.publicodes.js
	@echo "Running benchmark for auto-entrepreneur..."
	cd $(AUTO_ENTREPRENEUR_DIR) && pnpm exec bun --expose-gc benchmark.ts

#> bench-all                | Run all benchmarks
bench-all: bench-simple-TJM bench-auto-entrepreneur

#> build-autodoc-example   | Compile the example models the autodoc reads
build-autodoc-example: build $(AUTO_ENTREPRENEUR_DIR)/model.publicodes.json \
	$(AUTO_ENTREPRENEUR_DIR)/model.publicodes.js \
	$(SIMPLE_TJM_DIR)/model.publicodes.json \
	$(SIMPLE_TJM_DIR)/model.publicodes.js
