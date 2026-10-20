open Base
open Cmdliner

let publicodes =
  let doc = "Compiler for the Publicodes language." in
  let default = Term.(ret (const (`Help (`Auto, None)))) in
  Cmd.group (Cmd.info "publicodes" ~doc ~version:Version.version) ~default @@ [Cmd_compile.cmd]

let main () = Cmd.eval' publicodes

let () = if !Sys.interactive then () else Stdlib.exit (main ())
