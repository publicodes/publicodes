type t = Typ.t Shared.Eval_tree.t

type value = Typ.t Shared.Eval_tree.value

let mk ~pos ?(typ = Typ.any ~pos ()) value =
  {Shared.Eval_tree.value; pos; meta= typ}
