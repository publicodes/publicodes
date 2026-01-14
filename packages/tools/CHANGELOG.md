# @publicodes/tools

## 1.8.1

### Patch Changes

- [#783](https://github.com/publicodes/publicodes/pull/783) [`017831d`](https://github.com/publicodes/publicodes/commit/017831d9a8e8021e6a50a52bc0db826add1bc964) Thanks [@Clemog](https://github.com/Clemog)! - Fix default situations path for quick-doc build

- [#788](https://github.com/publicodes/publicodes/pull/788) [`7a670e5`](https://github.com/publicodes/publicodes/commit/7a670e5c221a7b7217832d7a800b9b9b0c942efc) Thanks [@EmileRolley](https://github.com/EmileRolley)! - Use workspace version in dependencies and explicitly add styled-components

- Updated dependencies [[`b442de9`](https://github.com/publicodes/publicodes/commit/b442de9f9c6bd2acda87673282e729832a0d6ed7)]:
    - publicodes@1.10.1
    - @publicodes/react-ui@1.10.0

## 1.8.0

### Minor Changes

- [#750](https://github.com/publicodes/publicodes/pull/750) [`c692b25`](https://github.com/publicodes/publicodes/commit/c692b25b719890c6101c247385dca5f56a0e128b) Thanks [@Clemog](https://github.com/Clemog)! - Set up build command for quick doc

### Patch Changes

- Updated dependencies [[`7d1716c`](https://github.com/publicodes/publicodes/commit/7d1716c2b276e17f9f246fdf367f8aee64856ed9)]:
    - @publicodes/react-ui@1.10.0

## 1.7.2

### Patch Changes

- [#663](https://github.com/publicodes/publicodes/pull/663) [`9bc6f6c`](https://github.com/publicodes/publicodes/commit/9bc6f6cb0b9edf0f83041efe095f7dbea07cd914) Thanks [@johangirod](https://github.com/johangirod)! - `publicodes dev` : fix hot reload of rules & situations

- [#663](https://github.com/publicodes/publicodes/pull/663) [`9bc6f6c`](https://github.com/publicodes/publicodes/commit/9bc6f6cb0b9edf0f83041efe095f7dbea07cd914) Thanks [@johangirod](https://github.com/johangirod)! - Fix the --watch option on publicodes compile

- Updated dependencies [[`9a49053`](https://github.com/publicodes/publicodes/commit/9a49053cec5c87d6b046e461d2d2aae29c45bce8)]:
    - publicodes@1.8.2

## 1.7.1

### Patch Changes

- [#658](https://github.com/publicodes/publicodes/pull/658) [`baf3ec3`](https://github.com/publicodes/publicodes/commit/baf3ec385959a8960ff5297673ee0470f8e70fd2) Thanks [@johangirod](https://github.com/johangirod)! - Fix bug when compiling une possibilité with inlined rule

## 1.7.0

### Minor Changes

- [#656](https://github.com/publicodes/publicodes/pull/656) [`dce3353`](https://github.com/publicodes/publicodes/commit/dce33539e53f65deb3b33724639bbbdadde3f0ed) Thanks [@johangirod](https://github.com/johangirod)! - Add --watch option to compile

## 1.6.0

### Minor Changes

- [#648](https://github.com/publicodes/publicodes/pull/648) [`fdabbdd`](https://github.com/publicodes/publicodes/commit/fdabbddbb23e8fafc58e57a123dc508f56b2a797) Thanks [@EmileRolley](https://github.com/EmileRolley)! - Fix the `dev` command to use the correct path to `quick-doc`
- [#648](https://github.com/publicodes/publicodes/pull/648) [`fdabbdd`](https://github.com/publicodes/publicodes/commit/fdabbddbb23e8fafc58e57a123dc508f56b2a797) Thanks [@EmileRolley](https://github.com/EmileRolley)! - Add a new `--template` flag to the `init` command

## 1.5.4

### Patch Changes

- [`366e235`](https://github.com/publicodes/publicodes/commit/366e23545055d66048c09cf703f3f5e305eff54d) - Fix CLI on windows

    Was not working because of incorrect path resolution

- [`322e71c`](https://github.com/publicodes/publicodes/commit/322e71ccc876de629917a6e53f1dc28b5238bed0) Thanks [@Clemog](https://github.com/Clemog)! - improve tools/init and fix optim

    - Add an option to have `prettier` configuration in the generated project
    - Add VSCode configuration for Publicodes syntax highlighting & LSP integration
    - Fix `optim` command not working with new `une possibilité` mecanism

- Updated dependencies [[`366e235`](https://github.com/publicodes/publicodes/commit/366e23545055d66048c09cf703f3f5e305eff54d), [`366e235`](https://github.com/publicodes/publicodes/commit/366e23545055d66048c09cf703f3f5e305eff54d), [`366e235`](https://github.com/publicodes/publicodes/commit/366e23545055d66048c09cf703f3f5e305eff54d), [`366e235`](https://github.com/publicodes/publicodes/commit/366e23545055d66048c09cf703f3f5e305eff54d)]:
    - publicodes@1.8.0

## 1.5.3

### Patch Changes

- [`105039a`](https://github.com/publicodes/publicodes/commit/105039aec9fdebf819f75b87dba469d904431711) Thanks [@johangirod](https://github.com/johangirod)! - Fix publicodes dev

## 1.5.2

### Patch Changes

- [#618](https://github.com/publicodes/publicodes/pull/618) [`fec543d`](https://github.com/publicodes/publicodes/commit/fec543d77e1fb260f32b930965688d08296491f4) Thanks [@johangirod](https://github.com/johangirod)! - Fix infinite update loop on publicodes dev

## 1.5.0

### Minor Changes

- [#612](https://github.com/publicodes/publicodes/pull/612) [`3c7da29`](https://github.com/publicodes/publicodes/commit/3c7da292472d3784bbedbbf55a62938873bb9c27) Thanks [@johangirod](https://github.com/johangirod)! - Add new CLI commands and enhance development tools

    The package now provides a complete CLI with the following commands:

    - `init`: Initialize a new publicodes project with proper configuration
    - `compile`: Build publicodes rules into importable JS/TS modules
    - `dev`: Start a local documentation server for live rule exploration

    Key improvements:

    - New project scaffolding with `npx @publicodes/tools init`
    - Support for multiple package managers (npm, yarn, pnpm, bun)
    - Integrated testing setup with Vitest
    - Automatic TypeScript types generation for rules
    - Interactive documentation server with hot-reload
    - Built-in support for situations/examples in documentation

    For detailed usage instructions, see:
    https://publi.codes/docs/guides/creer-un-modele

    Example usage:

    ```sh
    # Create a new project
    npx @publicodes/tools init

    # Compile rules
    npx publicodes compile

    # Start documentation server
    npx publicodes dev
    ```

    See the documentation for more details about configuring the tools in your package.json.

### Patch Changes

- Updated dependencies [[`eaa9636`](https://github.com/publicodes/publicodes/commit/eaa963644e17360110b23c45f4617eb69122f805), [`48ab070`](https://github.com/publicodes/publicodes/commit/48ab0703e8c8017766fa785aa02f11482d6998ba), [`ac107c4`](https://github.com/publicodes/publicodes/commit/ac107c4ee2ea6c316d4f56bc318e6fc04accadc8)]:
    - @publicodes/react-ui@1.7.0
    - publicodes@1.7.0
