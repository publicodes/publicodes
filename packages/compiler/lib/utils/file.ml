type t = string [@@deriving show]

let read_file file_path =
  In_channel.with_open_text file_path In_channel.input_all

let write_file ~path ~content =
  let oc = open_out path in
  Printf.fprintf oc "%s" content;
  close_out oc
