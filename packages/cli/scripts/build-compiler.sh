#!/bin/bash

# Enable strict error handling:
# -e: exit immediately if any command fails
# -u: treat unset variables as an error
# -o pipefail: fail if any command in a pipeline fails (not just the last one)
set -euo pipefail

# Paths (adjust these relative paths as needed for your project structure)
COMPILER_DIR="$(dirname "$0")/../../compiler"
CLI_BIN_COMPILER_DIR="$(dirname "$0")/../dist/bin/compiler"
BUILT_BINARY="$COMPILER_DIR/_build/install/default/bin/publicodes"
DEST_BINARY="$CLI_BIN_COMPILER_DIR/publicodes"

# 1. Run dune build in the compiler package
echo "Building compiler with dune..."
cd "$COMPILER_DIR" && dune build
cd -

echo "Done."


# 2. Ensure destination directory exists
mkdir -p "$CLI_BIN_COMPILER_DIR"

# 3. Copy the generated binary
echo "Copying compiler binary..."
echo "$DEST_BINARY"
cp -f "$BUILT_BINARY" "$DEST_BINARY"

# 4. Make the binary executable
chmod +x "$DEST_BINARY"

echo "Done."
