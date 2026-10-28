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

## Replacements

Among other things, the codemod rewrites the `remplace` and `rend non applicable` mechanisms.

### Several referenced rules

`références à` only accepts a single rule in v2: an entry referencing several rules is split into one entry per rule, the other keys (`dans`, `sauf dans`, `exclusif`) being duplicated.

```yaml
# v1
a:
  remplace:
    - références à:
        - b
        - x
      sauf dans: y

# v2
a:
  remplace:
    - références à: b
      sauf dans: y
    - références à: x
      sauf dans: y
```

### `priorité`

`priorité` does not exist anymore. In v1, the applicable replacement with the highest priority wins; in v2, the last applicable replacement of a chain wins. When several rules replace the same rule, the codemod therefore chains them from the lowest priority up to the highest one, so that the highest priority still wins.

```yaml
# v1
cas de base:

exception 1:
  remplace: cas de base
  priorité: 2

exception 2:
  remplace: cas de base
  priorité: 1

# v2
cas de base:

exception 1:
  remplace: exception 2

exception 2:
  remplace: cas de base
```

Chaining is only performed when the order is unambiguous, i.e. when every rule replacing a given rule defines a distinct `priorité`. Otherwise the codemod prints a warning and leaves the replacements unchanged: choosing between `exclusif: oui` (when the rules cannot be applicable at the same time) and a chained replacement is a modeling decision that needs to be made by hand.

The warning reminds that, in v1, an implicit order existed: replacements were ordered by priority (an undefined priority counting as 0) then, for equal priorities, alphabetically — the alphabetically greatest rule name winning (e.g. `x . y` over `x`). It links to the [blog post presenting the new replacements](https://next.publi.codes/blog/v2-amelioration-remplacements/).

`priorité` is not supported in `rend non applicable` either: it is removed, with a warning.

## Caveats

1. **This codemod will not update the `package.json` file**. You should update the version of the package manually.

2. **This codemod will not update the exotic syntax of variations**. If you use it, you should update the syntax manually **before** running the codemod.

3. **Only the replacements with a `priorité` are chained**. The other ones are reported as warnings, to be handled manually (see [Replacements](#replacements)).

4. **You'll need to update manually call to `evaluate` with publicodes expression** in your codebase, if needed.

See the [migration guide](https://v1.publi.codes/docs/guides/migration-v1) for more details.
