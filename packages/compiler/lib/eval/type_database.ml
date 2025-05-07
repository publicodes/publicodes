open Core

type id = int [@@deriving sexp, show]

let current_id = ref 0

let next_id () =
  let id = !current_id in
  current_id := id + 1 ;
  id

type concrete_type = Number | String | Bool | Date
[@@deriving sexp, show, compare]

type value = Concrete of concrete_type | Link of id | Null
[@@deriving sexp, show]

type t = value array

let mk () = Array.create ~len:!current_id Null

let type_to_string = function
  | Concrete Number ->
      "Number"
  | Concrete String ->
      "String"
  | Concrete Bool ->
      "Bool"
  | Concrete Date ->
      "Date"
  | Link id ->
      Printf.sprintf "db[%s]" (string_of_int id)
  | Null ->
      "null"

let pp fmt db =
  let open Format in
  (* Print header *)
  fprintf fmt "@[<v 0>" ;
  fprintf fmt "@\n" ;
  fprintf fmt "┌───────────┬─────────────┐@\n" ;
  fprintf fmt "│ id        │ type        │@\n" ;
  fprintf fmt "├───────────┼─────────────┤@\n" ;
  (* Print each entry *)
  Array.iteri db ~f:(fun i v ->
      let id_display = Printf.sprintf " %d " i in
      fprintf fmt "│ %-9s │ %-11s │@\n" id_display (type_to_string v) ) ;
  (* Print footer *)
  fprintf fmt "└───────────┴─────────────┘@\n" ;
  fprintf fmt "@]"
