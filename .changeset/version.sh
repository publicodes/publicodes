#!/bin/sh -e

# We depends on workspace packages, so we have to bump yarn.lock after version.

yarn run version
yarn install
