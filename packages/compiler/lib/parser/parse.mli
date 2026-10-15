open Base
open Utils

val from_files :
  default_to_public:bool -> module_path:File.t -> File.t list -> Ast.t Output.t
