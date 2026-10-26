Should correctly parse rules from stdin:

  $ echo "result: 10 + 2" | publicodes compile -t debug_eval_tree - -o -
  result:
    10. + 2.
	a:
		valeur: 10

FIXME: Should correctly report errors from stdin files:

  $ echo "result: 10 + oui" | publicodes compile - -o -
  error[E023]: types non cohérents entre eux
      ╒══ unknown:1:1
    1 │  
  publicodes: internal error, uncaught exception:
              File "lib/ansi_renderer/snippet_renderer.ml", line 433, characters 8-14: Assertion failed
              Raised at Grace_ansi_renderer__Snippet_renderer.Inline_labels.fold_hanging_segments_with_cursor_and_pointers.loop in file "lib/ansi_renderer/snippet_renderer.ml", line 433, characters 8-49
              Called from Grace_ansi_renderer__Snippet_renderer.Inline_labels.fold_hanging_segments_with_cursor_and_pointers.loop in file "lib/ansi_renderer/snippet_renderer.ml", line 439, characters 10-87
              Called from Stdlib__Format.kfprintf.(fun) in file "format.ml", line 1444, characters 16-34
              Called from Stdlib__Format.kfprintf.(fun) in file "format.ml", line 1444, characters 16-34
              Called from Grace_ansi_renderer__Snippet_renderer.pbox in file "lib/ansi_renderer/snippet_renderer.ml", line 270, characters 4-38
              Called from Stdlib__Format.output_acc in file "format.ml", line 1383, characters 4-20
              Called from Stdlib__Format.kfprintf.(fun) in file "format.ml", line 1444, characters 16-34
              Called from Grace_ansi_renderer__Snippet_renderer.pp_line in file "lib/ansi_renderer/snippet_renderer.ml", line 658, characters 4-62
              Called from Stdlib__List.iteri in file "list.ml", line 116, characters 12-17
              Called from Stdlib__List.iteri in file "list.ml", line 116, characters 12-17
              Called from Stdlib__List.iter in file "list.ml", line 112, characters 12-15
              Called from Grace_ansi_renderer__Snippet_renderer.pp_snippet in file "lib/ansi_renderer/snippet_renderer.ml", lines 846-852, characters 5-41
              Called from Utils__Grace_log_formatter.print in file "lib/utils/grace_log_formatter.ml", line 86, characters 2-70
              Called from Base__List0.iter in file "src/list0.ml", line 66, characters 4-7
              Called from Dune__exe__Compile.compile_target in file "bin/compile.ml", line 15, characters 2-19
              Called from Dune__exe__Cmd_compile.cmd in file "bin/cmd_compile.ml", line 114, characters 7-50
              Called from Dune__exe__Cmd_compile.cmd in file "bin/cmd_compile.ml", lines 60-114, characters 4-50
              Called from Cmdliner_term.app.(fun) in file "cmdliner_term.ml", line 24, characters 19-24
              Called from Cmdliner_eval.run_parser in file "cmdliner_eval.ml", line 35, characters 37-44
      │  
  [125]
