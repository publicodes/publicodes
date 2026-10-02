
test: test-schema test-example

test-schema:
	check-jsonschema -v --check-metaschema schema.json

test-example:
	check-jsonschema -v --schemafile schema.json example.json
