type t = Typ.t Shared.Eval_tree.t

type value = Typ.t Shared.Eval_tree.value

let mk ~pos ?(typ = Typ.any ~pos ()) value =
  {Shared.Eval_tree.value; pos; meta= typ}

let print (tree : t) =
  let typ_to_str typ = [("typ", Typ.to_string typ)] in
  Shared.Eval_tree_printer.print_eval_tree ~meta_to_string:typ_to_str tree
