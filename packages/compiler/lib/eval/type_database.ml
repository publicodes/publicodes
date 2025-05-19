open Core

type value = Concrete of Concrete_type.t | Link of Node_id.t | Null
[@@deriving sexp, show]

type t = value array

let mk () = Array.create ~len:!Node_id.current Null

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

let rec resolve_symlink_and_compress ~(database : t)
    ?(start_id : Node_id.t option = None) (type_id : Node_id.t) : Node_id.t =
  let actual_start_id = match start_id with Some id -> id | None -> type_id in
  match database.(type_id) with
  | Link linked_id ->
      (* Check for cycles by comparing with the start_id *)
      if Int.equal linked_id actual_start_id then (
        (* Cycle detected, return current id without following the link *)
        database.(type_id) <- Null ;
        type_id )
      else
        let resolved_id =
          resolve_symlink_and_compress ~database
            ~start_id:(Some actual_start_id) linked_id
        in
        database.(type_id) <- Link resolved_id ;
        resolved_id
  | _ ->
      type_id

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
