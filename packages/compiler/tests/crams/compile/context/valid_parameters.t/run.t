Should correclty extract parameters from stacked contexts:

  $ publicodes compile ./stacked/ -o - | awk -f ../../../scripts/get_params.awk
    'c':
      params: ['c'],
    'out':
      params: ['c'],

Should correctly extract parameters from chained mechanisms, even when the rule
is overridden by a context:

  $ publicodes compile ./chained_mechanisms/ -o - | awk -f ../../../scripts/get_params.awk
    'h':
      params: ['h'],
    'g':
      params: ['g'],
    'f':
      params: ['f'],
    'e':
      params: ['e'],
    'd':
      params: ['d'],
    'c':
      params: ['c'],
    'x':
      params: ['x'],
    'a':
      params: ['h',
               'g',
               'f',
               'e',
               'd',
               'c'],
    'b':
      params: ['x',
               'h',
               'g',
               'f',
               'e',
               'd',
               'c'],


Should correctly extract parameters from a complex context redefinition:

  $ publicodes compile ./redefinition/ -o - | awk -f ../../../scripts/get_params.awk
    'c':
      params: ['c'],
    'a':
      params: ['c'],
