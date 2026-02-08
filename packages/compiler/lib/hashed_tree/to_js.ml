open Base
open Shared
open Shared.Eval_tree

let rulename_to_js_identifier (rule_name : Rule_name.t) : string =
  Rule_name.to_string rule_name
  |> String.substr_replace_all ~pattern:"_" ~with_:"___"
  |> String.substr_replace_all ~pattern:" " ~with_:"_"
  (* It's impossible to have more than two consecutives spaces in a Publicodes rule name. *)
  (* Valid in latest ES version but not in olders ones *)
  |> String.substr_replace_all ~pattern:"." ~with_:"·"
  |> String.substr_replace_all ~pattern:"'" ~with_:"ʹ"
  |> String.substr_replace_all ~pattern:"-" ~with_:"__t__"
  |> String.substr_replace_all ~pattern:"«" ~with_:"__go__"
  |> String.substr_replace_all ~pattern:"»" ~with_:"__gf__"
  |> String.substr_replace_all ~pattern:"\"" ~with_:"__d__"
  |> String.substr_replace_all ~pattern:"€" ~with_:"__euro__"
  |> String.substr_replace_all ~pattern:"%" ~with_:"__pct__"
  |> String.substr_replace_all ~pattern:"²" ~with_:"__sq__"

let%test_unit "There should be no conflicts over JS identifiers" =
  let rulenames : Shared.Rule_name.t list =
    [ ["a"]
    ; ["a%"]
    ; ["a\""]
    ; ["a_"]
    ; ["a°"]
    ; ["a»"]
    ; ["A"]
    ; ["a$"]
    ; ["a€"]
    ; ["a²"]
    ; ["a a"]
    ; ["a'a"]
    ; ["a-a"]
    ; ["a_a"]
    ; ["a . b"]
    ; ["a'b"]
    ; ["a\"b"]
    ; ["a_b"]
    ; ["a_ c"]
    ; ["a b c"]
    ; ["a'b\"c"]
    ; ["a-b-c"]
    ; ["a\"b'c"]
    ; ["a\"b\"c"]
    ; ["a_b_c"]
    ; ["a_euro_"]
    ; ["a«b»c"]
    ; ["a__deg__"] ]
  in
  let rulename_js_ids =
    List.map rulenames ~f:rulename_to_js_identifier
    |> List.stable_dedup ~compare:String.compare
  in
  [%test_eq: int] (List.length rulenames) (List.length rulename_js_ids)

let rulename_to_ts_type_name (rule_name : Rule_name.t) : string =
  Printf.sprintf "%sParams" (rulename_to_js_identifier rule_name)

(* -------------------- JSDoc Type Generation -------------------- *)

let get_rule_str_unit (tree : Tree.t) (rule_name : Rule_name.t) : string option
    =
  let open Shared.Typ in
  let Tree.{typ; _} = Eval_tree.get_meta tree rule_name in
  match typ with
  | Some (Number (Some unit)) ->
      Some (Stdlib.Format.asprintf "%a" Shared.Units.pp unit)
  | _ ->
      None

let get_rule_js_type (tree : Tree.t) (rule_name : Rule_name.t) : string =
  let open Shared.Typ in
  let Tree.{typ; _} = Eval_tree.get_meta tree rule_name in
  match typ with
  | Some (Number _) ->
      "number"
  | Some (Literal String) ->
      "string"
  | Some (Literal Bool) ->
      "boolean"
  | Some (Literal Date) ->
      "Date"
  | None ->
      "unknown"

let get_rule_publicodes_type (tree : Tree.t) (rule_name : Rule_name.t) : string
    =
  let open Shared.Typ in
  let Tree.{typ; _} = Eval_tree.get_meta tree rule_name in
  match typ with
  | Some (Number _) ->
      "number"
  | Some (Literal String) ->
      "text"
  | Some (Literal Bool) ->
      "boolean"
  | Some (Literal Date) ->
      "date"
  | None ->
      ""

let binary_op_to_js : Shared.Shared_ast.binary_op -> string = function
  | Shared.Shared_ast.Add ->
      "$add"
  | Sub ->
      "$sub"
  | Mul ->
      "$mul"
  | Div ->
      "$div"
  | Pow ->
      "$pow"
  | Eq ->
      "$eq"
  | NotEq ->
      "$neq"
  | Lt ->
      "$lt"
  | Gt ->
      "$gt"
  | GtEq ->
      "$gte"
  | LtEq ->
      "$lte"
  | And ->
      "$and"
  | Or ->
      "$or"
  | Min ->
      "$min"
  | Max ->
      "$max"

let is_lazy : Shared_ast.binary_op -> bool = function
  | And | Or | Lt | Gt | GtEq | LtEq | Pow | Div | Mul ->
      true
  | Add | Sub | Eq | NotEq | Min | Max ->
      false

(* -------------------- Pp-based value conversion -------------------- *)

let date_to_js_pp = function
  | Eval_tree.Date (Day {day; month; year}) ->
      Pp.verbatimf "new Date('%d-%02d-%02d')" year month day
  | Date (Month {month; year}) ->
      Pp.verbatimf "new Date('%02d-%02d')" year month
  | _ ->
      failwith "Unsupported date format in JS conversion"

let rec value_to_js_pp ({value; _} : Tree.value) =
  match value with
  | Eval_tree.Const (Eval_tree.Number (n, _)) ->
      Pp.verbatimf "%.16g" n
  | Const (String s) ->
      let s =
        s
        |> String.strip ~drop:(Char.equal '\'')
        |> String.substr_replace_all ~pattern:"\"" ~with_:"\\\""
      in
      Pp.verbatimf "\"%s\"" s
  | Const (Bool b) ->
      Pp.verbatimf "%b" b
  | Const (Date d) ->
      date_to_js_pp (Date d)
  | Const Null ->
      Pp.verbatim "null"
  | Const Undefined ->
      Pp.verbatim "undefined"
  | Round (mode, precision, value) ->
      let rounding_mode =
        match mode with
        | Nearest ->
            Pp.verbatim "'nearest'"
        | Up ->
            Pp.verbatim "'up'"
        | Down ->
            Pp.verbatim "'down'"
      in
      Pp.concat
        [ Pp.verbatim "$round("
        ; rounding_mode
        ; Pp.verbatim ", "
        ; value_to_js_pp value
        ; Pp.verbatim ", () => "
        ; value_to_js_pp precision
        ; Pp.verbatim ")" ]
  | Condition (cond, then_comp, else_comp) ->
      Pp.hovbox ~indent:2
        (Pp.concat
           [ Pp.verbatim "$cond("
           ; Pp.break ~nspaces:0 ~shift:0
           ; value_to_js_pp cond
           ; Pp.verbatim ","
           ; Pp.break ~nspaces:1 ~shift:0
           ; Pp.verbatim "() => "
           ; value_to_js_pp then_comp
           ; Pp.verbatim ","
           ; Pp.break ~nspaces:1 ~shift:0
           ; Pp.verbatim "() => "
           ; value_to_js_pp else_comp
           ; Pp.break ~nspaces:0 ~shift:0
           ; Pp.verbatim ")" ] )
  | Binary_op ((op, _), left, right) ->
      Pp.hovbox ~indent:2
        (Pp.concat
           [ Pp.verbatim (binary_op_to_js op)
           ; Pp.verbatim "("
           ; Pp.break ~nspaces:0 ~shift:0
           ; value_to_js_pp left
           ; Pp.verbatim ","
           ; Pp.break ~nspaces:1 ~shift:0
           ; (if is_lazy op then Pp.verbatim "() => " else Pp.nop)
           ; value_to_js_pp right
           ; Pp.break ~nspaces:0 ~shift:0
           ; Pp.verbatim ")" ] )
  | Unary_op ((Neg, _), comp) ->
      Pp.concat [Pp.verbatim "(- "; value_to_js_pp comp; Pp.verbatim ")"]
  | Unary_op ((Is_undef, _), comp) ->
      Pp.concat
        [Pp.verbatim "("; value_to_js_pp comp; Pp.verbatim " === undefined)"]
  | Ref rule_name ->
      Pp.hovbox ~indent:2
        (Pp.concat
           [ Pp.verbatim "$ref("
           ; Pp.break ~nspaces:0 ~shift:0
           ; Pp.verbatimf "\"%s\"," (Rule_name.to_string rule_name)
           ; Pp.break ~nspaces:1 ~shift:0
           ; Pp.verbatimf "_%s," (rulename_to_js_identifier rule_name)
           ; Pp.break ~nspaces:1 ~shift:0
           ; Pp.verbatim "ctx,"
           ; Pp.break ~nspaces:1 ~shift:0
           ; Pp.verbatim "params"
           ; Pp.break ~nspaces:0 ~shift:0
           ; Pp.verbatim ")" ] )
  | Get_context rule_name ->
      Pp.hovbox ~indent:2
        (Pp.concat
           [ Pp.verbatim "$get("
           ; Pp.break ~nspaces:0 ~shift:0
           ; Pp.verbatimf "\"%s\"," (Rule_name.to_string rule_name)
           ; Pp.break ~nspaces:1 ~shift:0
           ; Pp.verbatim "ctx,"
           ; Pp.break ~nspaces:1 ~shift:0
           ; Pp.verbatim "params"
           ; Pp.break ~nspaces:0 ~shift:0
           ; Pp.verbatim ")" ] )
  | Set_context {context; value} ->
      let context_items =
        List.map context ~f:(fun ((rule_name, _), value) ->
            Pp.hovbox ~indent:2
              (Pp.concat
                 [ Pp.verbatimf "\"%s\":" (Rule_name.to_string rule_name)
                 ; Pp.break ~nspaces:1 ~shift:0
                 ; value_to_js_pp value ] ) )
      in
      let context_str =
        Pp.concat_map
          ~sep:(Pp.concat [Pp.verbatim ","; Pp.break ~nspaces:1 ~shift:0])
          ~f:Fn.id context_items
      in
      Pp.hovbox ~indent:2
        (Pp.concat
           [ Pp.verbatim "((ctx) =>"
           ; Pp.break ~nspaces:1 ~shift:0
           ; value_to_js_pp value
           ; Pp.verbatim ")("
           ; Pp.break ~nspaces:0 ~shift:0
           ; Pp.hovbox ~indent:2
               (Pp.concat
                  [ Pp.verbatim "{"
                  ; Pp.break ~nspaces:1 ~shift:0
                  ; Pp.verbatim "...ctx,"
                  ; Pp.break ~nspaces:1 ~shift:0
                  ; context_str
                  ; Pp.break ~nspaces:1 ~shift:0
                  ; Pp.verbatim "}" ] )
           ; Pp.break ~nspaces:0 ~shift:0
           ; Pp.verbatim ")" ] )

(* -------------------- Pp-based JSDoc generation -------------------- *)

let find_title (meta : Shared_ast.rule_meta list) : string option =
  List.find_map meta ~f:(fun m ->
      match m with Shared_ast.Title t -> Some t | _ -> None )

let find_description (meta : Shared_ast.rule_meta list) : string option =
  List.find_map meta ~f:(fun m ->
      match m with Shared_ast.Description d -> Some d | _ -> None )

(** Generate JSDoc description lines from a multi-line string.
    Each line is prefixed with " * ". *)
let description_to_jsdoc_pp (desc : string) =
  let lines = String.split_lines desc in
  Pp.concat_map lines ~sep:Pp.newline ~f:(fun line ->
      if String.is_empty (String.strip line) then Pp.verbatim " *"
      else Pp.verbatimf " * %s" line )

let to_js_str_pp str =
  let js_str =
    str
    |> String.substr_replace_all ~pattern:"'" ~with_:"\\'"
    |> String.substr_replace_all ~pattern:"\n" ~with_:"\\n"
    |> String.substr_replace_all ~pattern:"\t" ~with_:"\\t"
  in
  Pp.verbatimf "'%s'" js_str

let get_params_jsdoc_typedef_pp (tree : Tree.t) (rule_name : Rule_name.t)
    (parameters : Rule_name.t list) =
  let type_name = rulename_to_ts_type_name rule_name in
  let parameters_type =
    Pp.concat_map parameters
      ~f:(fun param ->
        let param_name =
          Rule_name.to_string param
          |> String.substr_replace_all ~pattern:"'" ~with_:"\\'"
        in
        let param_type = get_rule_js_type tree param in
        Pp.verbatimf " *  '%s'?: %s | undefined" param_name param_type )
      ~sep:(Pp.concat [Pp.verbatim ";"; Pp.newline])
  in
  Pp.box ~indent:0
    (Pp.concat
       [ Pp.verbatim "/**"
       ; Pp.newline
       ; Pp.verbatimf " * Parameters of \"%s\"" (Rule_name.to_string rule_name)
       ; Pp.newline
       ; Pp.verbatim " * @typedef {{"
       ; Pp.newline
       ; parameters_type
       ; Pp.newline
       ; Pp.verbatimf " * }} %s" type_name
       ; Pp.newline
       ; Pp.verbatim " */" ] )

let get_evaluate_params_jsdoc_pp (tree : Tree.t) (rule_name : Rule_name.t) =
  let return_type = get_rule_js_type tree rule_name in
  let type_name = rulename_to_ts_type_name rule_name in
  Pp.box ~indent:0
    (Pp.concat
       [ Pp.verbatim "/**"
       ; Pp.newline
       ; Pp.verbatimf
           " * Evaluate \"%s\" with information on missing and needed \
            parameters"
           (Rule_name.to_string rule_name)
       ; Pp.newline
       ; Pp.verbatimf
           " * @type {(params?: %s, options?: {cache?: boolean}) => {value: %s \
            | undefined | null, needed: Array<keyof %s>, missing: Array<keyof \
            %s>}}"
           type_name return_type type_name type_name
       ; Pp.newline
       ; Pp.verbatim " */" ] )

let get_evaluate_jsdoc_pp (tree : Tree.t) (rule_name : Rule_name.t) =
  let return_type = get_rule_js_type tree rule_name in
  let type_name = rulename_to_ts_type_name rule_name in
  Pp.box ~indent:0
    (Pp.concat
       [ Pp.verbatim "/**"
       ; Pp.newline
       ; Pp.verbatimf " * Evaluate \"%s\"" (Rule_name.to_string rule_name)
       ; Pp.newline
       ; Pp.verbatimf
           " * @type {(params?: %s, options?: {cache?: boolean}) => %s | \
            undefined | null}"
           type_name return_type
       ; Pp.newline
       ; Pp.verbatim " */" ] )

let get_meta_properties_jsdoc_pp (meta : Shared_ast.rule_meta list)
    (rule_name_str : string) =
  let meta_docs =
    List.filter_map meta ~f:(fun meta ->
        match meta with
        | Title title ->
            Some
              (Pp.concat
                 [ Pp.verbatim "/** @type {string} */"
                 ; Pp.newline
                 ; Pp.verbatim "title: "
                 ; to_js_str_pp title
                 ; Pp.verbatim "," ] )
        | Description desc ->
            Some
              (Pp.concat
                 [ Pp.verbatim "/** @type {string} */"
                 ; Pp.newline
                 ; Pp.verbatim "description: "
                 ; to_js_str_pp desc
                 ; Pp.verbatim "," ] )
        | Note note ->
            Some
              (Pp.concat
                 [ Pp.verbatim "/** @type {string} */"
                 ; Pp.newline
                 ; Pp.verbatim "note: "
                 ; to_js_str_pp note
                 ; Pp.verbatim "," ] )
        | Custom_meta meta ->
            Some
              (Pp.concat
                 [ Pp.verbatimf "/** Custom meta of rule \"%s\" */" rule_name_str
                 ; Pp.newline
                 ; Pp.verbatim "meta: "
                 ; Pp.verbatim (Yojson.Safe.to_string meta)
                 ; Pp.verbatim " /** @type {const} */"
                 ; Pp.verbatim "," ] )
        | Public ->
            None )
  in
  Pp.concat_map ~sep:Pp.newline ~f:Fn.id meta_docs

(* -------------------- Main Code Generation Functions -------------------- *)

let rules_to_js_functions_pp hashed_tree =
  let rules =
    Base.Hashtbl.fold hashed_tree ~init:[] ~f:(fun ~key:rule ~data acc ->
        let rule_type = get_rule_js_type hashed_tree rule in
        let rule_name = rulename_to_js_identifier rule in
        let rule_data = value_to_js_pp data in
        (rule_type, rule_name, rule_data) :: acc )
    |> List.sort ~compare:(fun (_, name1, _) (_, name2, _) ->
           String.compare name1 name2 )
  in
  let function_docs =
    List.map rules ~f:(fun (rule_type, rule_name, rule_data) ->
        Pp.box ~indent:0
          (Pp.concat
             [ Pp.verbatimf "/** @type {Fn<%s>} */" rule_type
             ; Pp.newline
             ; Pp.verbatimf "function _%s(ctx, params) {" rule_name
             ; Pp.newline
             ; Pp.verbatim "  return /** @type {"
             ; Pp.verbatim rule_type
             ; Pp.verbatim "} */ ("
             ; Pp.newline
             ; Pp.verbatim "    "
             ; rule_data
             ; Pp.newline
             ; Pp.verbatim "  )"
             ; Pp.newline
             ; Pp.verbatim "}" ] ) )
  in
  Pp.concat_map ~sep:(Pp.concat [Pp.newline; Pp.newline]) ~f:Fn.id function_docs

let has_meta_properties (meta : Shared_ast.rule_meta list) =
  List.exists meta ~f:(fun m ->
      match m with Shared_ast.Public -> false | _ -> true )

let generate_rule_object_pp hashed_tree
    Model_outputs.{rule_name; parameters; meta; _} =
  let publicodes_rule_type = get_rule_publicodes_type hashed_tree rule_name in
  let rule_name_str = Rule_name.to_string rule_name in
  let rule_name_js = rulename_to_js_identifier rule_name in
  let type_name = rulename_to_ts_type_name rule_name in
  let params_typedef =
    get_params_jsdoc_typedef_pp hashed_tree rule_name parameters
  in
  let title = find_title meta in
  let description = find_description meta in
  let rule_property_jsdoc =
    let has_doc = Option.is_some title || Option.is_some description in
    if has_doc then
      Pp.concat
        [ Pp.verbatim "/**"
        ; Pp.newline
        ; ( match title with
          | Some t ->
              Pp.concat [Pp.verbatimf " * **%s**" t; Pp.newline]
          | None ->
              Pp.nop )
        ; ( match description with
          | Some desc ->
              Pp.concat
                [ ( if Option.is_some title then
                      Pp.concat [Pp.verbatim " *"; Pp.newline]
                    else Pp.nop )
                ; description_to_jsdoc_pp desc
                ; Pp.newline ]
          | None ->
              Pp.nop )
        ; Pp.verbatim " */"
        ; Pp.newline ]
    else Pp.nop
  in
  let evaluate_jsdoc = get_evaluate_jsdoc_pp hashed_tree rule_name in
  let evaluate_params_jsdoc =
    get_evaluate_params_jsdoc_pp hashed_tree rule_name
  in
  let meta_properties = get_meta_properties_jsdoc_pp meta rule_name_str in
  let params_list =
    List.map parameters ~f:(fun p -> to_js_str_pp (Rule_name.to_string p))
  in
  let params_list_doc =
    if List.is_empty params_list then Pp.verbatim "[]"
    else
      Pp.hovbox ~indent:2
        (Pp.concat
           [ Pp.verbatim "["
           ; Pp.cut
           ; Pp.concat_map
               ~sep:(Pp.concat [Pp.verbatim ","; Pp.break ~nspaces:1 ~shift:0])
               ~f:Fn.id params_list
           ; Pp.cut
           ; Pp.verbatim "]" ] )
  in
  let unit_property =
    match get_rule_str_unit hashed_tree rule_name with
    | Some unit ->
        Pp.concat
          [ Pp.verbatimf "/** @type {\"%s\"} */" unit
          ; Pp.newline
          ; Pp.verbatimf "unit: \"%s\"," unit ]
    | None ->
        Pp.nop
  in
  let evaluate_fun =
    Pp.concat
      [ Pp.verbatim "evaluate: (params = {}, options) =>"
      ; Pp.break ~nspaces:1 ~shift:2
      ; Pp.verbatimf "$evaluate(_%s, params, options).value," rule_name_js ]
  in
  let evaluate_params_fun =
    Pp.concat
      [ Pp.verbatim "evaluateParams: (params = {}, options) =>"
      ; Pp.break ~nspaces:1 ~shift:2
      ; Pp.verbatimf "$evaluate(_%s, params, options)," rule_name_js ]
  in
  Pp.concat
    [ rule_property_jsdoc
    ; to_js_str_pp rule_name_str
    ; Pp.verbatim ": {"
    ; Pp.break ~nspaces:1 ~shift:2
    ; Pp.hovbox
        (Pp.concat
           [ params_typedef
           ; Pp.newline
           ; evaluate_jsdoc
           ; Pp.newline
           ; evaluate_fun
           ; Pp.newline
           ; evaluate_params_jsdoc
           ; Pp.newline
           ; evaluate_params_fun
           ; Pp.newline
           ; Pp.verbatimf "/** @type {\"%s\"} */" publicodes_rule_type
           ; Pp.newline
           ; Pp.verbatimf "type: \"%s\"," publicodes_rule_type
           ; Pp.newline
           ; unit_property
           ; ( if get_rule_str_unit hashed_tree rule_name |> Option.is_some then
                 Pp.newline
               else Pp.nop )
           ; Pp.verbatimf "/**"
           ; Pp.newline
           ; Pp.verbatimf " * Parameter list for \"%s\" " rule_name_str
           ; Pp.newline
           ; Pp.verbatimf " * @type {Array<keyof %s>}" type_name
           ; Pp.newline
           ; Pp.verbatim " */"
           ; Pp.newline
           ; Pp.verbatim "params: "
           ; params_list_doc
           ; Pp.verbatim ","
           ; ( if has_meta_properties meta then
                 Pp.concat [Pp.newline; meta_properties]
               else Pp.nop ) ] )
    ; Pp.newline
    ; Pp.verbatim "}" ]

let outputs_to_js_rules_pp hashed_tree outputs =
  Pp.concat_map outputs
    ~sep:(Pp.concat [Pp.verbatim ","; Pp.newline])
    ~f:(generate_rule_object_pp hashed_tree)

let generate_header_pp runtime =
  Pp.concat ~sep:Pp.newline
    [ Pp.verbatim "/** Start embedded runtime */"
    ; Pp.verbatim runtime
    ; Pp.verbatim "/** End embedded runtime */" ]

let generate_private_rules_pp rules_doc =
  Pp.box ~indent:0
    (Pp.concat
       [ Pp.verbatim "/** Compiled private Publicodes rules */"
       ; Pp.newline
       ; Pp.newline
       ; rules_doc ] )

let generate_exports_pp outputs_doc =
  Pp.box
    (Pp.concat
       [ Pp.verbatim "/** Exported outputs/inputs */"
       ; Pp.newline
       ; Pp.newline
       ; Pp.verbatim "const rules = {"
       ; Pp.break ~nspaces:1 ~shift:2
       ; Pp.hovbox outputs_doc
       ; Pp.space
       ; Pp.verbatim "}"
       ; Pp.newline
       ; Pp.newline
       ; Pp.verbatim "export default rules;" ] )

let to_js tree outputs : string =
  let doc =
    Pp.box ~indent:0
      (Pp.concat
         [ generate_header_pp Js_runtime.runtime
         ; Pp.newline
         ; Pp.newline
         ; generate_private_rules_pp (rules_to_js_functions_pp tree)
         ; Pp.newline
         ; Pp.newline
         ; generate_exports_pp (outputs_to_js_rules_pp tree outputs) ] )
  in
  Stdlib.Format.asprintf "%a@?" Pp.to_fmt doc
