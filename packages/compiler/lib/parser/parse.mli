val parse_root :
     default_to_public:bool
  -> module_:Base.string
  -> Base.String.t Base.List.t
  -> Base.string Base.list Shared.Shared_ast.rule_def Base__List.t Base.option
     * Utils.Log.t Base__List.t

val parse :
     filename:Base.string
  -> ?default_to_public:bool
  -> Yaml_parser.yaml
  -> Ast.t Yaml_parser.Output.t
