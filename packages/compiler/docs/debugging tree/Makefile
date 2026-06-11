
check: check-schema check-example

check-schema:
	check-jsonschema -v --check-metaschema schema.json

check-example:
	check-jsonschema -v --schemafile schema.json example.json
