# Autodoc

The compiler can emit a JSON representation of the AST with extra metadata
informations, like: types, source positions and unique node id mapped to the
trace values.

It's currently used to have automatic documentation and trace explanations via
`@publicodes/autodoc`.

The structure of the JSON is defined in the following JSON Schema:
[`./schema.json`](./schema.json).
