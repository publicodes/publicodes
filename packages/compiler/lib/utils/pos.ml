open Base

module Point = struct
  type t = {index: int; line: int; column: int}
  [@@deriving equal, compare, sexp]

  let pp ppf {index; line; column} =
    Stdlib.Format.fprintf ppf "line %d, column %d, (i %d)" line column index

  let of_position Lexing.{pos_cnum; pos_bol; pos_lnum; _} =
    {index= pos_cnum; line= pos_lnum + 1; column= pos_cnum - pos_bol + 1}

  let to_position {index; line; column} ~file =
    Lexing.
      { pos_fname= file
      ; pos_lnum= line - 1
      ; pos_bol= index - (column - 1)
      ; pos_cnum= index }

  let dummy = {index= 0; line= 1; column= 1}
end

type pos = {file: string; start_pos: Point.t; end_pos: Point.t}
[@@deriving equal, compare, show, sexp]

type 'a t = 'a * pos [@@deriving equal, compare, show, sexp]

(* Map operation *)
let map ~f (x, pos) = (f x, pos)

let ( >>| ) m f = map ~f m

(* Applicative syntax *)
let ( let+ ) m f = map ~f m

(* Utility functions *)
let value (x, _) = x

let pos (_, pos) = pos

let mk ~pos x = (x, pos)

let beginning_of_file file = {file; start_pos= Point.dummy; end_pos= Point.dummy}

let dummy = {file= ""; start_pos= Point.dummy; end_pos= Point.dummy}

let is_empty_file pos = String.is_empty pos.file

let merge pos1 pos2 =
  if String.compare pos1.file pos2.file <> 0 then
    raise @@ Invalid_argument "Cannot merge positions from different files"
  else {file= pos1.file; start_pos= pos1.start_pos; end_pos= pos2.end_pos}

let add ?(len = 0) ?(line = 0) pos =
  { pos with
    end_pos=
      { index= pos.end_pos.index + len
      ; line= pos.end_pos.line + line
      ; column= pos.end_pos.column + len } }

let to_loc (pos : pos) : Stdune.Loc.t =
  Stdune.Loc.create
    ~start:(Point.to_position pos.start_pos ~file:pos.file)
    ~stop:(Point.to_position pos.end_pos ~file:pos.file)
