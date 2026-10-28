This package contains a codemod script that you can use to update your codebase to the latest version of publicodes.

## Usage

```sh
npx @publicodes/codemod [options] <path>...
```

```sh
yarn codemod [options] <path>...
```

```sh
pnpm codemod [options] <path>...
```

Each `<path>` is either:

- a directory, which is walked recursively: every `.publicodes` file it contains is processed;
- a file, which is processed as-is (whatever its extension).

### Options

| Option            | Description                                                                                                                                                                                                                         |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `-f`, `--flatten` | Moves the files contained in the sub-directories of each given directory to its root, prefixing their name with the relative path of their directory (path segments joined by a dot). Empty sub-directories are removed afterwards. |
| `-h`, `--help`    | Prints the usage.                                                                                                                                                                                                                   |

For instance, `codemod --flatten codemod-testing` turns:

```text
codemod-testing/
├── one/
│   └── rules1.publicodes
└── two/
    └── rules2.publicodes
```

into:

```text
codemod-testing/
├── one.rules1.publicodes
└── two.rules2.publicodes
```

Deeper paths are flattened the same way (`one/sub/rules.publicodes` becomes `one.sub.rules.publicodes`), and files already at the root of the directory are left untouched. Two situations are reported as errors, and in both cases the codemod stops **before** modifying anything:

- two different files would end up with the same name, e.g. `a/b/rules.publicodes` and `a.b/rules.publicodes` both give `a.b.rules.publicodes`;
- the same file would be moved twice, because overlapping directories are given as targets (e.g. `--flatten . examples/first-package`).

Passing the same directory twice is harmless: the duplicate is ignored.

> [!WARNING]
> Files are modified **in place**, without any backup. Commit (or stash) your changes before running the codemod.

## Caveats

1. **This codemod will not update the `package.json` file**. You should update the version of the package manually.

2. **This codemod will not update the exotic syntax of variations**. If you use it, you should update the syntax manually **before** running the codemod.

3. **This codemod does not handle the breaking of replacement priority order change**.

4. **You'll need to update manually call to `evaluate` with publicodes expression** in your codebase, if needed.

See the [migration guide](https://v1.publi.codes/docs/guides/migration-v1) for more details.
