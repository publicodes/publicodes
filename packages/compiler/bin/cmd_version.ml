open Base
open Cmdliner
open Utils
open Cmdliner.Term.Syntax

let cmd =
  let doc = "Provides version information for the Publicodes environment." in
  let exits =
    Cmd.Exit.info Cli.exit_parsing_err ~doc:"on parsing error"
    :: Cmd.Exit.defaults
  in
  Cmd.v (Cmd.info "version" ~doc ~exits)
  @@ let+ _ = Term.const () in
     Stdlib.Printf.printf "Publicodes version \"%s\"\n" Version.version ;
     ( match File.publicodes_path with
     | Some value ->
         Stdlib.Printf.printf "Environment PUBLICODESPATH \"%s\"\n" value
     | None ->
         Stdlib.Printf.printf "Environment PUBLICODESPATH \"\"\n" ) ;
     ( match File.default_publicodes_path with
     | Some value ->
         Stdlib.Printf.printf "Default PUBLICODESPATH \"%s\"\n" value
     | None ->
         Stdlib.Printf.printf "Default PUBLICODESPATH \"\"\n" ) ;
     Cmd.Exit.ok
