Should init a config file with default values when the dir is empty:

  $ mkdir my-model && cd my-model
  $ publicodes init
  Project correclty initialized with "publicodes.yaml"
  $ cat publicodes.yaml
  targets:
  - output: my-model.publicodes.js
    inputs:
    - src/index.publicodes
    type: js
    default_to_public: false
  $ ls -R
  .:
  publicodes.yaml
  src
  
  ./src:
  index.publicodes


The compile command should not fail with the default config file:

  $ publicodes compile
  $ [ -r my-model.publicodes.js ]
