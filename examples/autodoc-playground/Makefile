.POSIX:

# Le compilateur du dépôt compile le modèle que cette page documente. Le chemin est un
# défaut : `make models COMPILER=<chemin>` pour un binaire installé ailleurs.
COMPILER ?= ../../packages/compiler/_build/default/bin/main.exe

# Les sources du modèle sont un sous-module : `git submodule update --init`.
UPSTREAM = vendored/publicodes-road-to-v2
V2 = $(UPSTREAM)/src/V2
OUT = $(abspath models/ekofest)

#> models                   | Compile the ekofest model and its JSON documentation
.PHONY: models
models:
	@test -x $(COMPILER) || { \
		echo "compilateur absent : make -C packages/compiler build" >&2; exit 1; }
	@test -d $(V2)/ekofest || { \
		echo "sous-module absent : git submodule update --init" >&2; exit 1; }
	@mkdir -p $(OUT)
	$(COMPILER) compile -C $(V2) -o $(OUT)/model.publicodes.js ekofest
	$(COMPILER) compile -t json -C $(V2) -o $(OUT)/model.publicodes.json ekofest
