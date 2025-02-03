---
'@publicodes/tools': minor
---

Add new CLI commands and enhance development tools

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
