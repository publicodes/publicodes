open Shared
open Base

module Hash = struct
  type t = string [@@deriving equal, compare, show, sexp]

  let hash = String.hash

  let of_string s = Stdlib.Digest.string s |> Stdlib.Digest.to_hex

  let of_float f = of_string (Float.to_string f)

  let of_bool b = of_string (Bool.to_string b)

  let of_constant const =
    match const with
    | Eval_tree.Number (n, _) ->
        (* We remove unit *)
        of_float n
    | _ ->
        let const_str =
          Stdlib.Format.asprintf "%a" Eval_tree.pp_constant const
        in
        of_string const_str

  let of_binary_op op =
    let str = Stdlib.Format.asprintf "%a" Shared_ast.pp_binary_op op in
    of_string str

  let of_unary_op op =
    let str = Stdlib.Format.asprintf "%a" Eval_tree.pp_unary_op op in
    of_string str

  let of_rounding rounding =
    let str = Stdlib.Format.asprintf "%a" Shared_ast.pp_rounding rounding in
    of_string str

  let of_rule_name rule_name =
    let str = Rule_name.to_string rule_name in
    of_string str

  let combine hashes = of_string (String.concat hashes)
end

type hash_and_type = {typ: Typ.t option; hash: Hash.t}

type t = hash_and_type Eval_tree.t

type value = hash_and_type Eval_tree.value
