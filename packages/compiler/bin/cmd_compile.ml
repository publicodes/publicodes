open Base
open Cmdliner
open Cmdliner.Term.Syntax

let exit_syntax_err = 1

let files = Arg.(non_empty & pos_all file [] & info [] ~docv:"FILE")

let compile files =
  Stdlib.Printf.printf "Compiling files: %s\n" (String.concat ~sep:", " files) ;
  Cmd.Exit.ok

let cmd =
  let doc = "Compile a Publicodes program from file or stdin." in
  let exits =
    Cmd.Exit.info exit_syntax_err ~doc:"on syntax error" :: Cmd.Exit.defaults
  in
  Cmd.v (Cmd.info "compile" ~doc ~version:"%%VERSION%%" ~exits)
  @@
  let+ files = files in
  compile files
