Compile targets from a Yaml config file :

  $ publicodes compile -c config.valid.yaml
  $ [ -r test1.js ]
  $ [ -r test2.js ]

Fail on invalid format with a precise message :

  $ publicodes compile -c config.invalid.yaml
  Error: "targets" field error: "inputs" field error: Expected a string value
  [124]
