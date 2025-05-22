type t = string [@@deriving show]

let read_file file_path =
  let read ic = Core.In_channel.input_all ic in
  Format.print_flush () ;
  let binary_stdin () =
    Core.In_channel.set_binary_mode Core.In_channel.stdin true
  in
  match file_path with
  | "-" ->
      binary_stdin () ; read Core.In_channel.stdin
  | file ->
      Core.In_channel.with_file file ~f:read ~binary:true

let write_file ~path ~content =
  let write s oc = Out_channel.output_string oc s in
  let binary_stdout () = Out_channel.(set_binary_mode stdout true) in
  match path with
  | "-" ->
      binary_stdout () ;
      write content Out_channel.stdout
  | file ->
      Out_channel.with_open_bin file (write content)
