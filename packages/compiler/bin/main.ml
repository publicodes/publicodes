(* open Compiler *)
open Base

(* open Utils.Output *)
open Cmdliner

let publicodes =
  let doc = "Compiler for the Publicodes language." in
  let default =
    Term.(ret (const (`Help (`Auto, None))))
    (* show help *)
  in
  Cmd.group (Cmd.info "publicodes" ~doc) ~default @@ [Cmd_compile.cmd]

let main () = Cmd.eval' publicodes

let () = if !Sys.interactive then () else Stdlib.exit (main ())
(* let () = *)
(*   match Sys.get_argv () with *)
(*   | [|_; file_path|] -> ( *)
(*       print_endline ("Reading file: " ^ file_path) ; *)
(*       let raw_content = Utils.File.read_file file_path in *)
(*       let output = compile file_path raw_content in *)
(*       print_logs output ; *)
(*       match result output with *)
(*       | Some program -> *)
(*           print_endline program *)
(*       | None -> *)
(*           exit 1 ) *)
(*   | _ -> *)
(*       print_endline "Usage: ./main <file_path>" ; *)
(*       exit 1 *)
