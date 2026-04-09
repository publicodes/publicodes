JS_TESTS_DIR = ./tests/runtimes/JS
EXAMPLES_DIR = examples
EXAMPLES_DIRS = \
	$(EXAMPLES_DIR)/auto-entrepreneur \
	$(EXAMPLES_DIR)/simple-TJM
CLI_DIR = ../cli
COMPILER_PATH = _build/default/bin/main.exe

help:
	@sed -n 's/^#> //p' Makefile
.PHONY: help

#> install                  | Install OCaml dependencies using opam
install:
	@echo "Installing dependencies..."
.PHONY: install
	opam install . --deps-only --with-test --with-doc --with-dev-setup

#> install-js               | Install JavaScript dependencies using yarn
install-js:
	@echo "Installing JavaScript dependencies..."
	yarn --cwd $(EXAMPLES_DIR) install
.PHONY: install-js

#> build                    | Build the compiler using dune
build:
	@echo "Building the compiler..."
	dune build
.PHONY: build

#> dev                      | Run the dune build in watch mode for development (needed for LSP server)
dev:
	dune build --watch
.PHONY: dev

#
# Tests
#

#> test-all                 | Run all tests (JavaScript and OCaml)
test-all: test-ocaml test-js
.PHONY: test-all

#> test-js                  | Run JavaScript tests using yarn
test-js: build
	@echo "Running JavaScript tests..."
	PUBLICODES_COMPILER_PATH=../../../$(COMPILER_PATH) yarn --cwd $(JS_TESTS_DIR) test
.PHONY: test-js

#> test-ocaml               | Run OCaml unit and cram tests using dune
test-ocaml:
	@echo "Running OCaml tests..."
	dune test
.PHONY: test-ocaml

#> test-ocaml-promote       | Run OCaml tests and promote cram test outputs
test-ocaml-promote:
	@echo "Running OCaml tests and promoting cram test outputs..."
	dune promote
.PHONY: test-ocaml-promote

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
	yarn --cwd $(EXAMPLES_DIR)/$* run bun --expose-gc benchmark.ts
