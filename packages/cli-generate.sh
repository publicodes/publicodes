#!/bin/sh -e

# PLATFORMS aix darwin freebsd linux openbsd sunos win32
# ARCHS arm arm64 ia32 loong64 mips mipsel ppc64 riscv64 s390 s390x x64
targets() {
	cat <<-EOF
		darwin x64
		darwin arm64
		linux x64
		linux arm64
		win32 x64
	EOF
}

generate() {
	printf "Generating %s %s\n" "$PLATFORM" "$ARCH" >&2
	rsync -a --exclude '*.tmpl' --exclude 'dst' \
		cli-template/ "cli-$PLATFORM-$ARCH"/
	envsubst \
		< cli-template/package.json.tmpl \
		> "cli-$PLATFORM-$ARCH"/package.json
}

optional_dependencies() {
	first=1
	targets | while read -r PLATFORM ARCH; do
		if [ -z "$first" ]; then
			printf ", "
		fi
		first=
		printf "\"%s-%s-%s\": \"%s\"" \
			"$NAME" "$PLATFORM" "$ARCH" "$VERSION"
	done
}


fixed() {
	printf '"%s"' "$NAME"
	targets | while read -r PLATFORM ARCH; do
		printf ", \"%s-%s-%s\"" \
			"$NAME" "$PLATFORM" "$ARCH"
	done
}

cd "$(dirname "$0")" || exit 1

# extract some variables
exports="$(jq -r '"
	export NAME=\"\(.name)\"
	export VERSION=\"\(.version)\"
	export DESCRIPTION=\"\(.description)\"
"' < cli/package.json)"
eval "$exports"

# refresh optionalDependencies
tmp="$(mktemp)"
jq --tab ".optionalDependencies = {$(optional_dependencies)}" cli/package.json > "$tmp"
mv "$tmp" cli/package.json

# refresh fixed
tmp="$(mktemp)"
jq --tab ".fixed = [[$(fixed)]]" ../.changeset/config.json > "$tmp"
mv "$tmp" ../.changeset/config.json

# generate platform specific cli packages
targets | while read -r PLATFORM ARCH; do
	export PLATFORM
	export ARCH
	generate
done
