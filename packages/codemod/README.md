This package contains a codemod script that you can use to update your codebase to the latest version of publicodes.

## Usage

```sh
npx @publicodes/codemod <path>...
```

```sh
yarn codemod <path>...
```

```sh
pnpm codemod <path>...
```

Each `<path>` is either:

- a directory, which is walked recursively: every `.publicodes` file it contains is processed;
- a file, which is processed as-is (whatever its extension).

> [!WARNING]
> Files are modified **in place**, without any backup. Commit (or stash) your changes before running the codemod.

## Caveats

1. **This codemod will not update the `package.json` file**. You should update the version of the package manually.

2. **This codemod will not update the exotic syntax of variations**. If you use it, you should update the syntax manually **before** running the codemod.

3. **This codemod does not handle the breaking of replacement priority order change**.

4. **You'll need to update manually call to `evaluate` with publicodes expression** in your codebase, if needed.

See the [migration guide](https://v1.publi.codes/docs/guides/migration-v1) for more details.
