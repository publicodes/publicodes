help : Makefile
	@sed -n 's/^#> //p' $<

JS_TESTS_DIR = tests/runtimes/JS
EXAMPLES_DIR = examples
EXAMPLES_DIRS = $(wildcard $(EXAMPLES_DIR)/*)
CLI_DIR = ../cli
COMPILER_PATH = _build/default/bin/main.exe

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

#> test-all                 | Run all tests (JavaScript and OCaml)
test-all: test-ocaml test-js

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

#
# Benchmarks
#

define make_bench_rules
$(EXAMPLES_DIR)/$(1)/publicodes-build/index.js: $(wildcard $(EXAMPLES_DIR)/$(1)/*.publicodes)
	@echo "Recompiling legacy publicodes-build for $(1)..."
	yarn --cwd $(EXAMPLES_DIR)/$(1) run publicodes compile '*.publicodes'

$(EXAMPLES_DIR)/$(1)/model.publicodes.js: $(wildcard $(EXAMPLES_DIR)/$(1)/*.publicodes) $(COMPILER_PATH)
	@echo "Recompiling new model.publicodes.js for $(1)..."
	cd $(EXAMPLES_DIR)/$(1) && ../../$(COMPILER_PATH) compile *.publicodes
endef

# Generate rules for each example directory to only recompile when relevant
# .publicodes files change or when the compiler itself changes.
$(foreach dir,$(notdir $(EXAMPLES_DIRS)),$(eval $(call make_bench_rules,$(dir))))


#> bench-%                  | Run the benchmark for a given example (e.g. make bench-simple-TJM)
bench-%: build $(EXAMPLES_DIR)/%/publicodes-build/index.js $(EXAMPLES_DIR)/%/model.publicodes.js
	@echo "Running benchmark for $*..."
	cd $(EXAMPLES_DIR)/$* && bun --expose-gc benchmark.ts
