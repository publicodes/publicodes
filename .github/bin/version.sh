#!/bin/sh -e

# We depends on workspace packages, so we have to bump yarn.lock after version.

yarn run version
YARN_ENABLE_IMMUTABLE_INSTALLS=false yarn install --refresh-lockfile
