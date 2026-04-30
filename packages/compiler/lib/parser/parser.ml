module Ast = struct
  include Ast
end

let to_ast = Parse.parse

let parse_files = Parse.parse_files
