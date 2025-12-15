# Compiler test suite

This folder contains all the [cram
tests](https://dune.readthedocs.io/en/stable/reference/cram.html) used to test the compiler.

## Adding a test

Tests are grouped in subdirectories corresponding the tested command and defined
in a file `run.t` inside a directory with name that ends with `.t`.

For example, to add a test for the `compile` command:

```
tests/compile/
└── test_name.t
    ├── input.publicodes # input file
    ├── ...
    ├── input-2.publicodes # input file
    └── run.t <-- file to define the test
```

You we'll find more information about the `run.t` syntax [here](https://dune.readthedocs.io/en/stable/reference/cram.html).

> [!IMPORTANT]
> Only two consecutive spaces `  ` are detected as indentation.
