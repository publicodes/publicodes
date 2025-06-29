let print prefix pps =
  Pp_tty.print @@ Pp.hovbox
  @@ Pp.concat (prefix :: Pp.text "," :: Pp.space :: pps) ;
  print_newline ()

let info = print Pp_tty.(tag Style.Prompt (Pp.verbatim "Info"))

let error = print Pp_tty.(tag Style.Error (Pp.verbatim "Erreur"))

let ok = print Pp_tty.(tag Style.Ok (Pp.verbatim "Succès"))
