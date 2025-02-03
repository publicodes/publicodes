CLI tools and utilities for Publicodes.

## Installation

```sh
npm install @publicodes/tools
```

## Features

- **Compilation**: Convert .publicodes files into JSON models and TypeScript types
- **Rule Imports**: Import rules from NPM packages using the `importer!` syntax
- **Optimization**: Optimize models using constant folding
- **Migration**: Tools for migrating between Publicodes versions
- **CLI**: Command-line interface for easy project setup, compilation and development

## Usage

**Create a new Publicodes project**

```
$ npx @publicodes/tools init
```

**Compile it**

```
$ npm run publicodes compile
```

**Create a dev server for rule documentation**

```
$ npm run publicodes dev
```

## Documentation

For full documentation, visit [publi.codes/docs/api/tools](https://publi.codes/docs/api/tools)
