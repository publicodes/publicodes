module Code = struct
  type t =
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
  [@@deriving show, sexp, compare]

  let to_string = function
    | Yaml_parsing ->
        "E001"
    | Yaml_unexpected_token ->
        "E002"
    | Yaml_alias_not_supported ->
        "E003"
    | Yaml_empty_file ->
        "E004"
    | Yaml_duplicate_key ->
        "E005"
    | Parsing_unexpected_token ->
        "E006"
    | Parsing_missing_closing_paren ->
        "E007"
    | Parsing_invalid_char ->
        "E008"
    | Parsing_should_not_be_array ->
        "E009"
    | Parsing_should_be_array ->
        "E010"
    | Parsing_should_be_object ->
        "E011"
    | Parsing_should_be_scalar ->
        "E012"
    | Parsing_empty_value ->
        "E013"
    | Parsing_invalid_value ->
        "E014"
    | Parsing_invalid_rule_name ->
        "E015"
    | Parsing_invalid_mechanism ->
        "E016"
    | Expr_lex_invalid_expression ->
        "E017"
    | Resolver_missing_parent_rule ->
        "E018"
    | Resolver_missing_rule ->
        "E019"
    | Array_mechanism_with_empty_value ->
        "E020"
    | Type_invalid_type ->
        "E021"
    | Type_incoherence ->
        "E022"
    | Type_missing_output_type ->
        "E023"
    | Type_incompatible_units ->
        "E024"
    | Type_missing_in_mechanism ->
        "E025"
    | Cycle_detected ->
        "E026"
end

type t = Code.t * string

let yaml_unexpected_token ~actual ~expected =
  let message =
    Format.sprintf "mot clé inattendu : %s (attendu : %s)" actual expected
  in
  (Code.Yaml_unexpected_token, message)

let yaml_alias_not_supported =
  (Code.Yaml_alias_not_supported, "alias YAML non pris en charge")

let yaml_empty_file = (Code.Yaml_empty_file, "fichier est vide")

let unexpected_token token =
  let message = Format.sprintf "mot clé inattendu : %s" token in
  (Code.Yaml_unexpected_token, message)

let missing_closing_paren =
  (Code.Parsing_missing_closing_paren, "parenthèse fermante manquante")

let invalid_char = (Code.Parsing_invalid_char, "caractère invalide")

let expr_lex_invalid_expression =
  (Code.Expr_lex_invalid_expression, "expression invalide")

let parsing_should_be_array = (Code.Parsing_should_be_array, "tableau attendu")

let parsing_should_not_be_array =
  (Code.Parsing_should_be_array, "tableau impossible")

let parsing_should_be_object = (Code.Parsing_should_be_object, "objet attendu")

let parsing_should_be_scalar =
  (Code.Parsing_should_be_scalar, "objet ou tableau impossible")

let yaml_duplicate_key = (Code.Yaml_duplicate_key, "clé dupliquée dans le YAML")

let parsing_empty_value = (Code.Parsing_empty_value, "valeur manquante")

let invalid_value = (Code.Parsing_invalid_value, "mauvaise valeure")

let invalid_rule_name = (Code.Parsing_invalid_rule_name, "nom de règle invalide")

let type_invalid_type = (Code.Type_invalid_type, "type invalide détécté")

let type_incoherence = (Code.Type_incoherence, "types non cohérents entre eux")

let type_unit_incoherence =
  (Code.Type_incompatible_units, "unités non compatibles")

let missing_output_type =
  (Code.Type_missing_output_type, "information de type manquante pour ce résultat")

let type_missing_in_mechanism =
  (Code.Type_missing_in_mechanism, "information de type manquante pour ce paramètre de mécanisme")


let cycle_detected = (Code.Cycle_detected, "cycle de dépendance détecté")

let missing_parent_rule =
  (Code.Resolver_missing_parent_rule, "règle parente manquante")

let missing_rule = (Code.Resolver_missing_rule, "cette règle n'existe pas")

let malformed_expression =
  (Code.Parsing_missing_closing_paren, "expression malformée")

let parsing_invalid_mechanism =
  (Code.Parsing_invalid_mechanism, "mécanisme invalide")
