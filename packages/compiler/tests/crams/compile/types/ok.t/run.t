Should correclty type check constant values:

  $ publicodes compile ./inputs -t debug_typed_eval_tree -o -
  auto-entrepreneur (boolean):
    boolean[if boolean[is_not_defined boolean[get_context(auto-entrepreneur)]]
      then boolean[false]
      else boolean[get_context(auto-entrepreneur)]
    ]
  
  charges (number):
    number[if boolean[(boolean[is_not_defined boolean[@auto-entrepreneur]]) ||
        (boolean[(boolean[boolean[@auto-entrepreneur] = boolean[false]]) ||
        (boolean[boolean[@auto-entrepreneur] = boolean[not_applicable]])])]
      then number[if boolean[is_not_defined number[get_context(charges)]]
          then number[if boolean[(boolean[number<€>[100. €] != number[not_applicable]]) &&
                (boolean[(number[(number[number<%>[10. %] * number[@chiffre d'affaires]]) *
                number[0.01]]) <
                number<€>[100. €]])]
              then number<€>[100. €]
              else number[(number[number<%>[10. %] * number[@chiffre d'affaires]]) *
                number[0.01]]
            ]
          else number[get_context(charges)]
        ]
      else number[not_applicable]
    ]
  
  chiffre d'affaires (number):
    number[10.]

  $ publicodes compile ./inputs -t debug_eval_tree -o -
  auto-entrepreneur:
    if is_not_defined get_context(auto-entrepreneur)
    then false
    else get_context(auto-entrepreneur)
  
  charges:
    if (is_not_defined @auto-entrepreneur) || ((@auto-entrepreneur = false) || (@auto-entrepreneur = not_applicable))
    then if is_not_defined get_context(charges)
      then if (100. € != not_applicable) && (((10. % * @chiffre d'affaires) * 0.01) < 100. €)
        then 100. €
        else (10. % * @chiffre d'affaires) * 0.01
      else get_context(charges)
    else not_applicable
  
  chiffre d'affaires:
    10.
