# @publicodes/tools

## 1.5.4

### Patch Changes

- [#635](https://github.com/publicodes/publicodes/pull/635) [`b424ed9`](https://github.com/publicodes/publicodes/commit/b424ed9fb9133933ddf278db4bce1d4c35edfac3) Thanks [@johangirod](https://github.com/johangirod)! - Fix CLI on windows

    Was not working because of incorrect path resolution

- Updated dependencies [[`56e0eea`](https://github.com/publicodes/publicodes/commit/56e0eea731961f8b8c7c1ceb207b89f24188147d), [`3eb89ef`](https://github.com/publicodes/publicodes/commit/3eb89efb2e84e4923aa6cbe61571eece246fbcd9), [`27ad272`](https://github.com/publicodes/publicodes/commit/27ad272639f0d16a2075df8a257852464f896f4f), [`5e17dea`](https://github.com/publicodes/publicodes/commit/5e17deaaf0e0013528226932a7df88c9a26425de)]:
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
