# @publicodes/tools

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
