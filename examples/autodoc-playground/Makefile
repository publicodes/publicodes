.POSIX:

# Le compilateur du dépôt compile le modèle que cette page documente. Le chemin est un
# défaut : `make models COMPILER=<chemin>` pour un binaire installé ailleurs.
COMPILER ?= ../../packages/compiler/_build/default/bin/main.exe
EKOFEST = models/ekofest

#> models                   | Compile the ekofest model and its JSON documentation
.PHONY: models
models:
	@test -x $(COMPILER) || { \
		echo "compilateur absent : make -C packages/compiler build" >&2; exit 1; }
	@echo "Recompiling the ekofest model and its JSON documentation..."
	$(COMPILER) compile -C $(EKOFEST) .
	$(COMPILER) compile -t json -C $(EKOFEST) .
