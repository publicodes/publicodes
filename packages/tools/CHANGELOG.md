# @publicodes/tools

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
