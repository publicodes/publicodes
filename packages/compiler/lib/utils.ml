module File = struct
  let read_file file_path =
    In_channel.with_open_text file_path In_channel.input_lines
    |> Core.String.concat ~sep:"\n"

  let write_file file_path content =
    let oc = open_out file_path in
    Printf.fprintf oc "%s" content;
    close_out oc
end
