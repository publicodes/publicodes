open Base
open Shared.Rule_name

let outputs_to_json (outputs : Shared.Model_outputs.t) :
    (string * Yojson.Safe.t) list =
  List.map outputs
    ~f:(fun Shared.Model_outputs.{rule_name; typ; parameters; meta} ->
      let rule_str = to_string rule_name in
      let parameters =
        `Assoc (List.map parameters ~f:(fun rule -> (to_string rule, `Null)))
      in
      let type_info =
        let open Shared.Typ in
        match typ with
        | Some (Number (Some unit)) ->
            `Assoc
              [ ("number", `Bool true)
              ; ( "unit"
                , `String (Stdlib.Format.asprintf "%a" Shared.Units.pp unit) )
              ]
        | Some (Number None) ->
            `Assoc [("number", `Bool true)]
        | Some (Literal String) ->
            `Assoc [("string", `Bool true)]
        | Some (Literal Bool) ->
            `Assoc [("boolean", `Bool true)]
        | Some (Literal Date) ->
            `Assoc [("date", `Bool true)]
        | None ->
            `Null
      in
      let meta =
        let open Shared.Shared_ast in
        `Assoc
          ( meta
          |> List.filter_map ~f:(function
               | Description desc ->
                   Some [("description", `String desc)]
               | Title title ->
                   Some [("title", `String title)]
               | Note note ->
                   Some [("note", `String note)]
               | Custom_meta (`Assoc m) ->
                   Some m
               | Custom_meta _ ->
                   None
               | Public ->
                   None )
          |> List.concat )
      in
      ( rule_str
      , `Assoc [("parameters", parameters); ("type", type_info); ("meta", meta)]
      ) )
