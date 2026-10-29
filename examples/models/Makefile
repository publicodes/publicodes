.POSIX:
.SUFFIXES:

help:
	@echo "Available targets:"
	@echo "  models                   | Compile every model, its JS runtime and its JSON documentation"
	@echo "  bench-all                | Run every benchmark"
	@echo "  bench-simple-TJM         | Run the benchmark for the simple-TJM model"
	@echo "  bench-auto-entrepreneur  | Run the benchmark for the auto-entrepreneur model"

# Le compilateur du dépôt compile ces modèles ; `COMPILER=<chemin>` pour un binaire ailleurs.
COMPILER ?= ../../packages/compiler/_build/default/bin/main.exe

SIMPLE_TJM_DIR = simple-TJM
SIMPLE_TJM_DEPS = $(SIMPLE_TJM_DIR)/inputs/TJM.publicodes
AUTO_ENTREPRENEUR_DIR = auto-entrepreneur
AUTO_ENTREPRENEUR_DEPS = \
	$(AUTO_ENTREPRENEUR_DIR)/inputs/auto-entrepreneur.publicodes \
	$(AUTO_ENTREPRENEUR_DIR)/inputs/cotisations-et-contributions.publicodes \
	$(AUTO_ENTREPRENEUR_DIR)/inputs/exoneration.publicodes \
	$(AUTO_ENTREPRENEUR_DIR)/inputs/external.publicodes \
	$(AUTO_ENTREPRENEUR_DIR)/inputs/impot.publicodes

#> models                   | Compile every model, its JS runtime and its JSON documentation
.PHONY: models
models:
	@test -x $(COMPILER) || { \
		echo "compilateur absent : make -C packages/compiler build" >&2; exit 1; }
	$(MAKE) $(AUTO_ENTREPRENEUR_DIR)/model.publicodes.json \
		$(AUTO_ENTREPRENEUR_DIR)/model.publicodes.js \
		$(SIMPLE_TJM_DIR)/model.publicodes.json \
		$(SIMPLE_TJM_DIR)/model.publicodes.js

$(SIMPLE_TJM_DIR)/model.publicodes.js: $(SIMPLE_TJM_DEPS) $(COMPILER)
	@echo "Recompiling new model.publicodes.js for simple-TJM..."
	$(COMPILER) compile -C $(SIMPLE_TJM_DIR) inputs

$(SIMPLE_TJM_DIR)/model.publicodes.json: $(SIMPLE_TJM_DEPS) $(COMPILER)
	@echo "Recompiling new model.publicodes.json for simple-TJM..."
	$(COMPILER) compile -t json -C $(SIMPLE_TJM_DIR) inputs

$(AUTO_ENTREPRENEUR_DIR)/model.publicodes.js: $(AUTO_ENTREPRENEUR_DEPS) $(COMPILER)
	@echo "Recompiling new model.publicodes.js for auto-entrepreneur..."
	$(COMPILER) compile -C $(AUTO_ENTREPRENEUR_DIR) inputs

$(AUTO_ENTREPRENEUR_DIR)/model.publicodes.json: $(AUTO_ENTREPRENEUR_DEPS) $(COMPILER)
	@echo "Recompiling new model.publicodes.json for auto-entrepreneur..."
	$(COMPILER) compile -t json -C $(AUTO_ENTREPRENEUR_DIR) inputs

# The benchmarks compare this parser's runtime against the v1 engine's, so they need the
# model compiled by both.

$(SIMPLE_TJM_DIR)/publicodes-build/index.js: $(SIMPLE_TJM_DEPS)
	@echo "Recompiling legacy publicodes-build for simple-TJM..."
	cd $(SIMPLE_TJM_DIR) && pnpm exec publicodes compile 'inputs/*.publicodes'

$(AUTO_ENTREPRENEUR_DIR)/publicodes-build/index.js: $(AUTO_ENTREPRENEUR_DEPS)
	@echo "Recompiling legacy publicodes-build for auto-entrepreneur..."
	cd $(AUTO_ENTREPRENEUR_DIR) && pnpm exec publicodes compile 'inputs/*.publicodes'

#> bench-simple-TJM         | Run the benchmark for the simple-TJM model
bench-simple-TJM: $(SIMPLE_TJM_DIR)/publicodes-build/index.js \
	$(SIMPLE_TJM_DIR)/model.publicodes.js
	@echo "Running benchmark for simple-TJM..."
	cd $(SIMPLE_TJM_DIR) && pnpm exec bun --expose-gc benchmark.ts

#> bench-auto-entrepreneur  | Run the benchmark for the auto-entrepreneur model
bench-auto-entrepreneur: $(AUTO_ENTREPRENEUR_DIR)/publicodes-build/index.js \
	$(AUTO_ENTREPRENEUR_DIR)/model.publicodes.js
	@echo "Running benchmark for auto-entrepreneur..."
	cd $(AUTO_ENTREPRENEUR_DIR) && pnpm exec bun --expose-gc benchmark.ts

#> bench-all                | Run all benchmarks
bench-all: bench-simple-TJM bench-auto-entrepreneur
