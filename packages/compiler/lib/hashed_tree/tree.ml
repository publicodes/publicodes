open Shared

type hash_and_type = {typ: Typ.t option; hash: To_hash.t}

type t = hash_and_type Eval_tree.t

type value = hash_and_type Eval_tree.value
