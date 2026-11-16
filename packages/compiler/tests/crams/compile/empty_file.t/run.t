Should fail if the path does not exist:

  $ publicodes compile absent
  Error: path does not exists
  [124]

Should fail if the folder is empty:

  $ publicodes compile ./empty/
  Error: directory does not contains Publicodes files
  [124]

Should warn if there is an empty file in the folder:

  $ publicodes compile ./empty_file/ -o - -t debug_eval_tree
  warning[E039]: aucune règle trouvée dans `./empty_file/rules.publicodes`
  

Should warn if there si some files without rules but compile the others:

  $ publicodes compile ./some_empty_files/ -o - -t debug_eval_tree
  warning[E039]: aucune règle trouvée dans `./some_empty_files/empty-rules.publicodes`
  
  warning[E039]: aucune règle trouvée dans `./some_empty_files/only-comment.publicodes`
  
  output:
    10.

Should warn if the stdin is empty:

  $ publicodes compile - -o - -t debug_eval_tree
  warning[E039]: aucune règle trouvée dans `-`
  
