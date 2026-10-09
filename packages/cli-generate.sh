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
	# cleanup last comma
	jq -n -f /dev/stdin <<-EOF
		{
			"optionalDependencies": {
				$(
					targets | while read -r PLATFORM ARCH; do
						printf "\"%s-%s-%s\": \"%s\",\n" \
							"$NAME" "$PLATFORM" "$ARCH" "$VERSION"
					done
				)
			}
		}
	EOF
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
optional_dependencies | jq --tab -s \
	'(.[0] | with_entries(select(.key != "optionalDependencies"))) * .[1]' \
	cli/package.json /dev/stdin > "$tmp"
mv "$tmp" cli/package.json

# generate platform specific cli packages
targets | while read -r PLATFORM ARCH; do
	export PLATFORM
	export ARCH
	generate
done
