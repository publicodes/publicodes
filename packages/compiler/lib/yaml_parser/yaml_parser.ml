open Utils
open Core

type t =
  | Scalar of Yaml.scalar With_pos.t
  | Alias of string With_pos.t
  | A of sequence With_pos.t
  | O of mapping With_pos.t
  | Nothing of unit With_pos.t
  | EOF

and sequence = {
  s_anchor : string option;
  s_tag : string option;
  s_implicit : bool;
  s_members : t list;
}

and mapping = {
  m_anchor : string option;
  m_tag : string option;
  m_implicit : bool;
  m_members : (t * t) list;
}

let pos_of_yaml (ep : Yaml.Stream.Event.pos) : With_pos.pos =
  {
    (* TODO: find a way to get the file name *)
    With_pos.dummy_pos
    with
    start_pos = (ep.start_mark.line, ep.start_mark.column);
    end_pos = (ep.end_mark.line, ep.end_mark.column);
  }

let parse raw_content =
  let open Result.Monad_infix in
  let rec parse_event parser :
      Yaml.Stream.Event.t * Yaml.Stream.Event.pos ->
      (t, [ `Msg of string ]) result = function
    | Document_end _, _ -> Ok EOF
    | Scalar s, pos -> Ok (Scalar (With_pos.mk (pos_of_yaml pos) s))
    | Alias { anchor }, pos -> Ok (Alias (With_pos.mk (pos_of_yaml pos) anchor))
    | Nothing, pos -> Ok (Nothing (With_pos.mk (pos_of_yaml pos) ()))
    | Sequence_start { anchor; tag; implicit; style = _ }, pos ->
        parse_sequence_members parser [] >>= fun members ->
        Ok
          (A
             (With_pos.mk (pos_of_yaml pos)
                {
                  s_anchor = anchor;
                  s_tag = tag;
                  s_implicit = implicit;
                  s_members = members;
                }))
    | Mapping_start { anchor; tag; implicit; style = _ }, pos ->
        parse_mapping_members parser [] >>= fun members ->
        Ok
          (O
             (With_pos.mk (pos_of_yaml pos)
                {
                  m_anchor = anchor;
                  m_tag = tag;
                  m_implicit = implicit;
                  m_members = members;
                }))
    | _ -> failwith "TODO"
  and parse_sequence_members parser members =
    Yaml.Stream.do_parse parser >>= function
    | Sequence_end, _ -> Ok (List.rev members)
    | e ->
        parse_event parser e >>= fun m ->
        parse_sequence_members parser (m :: members)
  and parse_mapping_members parser members =
    Yaml.Stream.do_parse parser >>= function
    | Mapping_end, _ -> Ok (List.rev members)
    | e ->
        parse_event parser e >>= fun k ->
        Yaml.Stream.do_parse parser >>= fun v_event ->
        parse_event parser v_event >>= fun v ->
        parse_mapping_members parser ((k, v) :: members)
  in
  Yaml.Stream.parser raw_content >>= fun parser ->
  Yaml.Stream.do_parse parser >>= fun e -> parse_event parser e

(* let parse' raw_content = *)
(*   (* let raw_content = Utils.File.read_file file_path in *) *)
(*   let result = Yaml.yaml_of_string raw_content in *)
(*   match result with Ok yaml -> Ok yaml | Error (`Msg msg) -> Error msg *)

(* let print yaml = *)
(*   match Yaml.yaml_to_string ~encoding:`Utf8 yaml with *)
(*   | Ok yaml_string -> Printf.printf "%s\n" yaml_string *)
(*   | Error _ -> print_endline "Failed to convert YAML to string" *)
