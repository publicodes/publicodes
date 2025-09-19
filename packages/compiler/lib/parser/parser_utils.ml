open Core
open Utils.Output
open Yaml_parser

let get_value value = (Pos.value value).value

let get_scalar ~pos (value : yaml) =
  match value with
  | `Scalar s ->
      return s
  | _ ->
      let code, message = Err.parsing_should_be_scalar in
      fatal_error ~pos ~kind:`Syntax ~code message
        ~hints:
          [ "Une chaine de caractères simple est attendue, mais un objet ou un \
             tableau a été trouvé."
          ; "Vérifiez l'indentation." ]

let parse_array ~pos
    ~(parse :
       ?error_if_undefined:bool -> pos:Pos.pos -> yaml -> Ast.value Output.t )
    (yaml : yaml) =
  match yaml with
  | `A seq ->
      let* parsed_nodes = seq |> List.map ~f:(parse ~pos) |> all_keep_logs in
      return parsed_nodes
  | _ ->
      let code, message = Err.parsing_should_be_array in
      fatal_error ~pos ~kind:`Syntax ~code message

let remove_double (mapping : mapping) : mapping Output.t =
  let seen_keys = ref (Set.empty (module String)) in
  let result_mapping = ref [] in
  let logs = ref [] in
  List.iter mapping ~f:(fun (key, value) ->
      let key_value = get_value key in
      let key_pos = Pos.pos key in
      if Set.mem !seen_keys key_value then
        let code, message = Err.yaml_duplicate_key in
        (* TODO: show the two keys in labels *)
        logs :=
          Log.error ~code ~pos:key_pos ~kind:`Syntax
            ~hints:["Vérifiez votre YAML pour les clés en double"]
            message
          :: !logs
      else (
        seen_keys := Set.add !seen_keys key_value ;
        result_mapping := (key, value) :: !result_mapping ) ) ;
  return ~logs:!logs (List.rev !result_mapping)

let parse_ref s =
  let {value; _}, pos = s in
  let expr = Expr.parse_expression ~pos value in
  match expr with
  | Some (Ref rule_name, _), _ ->
      return (Pos.mk ~pos rule_name)
  | _ ->
      let code, message = Err.invalid_rule_name in
      fatal_error ~pos ~kind:`Syntax ~code message
        ~hints:
          [ Printf.sprintf
              "un nom de règle doit être de la forme suivante : `mon namespace \
               . ma règle` ou `ma règle`" ]

let parse_refs ~pos yaml =
  let* scalars = yaml |> List.map ~f:(get_scalar ~pos) |> all_keep_logs in
  let* refs = List.map ~f:parse_ref scalars |> all_keep_logs in
  return refs

let find_value key mapping =
  List.find_map mapping ~f:(fun (k, value) ->
      if String.equal (get_value k) key then
        Some (Pos.mk ~pos:(Pos.pos k) value)
      else None )

let check_authorized_keys ~keys mapping =
  let logs =
    List.filter_map mapping ~f:(fun (k, _) ->
        let unexpected_key =
          List.find ~f:(fun str -> not (String.equal (get_value k) str)) keys
        in
        let code, message = Err.parsing_invalid_mechanism in
        match unexpected_key with
        | None ->
            Some
              (Log.error ~code ~pos:(Pos.pos k) ~kind:`Syntax
                 ~hints:
                   [Format.asprintf "La clé `%s` n'est pas valide" (get_value k)]
                 message )
        | Some _ ->
            None )
  in
  return ~logs ()

let parse_one_or_many ~f yaml =
  match yaml with
  | `A yaml ->
      List.map ~f yaml |> all_keep_logs
  | _ ->
      let+ value = f yaml in
      [value]
