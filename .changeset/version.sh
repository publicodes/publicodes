#!/bin/sh -xe

changeset version
prettier --write '**/CHANGELOG.md'

version="$(jq -r .version packages/cli/package.json)"
sed -i \
	"s/(version [[:digit:]]\+\.[[:digit:]]\+\.[[:digit:]]\+-alpha\.[[:digit:]]\+)/(version $version)/" \
	packages/compiler/dune-project
sed -i \
	"s/version: \"[[:digit:]]\+\.[[:digit:]]\+\.[[:digit:]]\+-alpha\.[[:digit:]]\+\"/version: \"$version\"/" \
	packages/compiler/publicodes.opam
