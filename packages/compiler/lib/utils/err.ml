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
    | Parsing_should_be_array
    | Parsing_should_be_object
    | Parsing_empty_value
    | Parsing_invalid_value
    | Parsing_invalid_rule_name
    (* Expression errors *)
    | Expr_lex_invalid_expression
    (* Name resolution errors *)
    | Resolver_missing_parent_rule
    | Resolver_missing_rule
    (* Array mechanism errors *)
    | Array_mechanism_with_empty_value
    (* Type errors *)
    | Type_invalid_type
    | Type_missing_output_type
    (* Cycle detection errors *)
    | Cycle_detected
  [@@deriving show, sexp, compare]

  let code_to_string = function
    | Yaml_parsing ->
        "E001"
    | Yaml_unexpected_token ->
        "E002"
    | Yaml_alias_not_supported ->
        "E003"
    | Yaml_empty_file ->
        "E004"
    | Parsing_unexpected_token ->
        "E005"
    | Parsing_missing_closing_paren ->
        "E006"
    | Parsing_invalid_char ->
        "E007"
    | Expr_lex_invalid_expression ->
        "E008"
    | Array_mechanism_with_empty_value ->
        "E009"
    | Parsing_should_be_array ->
        "E010"
    | Parsing_should_be_object ->
        "E020"
    | Yaml_duplicate_key ->
        "E011"
    | Parsing_empty_value ->
        "E012"
    | Parsing_invalid_value ->
        "E013"
    | Parsing_invalid_rule_name ->
        "E014"
    | Type_invalid_type ->
        "E015"
    | Type_missing_output_type ->
        "E016"
    | Cycle_detected ->
        "E017"
    | Resolver_missing_parent_rule ->
        "E018"
    | Resolver_missing_rule ->
        "E019"
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
  (Code.Expr_lex_invalid_expression, "expression est invalide")

let parsing_should_be_array = (Code.Parsing_should_be_array, "tableau manquant")

let parsing_should_be_object = (Code.Parsing_should_be_object, "objet attendu")

let yaml_duplicate_key = (Code.Yaml_duplicate_key, "clé dupliquée dans le YAML")

let parsing_empty_value = (Code.Parsing_empty_value, "valeur manquante")

let invalid_value = (Code.Parsing_invalid_value, "mauvaise valeure")

let invalid_rule_name = (Code.Parsing_invalid_rule_name, "nom de règle invalide")

let invalid_type = (Code.Type_invalid_type, "divergence de type")

let missing_output_type =
  (Code.Type_missing_output_type, "type de sortie manquant")

let cycle_detected = (Code.Cycle_detected, "cycle de dépendance détecté")

let missing_parent_rule =
  (Code.Resolver_missing_parent_rule, "règle parente manquante")

let missing_rule = (Code.Resolver_missing_rule, "règle référencée inexistante")

let malformed_expression =
  (Code.Parsing_missing_closing_paren, "expression malformée")
