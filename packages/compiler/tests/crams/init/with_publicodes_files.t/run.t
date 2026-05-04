Should correclty parse existing publicodes files:

  $ publicodes init
  Project correclty initialized with "publicodes.yaml"
  $ cat publicodes.yaml
  targets:
  - output: with_publicodes_files.t.publicodes.js
    inputs:
    - ./src/file1.publicodes
    - ./src/subdir/file2.publicodes
    - ./src/subdir/file3.publicodes
    type: js
    default_to_public: false
  $ ls -R
  .:
  publicodes.yaml
  src
  
  ./src:
  file1.publicodes
  subdir
  
  ./src/subdir:
  file2.publicodes
  file3.publicodes
  non-publicodes
