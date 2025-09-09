open Core
open Shared

type t = string [@@deriving sexp, show, compare]

let hash_string s = s |> Md5.digest_string |> Md5.to_hex

let hash_float f = Float.to_string f |> hash_string

let hash_bool b = Bool.to_string b |> hash_string

let combine hashes = String.concat hashes |> hash_string

let of_constant const =
  match const with
  | Eval_tree.Number (n, _) ->
      (* We remove unit *)
      hash_float n
  | _ ->
      Format.asprintf "%a" Eval_tree.pp_constant const |> hash_string

let of_binary_op op =
  Format.asprintf "%a" Shared_ast.pp_binary_op op |> hash_string

let of_unary_op op =
  Format.asprintf "%a" Eval_tree.pp_unary_op op |> hash_string

let of_rounding rounding =
  Format.asprintf "%a" Shared_ast.pp_rounding rounding |> hash_string

let of_rule_name rule_name = Rule_name.to_string rule_name |> hash_string
