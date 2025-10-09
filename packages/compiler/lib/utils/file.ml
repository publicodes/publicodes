type t = string

let pp = Stdlib.Format.pp_print_string

let read_file file_path =
  let read ic = In_channel.input_all ic in
  Stdlib.Format.print_flush () ;
  let binary_stdin () = In_channel.set_binary_mode In_channel.stdin true in
  match file_path with
  | "-" ->
      binary_stdin () ; read In_channel.stdin
  | file ->
      In_channel.with_open_bin file read

let write_file ~path ~content =
  let write s oc = Out_channel.output_string oc s in
  let binary_stdout () = Out_channel.(set_binary_mode stdout true) in
  match path with
  | "-" ->
      binary_stdout () ;
      write content Out_channel.stdout
  | file ->
      Out_channel.with_open_bin file (write content)
