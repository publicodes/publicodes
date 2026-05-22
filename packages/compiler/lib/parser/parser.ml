module Ast = struct
  include Ast
end

let to_ast = Parse.parse
