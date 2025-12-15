Simple addition/soustraction expression :

  $ publicodes compile simple.publicodes -t debug_eval_tree -o -
  simple expression :
  12. + 4.5

Missing term :

  $ publicodes compile missing_term.publicodes
  publicodes: FILES… arguments: no 'missing_term.publicodes' file or
              directory
  Usage: publicodes compile [OPTION]… [FILES]…
  Try 'publicodes compile --help' or 'publicodes --help' for more information.
  [124]
