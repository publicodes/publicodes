#!/bin/sh -eu

JS_TESTS_DIR=./tests/runtimes/JS
EXAMPLES_DIR=examples
EXAMPLES="auto-entrepreneur simple-TJM"
CLI_DIR=../cli
COMPILER_PATH=_build/default/bin/main.exe

need_rebuild() {
	if ! [ -r "$1" ]; then
		return 0
	fi
	target="$(stat -c %Y "$1")"
	shift
	while : ; do
		if [ -z "$*" ]; then
			break
		fi
		cur="$(stat -c %Y "$1")"
		if [ "$cur" -gt "$target" ]; then
			return 0
		fi
		shift
	done
	return 1
}

_help() {
	cat <<-EOF
		Usage: $(basename "$0")
		Subcommands:
		  install            # Install OCaml dependencies using opam
		  install-js         # Install JavaScript dependencies using yarn
		  build              # Build the compiler using dune
		  dev                # Run the dune build in watch mode for development (needed for LSP server)
		  test-all           # Run all tests (JavaScript and OCaml)
		  test-js            # Run JavaScript tests using yarn
		  test-ocaml         # Run OCaml unit and cram tests using dune
		  test-ocaml-promote # Run OCaml tests and promote cram test outputs
		  bench-%            # Run the benchmark for a given example (e.g. make bench-simple-TJM)
	EOF
}

install() {
	echo "Installing dependencies..."
	opam install . --deps-only --with-test --with-doc --with-dev-setup
}

install_js() {
	echo "Installing JavaScript dependencies..."
	yarn --cwd "$EXAMPLES_DIR" install
}

build() {
	echo "Building the compiler..."
	dune build
}

dev() {
	dune build --watch
}

test_all() {
	test_ocaml
	test_js
}

test_ocaml() {
	echo "Running OCaml tests..."
	dune test
}

test_ocaml_promote() {
	echo "Running OCaml tests and promoting cram test outputs..."
	dune promote
}

test_js() {
	echo "Running JavaScript tests..."
	PUBLICODES_COMPILER_PATH=../../../"$COMPILER_PATH" yarn --cwd "$JS_TESTS_DIR" test
}

bench() {
	name="$1"

	if need_rebuild "$COMPILER_PATH"; then
		build
	fi

	(
		cd "$EXAMPLES_DIR/$name"

		if need_rebuild model.publicodes.js ./*.publicodes; then
			echo "Recompiling legacy publicodes-build for $name..."
			yarn run publicodes compile '*.publicodes'
		fi

		if need_rebuild model.publicodes.js ./*.publicodes; then
			echo "Recompiling new model.publicodes.js for $name..."
			../../"$COMPILER_PATH" compile ./*.publicodes
		fi

		echo "Running benchmark for $name..."
		yarn run bun --expose-gc benchmark.ts
	)
}

cmd="${1:-help}"
shift || true
case "$cmd" in
	install|install-js|build|dev|test-all|test-ocaml|test-ocaml-promote|test-js)
		cmd="$(printf %s "$cmd" | sed 's|-|_|g')"
		"$cmd" "$@"
		;;
	bench-*)
		bench "${cmd#bench-}"
		;;
	"help") # is a builtin
		_help
		;;
	*)
		printf "Unknown command \"%s\"\n" "$cmd" >&2
		_help
		;;
esac
