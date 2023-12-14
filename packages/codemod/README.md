# codemod

This package contains a codemod script that you can use to update your codebase to the latest version of publicodes.

## Usage

```
yarn @publicodes/codemod <path-to-publicode-folder>
```

```
npx @publicodes/codemod <path-to-publicode-folder>
```

## Caveats

1. **This codemod will not update the `package.json` file**. You should update the version of the package manually.

2. **This codemod will not update the exotic syntax of variations**. If you use it, you should update the syntax manually **before** running the codemod.

3. **This codemod does not handle the breaking of replacement priority order change**. 

4. **You'll need to update manually call to `evaluate` with publicodes expression** in your codebase, if needed.