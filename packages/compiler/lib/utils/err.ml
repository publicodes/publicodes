module Code = struct
  (* Tips: add new ones to the bottom *)
  type t =
    | None (* Placeholder for id 0. Leave it as first *)
    (* Yaml parsing errors *)
    | Yaml_parsing
    | Yaml_unexpected_token
    | Yaml_alias_not_supported
    | Yaml_empty_file
    | Yaml_duplicate_key
    (* Parsing errors *)
    | Parsing_unexpected_token
    | Parsing_missing_closing_paren
    | Parsing_invalid_char
    | Parsing_should_not_be_array
    | Parsing_should_not_be_object
    | Parsing_should_be_array
    | Parsing_should_be_object
    | Parsing_should_be_scalar
    | Parsing_empty_value
    | Parsing_invalid_value
    | Parsing_invalid_rule_name
    | Parsing_invalid_mechanism
    (* Expression errors *)
    | Expr_lex_invalid_expression
    (* Name resolution errors *)
    | Resolver_missing_parent_rule
    | Resolver_missing_rule
    (* Array mechanism errors *)
    | Array_mechanism_with_empty_value
    (* Type errors *)
    | Type_invalid_type
    | Type_incoherence
    | Type_missing_output_type
    | Type_incompatible_units
    | Type_missing_in_mechanism
    (* Cycle detection errors *)
    | Cycle_detected
    (* Replacement errors *)
    | Replace_multiple
    | Replace_cycle
    | Parsing_invalid_meta
    | Private_rule
    | Illegal_reference
    | No_file_or_directory
    | Parsing_missing_value
    | Invalid_path
    | Invalid_config
    | Resolver_duplicate_rule
  [@@deriving equal, enum, show]

  let show = fun code -> Stdlib.Format.sprintf "E%03d" (to_enum code)

  let pp fmt err = Stdlib.Format.fprintf fmt "%s" (show err)
end

type t = Code.t * string

let yaml_unexpected_token ~actual ~expected =
  let message =
    Stdlib.Format.sprintf "mot clé inattendu : %s (attendu : %s)" actual
      expected
  in
  (Code.Yaml_unexpected_token, message)

let yaml_alias_not_supported =
  (Code.Yaml_alias_not_supported, "alias YAML non pris en charge")

let yaml_empty_file = (Code.Yaml_empty_file, "fichier est vide")

let unexpected_token token =
  let message = Stdlib.Format.sprintf "mot clé inattendu : %s" token in
  (Code.Yaml_unexpected_token, message)

let missing_closing_paren =
  (Code.Parsing_missing_closing_paren, "parenthèse fermante manquante")

let invalid_char = (Code.Parsing_invalid_char, "caractère invalide")

let expr_lex_invalid_expression =
  (Code.Expr_lex_invalid_expression, "expression invalide")

let parsing_should_be_array = (Code.Parsing_should_be_array, "tableau attendu")

let parsing_should_not_be_array =
  (Code.Parsing_should_be_array, "tableau impossible")

let parsing_should_not_be_object =
  (Code.Parsing_should_not_be_object, "objet impossible")

let parsing_should_be_object = (Code.Parsing_should_be_object, "objet attendu")

let parsing_should_be_scalar =
  (Code.Parsing_should_be_scalar, "objet ou tableau impossible")

let yaml_duplicate_key = (Code.Yaml_duplicate_key, "clé dupliquée dans le YAML")

let parsing_empty_value = (Code.Parsing_empty_value, "valeur manquante")

let invalid_value = (Code.Parsing_invalid_value, "mauvaise valeure")

let invalid_meta = (Code.Parsing_invalid_meta, "meta invalide")

let invalid_rule_name = (Code.Parsing_invalid_rule_name, "nom de règle invalide")

let type_invalid_type = (Code.Type_invalid_type, "type invalide détécté")

let type_incoherence = (Code.Type_incoherence, "types non cohérents entre eux")

let type_unit_incoherence =
  (Code.Type_incompatible_units, "unités non compatibles")

let missing_output_type =
  ( Code.Type_missing_output_type
  , "information de type manquante pour ce résultat" )

let type_missing_in_mechanism =
  ( Code.Type_missing_in_mechanism
  , "information de type manquante pour ce paramètre de mécanisme" )

let cycle_detected = (Code.Cycle_detected, "cycle de dépendance détecté")

let illegal_reference =
  (Code.Illegal_reference, "cette règle n'est pas accessible")

let private_rule = (Code.Private_rule, "cette règle est privée")

let missing_parent_rule =
  (Code.Resolver_missing_parent_rule, "règle parente manquante")

let missing_rule = (Code.Resolver_missing_rule, "cette règle n'existe pas")

let duplicate_rule =
  (Code.Resolver_duplicate_rule, "cette règle existe en double")

let malformed_expression =
  (Code.Parsing_missing_closing_paren, "expression malformée")

let parsing_invalid_mechanism =
  (Code.Parsing_invalid_mechanism, "mécanisme invalide")

let parsing_missing_value value =
  (Code.Parsing_missing_value, Stdlib.Format.sprintf "champ manquant : %s" value)

let replace_multiple = (Code.Replace_multiple, "remplacement multiples")

let replace_cycle = (Code.Replace_cycle, "cycle de remplacement détecté")

let no_file_or_directory =
  (Code.No_file_or_directory, "la resource est introuvable")

let invalid_path = (Code.Invalid_path, "chemin invalide")

let invalid_config = (Code.Invalid_config, "configuration invalide")

let import_cycle chain =
  let message =
    String.concat " <- " chain
    |> Stdlib.Format.sprintf "cycle d'import détecté : %s"
  in
  (Code.Cycle_detected, message)
