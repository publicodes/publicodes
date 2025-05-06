open Core

type id = int [@@deriving sexp, show]

let current_id = ref 0

let next_id () =
  let id = !current_id in
  current_id := id + 1 ;
  id

type base_type = Number | String | Boolean | Date

type value = Type of base_type | Link of id | Null

type t = value array

let make () = Array.create ~len:!current_id Null

let assign ~(id : id) ~(t : value) database =
  match t with
  | Null ->
      failwith "Cannot assign a null type"
  | t ->
      Array.set database id t
