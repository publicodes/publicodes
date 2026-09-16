open Base
open Utils

val parse_root :
  default_to_public:bool -> module_path:string -> string list -> Ast.t Output.t

val parse :
     filename:string
  -> ?default_to_public:bool
  -> Yaml_parser.yaml
  -> Ast.t Yaml_parser.Output.t
