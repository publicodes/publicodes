open Base

type pos_mark = {pos: Pos.t} [@@deriving equal, compare, show, sexp]

type ('a, 'm) ed = 'a * 'm [@@deriving equal, compare, show, sexp]

type 'a pos = ('a, pos_mark) ed [@@deriving equal, compare, show, sexp]

let add m e = (e, m)

let remove (x, _) = x

let get (_, m) = m

let pos ((_, {pos}) : 'a pos) = pos

let map ~f (x, m) = (f x, m)

let copy (_, m) x = (x, m)

let set m (x, _) = (x, m)

let mk_pos ~pos node = (node, {pos})
