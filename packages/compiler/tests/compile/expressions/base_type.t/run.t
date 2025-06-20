Simple base type (bool, number, date) :

  $ publicodes compile base.publicodes  -t debug_eval_tree -o -
  {
    "evaluation": [
      12.0, true, { "date": "2025-08" }, { "date": "2024-06-11" }, false
    ],
    "outputs": {}
  }


String :

  $ publicodes compile string.publicodes  -t debug_eval_tree -o -
  {
    "evaluation": [ "bla", "ouaha ouhah", "'foo'bar'", "No : \"foo\"" ],
    "outputs": {}
  }


Number with unit :

  $ publicodes compile number_with_unit.publicodes  -t debug_eval_tree -o -
  { "evaluation": [ 12.0, 3.5, 64465.55, 5.0, 4.0 ], "outputs": {} }
