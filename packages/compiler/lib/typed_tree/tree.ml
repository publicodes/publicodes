type t = Typ.t Shared.Eval_tree.t

type value = Typ.t Shared.Eval_tree.value

let mk ~pos ~(id : int) ?(typ = Typ.any ~pos ()) value =
  {Shared.Eval_tree.value; pos; id; meta= typ}

let mknew ~pos ~(id : int ref) ?(typ = Typ.any ~pos ()) value =
  id := !id + 1 ;
  mk ~pos ~id:!id ~typ value
