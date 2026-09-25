Should correclty extract parameters from stacked contexts:

  $ publicodes compile ./stacked/ -o - | awk -f ../../../scripts/get_params.awk
    'out':
      params: ['c'],
    'c':
      params: ['c'],

Should correctly extract parameters from chained mechanisms, even when the rule
is overridden by a context:

  $ publicodes compile ./chained_mechanisms/ -o - | awk -f ../../../scripts/get_params.awk
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


Should correctly extract parameters from a complex context redefinition:

  $ publicodes compile ./redefinition/ -o - | awk -f ../../../scripts/get_params.awk
    'a':
      params: ['c'],
    'c':
      params: ['c'],

Should correctly extract parameters from rule with replacements:

  $ publicodes compile ./replacements/ -o - | awk -f ../../../scripts/get_params.awk
    'output':
      params: ['param 3',
               'param 2',
               'param 1'],
    'param 3':
      params: ['param 3'],
    'param 2':
      params: ['param 2'],
    'param 1':
      params: ['param 1'],

Should correctly extract parameters from rule with make not applicable:

  $ publicodes compile ./make_not_applicable/ -o - | awk -f ../../../scripts/get_params.awk
    'output':
      params: ['param 4',
               'param 3',
               'param 1'],
    'param 4':
      params: ['param 4'],
    'param 3':
      params: ['param 3'],
    'param 1':
      params: ['param 1'],
