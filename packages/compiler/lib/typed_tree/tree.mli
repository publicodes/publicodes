type t = Typ.t Shared.Eval_tree.t

type value = Typ.t Shared.Eval_tree.value

val mk :
     pos:Utils.Pos.pos
  -> ?typ:Typ.t
  -> Typ.t Shared.Eval_tree.naked_value
  -> Typ.t Shared.Eval_tree.value
