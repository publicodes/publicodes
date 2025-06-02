include Eval_tree

type t = Typ.t Eval_tree.t

type value = Typ.t Eval_tree.value

let mk ~pos ?(typ = Typ.any ~pos ()) value = {Eval_tree.value; pos; meta= typ}
