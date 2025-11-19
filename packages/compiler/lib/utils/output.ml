open Base

type 'a t = 'a option * Log.t list [@@deriving equal]

let empty : 'a t = (None, [])

let return ?(logs = []) x : 'a t = (Some x, logs)

let result (x, _) = x

let logs (_, logs) = logs

(* Bind operation *)
let bind (x_opt, logs1) ~f =
  match x_opt with
  | Some x ->
      let y_opt, logs2 = f x in
      (y_opt, logs1 @ logs2)
  | None ->
      (* Propagate None, keep existing logs *)
      (None, logs1)

(* Map operation *)
let map ~f (x_opt, logs) =
  match x_opt with
  | Some x ->
      (Some (f x), logs)
  | None ->
      (* Propagate None, keep existing logs *)
      (None, logs)

(* Helper *)
let combine a b =
  let a, log_a = a in
  let b, log_b = b in
  let logs = log_a @ log_b in
  match (a, b) with Some a, Some b -> (Some (a, b), logs) | _ -> (None, logs)

let combine_3 a b c =
  let a, log_a = a in
  let b, log_b = b in
  let c, log_c = c in
  let logs = log_a @ log_b @ log_c in
  match (a, b, c) with
  | Some a, Some b, Some c ->
      (Some (a, b, c), logs)
  | _ ->
      (None, logs)

let combine_4 a b c d =
  let a, log_a = a in
  let b, log_b = b in
  let c, log_c = c in
  let d, log_d = d in
  let logs = log_a @ log_b @ log_c @ log_d in
  match (a, b, c, d) with
  | Some a, Some b, Some c, Some d ->
      (Some (a, b, c, d), logs)
  | _ ->
      (None, logs)

(* Interrupt compilation *)
let fatal_error ~pos ~kind ~code ?(hints = []) ?(labels = []) message =
  let log = Log.error ~pos ~kind ~hints ~code ~labels message in
  (None, [log])

let ignore_logs (x_opt, _) = (x_opt, [])

let add_logs ~(logs : Log.t list) ((x_opt, logs1) : 'a t) : 'a t =
  match x_opt with
  | Some x ->
      (Some x, logs @ logs1)
  | None ->
      (* Propagate None, keep existing logs *)
      (None, logs @ logs1)

let default_to ~default = function None, logs -> (Some default, logs) | x -> x

let value ~default = function None, _ -> default | Some x, _ -> x

(* Monadic operators *)
let ( >>= ) m f = bind m ~f

let ( >>| ) m f = map ~f m

(* Applicative syntax *)
let ( let+ ) m f = map ~f m

let ( let* ) m f = bind m ~f

(* Print functions *)

let print_logs (output : 'a t) =
  List.iter ~f:(fun log -> Log_formatter.print log) (logs output)

let sprintf_logs (output : 'a t) =
  output |> logs
  |> List.map ~f:(fun log ->
         Stdlib.Format.asprintf "%s\n" (Pos.value log).Log.message )
  |> String.concat ~sep:"\n"

let all_keep_logs ?default (ts : 'a t list) : 'a list t =
  match default with
  | Some default_value ->
      List.fold ts ~init:(return []) ~f:(fun acc (x, log) ->
          let* xs = acc in
          let x = Option.value ~default:default_value x in
          return ~logs:(logs acc @ log) (x :: xs) )
      >>| List.rev
  | None ->
      List.fold ts ~init:(return []) ~f:(fun acc (x, log) ->
          let xs = Option.value_exn (result acc) in
          let xs = match x with Some x -> x :: xs | None -> xs in
          return ~logs:(logs acc @ log) xs )
      >>| List.rev

let to_exn (output : 'a t) =
  match output with Some x, _ -> x | None, _ -> failwith (sprintf_logs output)
