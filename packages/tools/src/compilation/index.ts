/** @packageDocumentation

## Compile a model from a source

{@link getModelFromSource | `getModelFromSource`} allows to compile a set of Publicodes
files into a {@link index.RawRules | `RawRules`} that can be used by the Publicodes
{@link https://publi.codes/docs/api/core#new-enginerules | `Engine`}.

Note that it supports the `importer!` syntax to import other Publicodes rules from
NPM packages --
see {@link https://publicodes.github.io/tools/modules/compilation.html#md:import-rules-from-a-npm-package | Imports rules from a NPM package}.

### Usage

```typescript
import { getModelFromSource } from '@publicodes/tools/compilation'

const model = getModelFromSource(
	'data\/**\/*.publicodes', // could simply be 'data'
	{
		ignore: ['data/test/**'],
		verbose: true
	},
)
```

## Import rules from a NPM package

To import rules from a _packaged_ Publicodes model, you need to specify the following syntax :

```yaml
importer!:
  depuis:
    nom: <npm_package_name>
    source: <path_to_the_model_file> (optional)
    url: <url_to_the_package_documentation> (optional)
  dans: <namespace> (optional)
  les règles:
    - <rule_name_from_the_npm_package>
    - <rule_name_from_the_npm_package>:
      <attr_to_overwrite>: <value>
      ...
    ...
```


When compiling , each YAML entry `importer!` will be replaced by all imported rules and
their dependencies by {@link getModelFromSource | `getModelFromSource`}.

@see

{@link compilation.ImportMacro | `ImportMacro`} for more details.

@note

By default if no `source` is specified, the model is assumed to be
compiled {@link index.RawRules | `RawRules`} into `<package_name>.model.json`
in the NPM package root folder.

If no `dans` is specified, the rules will be imported in a namespace corresponding
to the package name (`nom`).

*/
export * from './getModelFromSource'
export * from './resolveImports'
