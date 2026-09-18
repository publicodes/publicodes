open Base

(** Monad for collecting logs (i.e., warnings, errors, etc.) while performing
    computations that may fail.

    The recommended way to use it, is to open the {!Output.Let_syntax} module,
    and use the {!let*} and {!let+} operators to chain computations. The {!return}
    function can be used to wrap a value into the monad, and the {!break} function
    can be used to interrupt the computation and return an error.

    The {!let*} operator allows to easily chain computations that may fail
    (i.e., return logs instead of the computed value):

    {2 Example}

    If [compute_x] fails, the computation is interrupted and the logs are
    returned. Otherwise, [x] contains the result of [compute_x], and we can
    continue the computation.

    {[
      let* x = compute_x () in
      let* y = compute_y x in
      return (x + y)
    ]} *)

type 'a t = 'a option * Log.t list

val equal : ('a -> 'a -> bool) -> 'a t -> 'a t -> bool

val empty : 'a t

val return : ?logs:Log.t list -> 'a -> 'a t

val break : ?logs:Log.t list -> 'a -> 'a t

val result : 'a * 'b -> 'a

val logs : 'a * 'b -> 'b

(** {2 Monad operations} *)

val bind : 'a t -> f:('a -> 'b t) -> 'b t

val map : f:('a -> 'b) -> 'a t -> 'b t

(** {2 Helpers} *)

val combine : 'a t -> 'b t -> ('a * 'b) t

val combine_3 : 'a t -> 'b t -> 'c t -> ('a * 'b * 'c) t

val combine_4 : 'a t -> 'b t -> 'c t -> 'd t -> ('a * 'b * 'c * 'd) t

val fatal_error :
     pos:Pos.t
  -> kind:Log.kind
  -> code:Err.Code.t
  -> ?hints:string list
  -> ?labels:string Mark.pos list
  -> string
  -> 'a t

val ignore_logs : 'a * Log.t list -> 'a * 'c list
(** [ignore_logs (x, logs)] returns [(x, [])], effectively discarding the logs. *)

val add_logs : logs:Log.t list -> 'a t -> 'a t

val default_to : default:'a -> 'a t -> 'a t

val value : default:'a -> 'a t -> 'a

module Infix : sig
  val ( >>= ) : 'a t -> ('a -> 'b t) -> 'b t

  val ( >>| ) : 'a t -> ('a -> 'b) -> 'b t
end

module Let_syntax : sig
  val ( let+ ) : 'a t -> ('a -> 'b) -> 'b t

  val ( let* ) : 'a t -> ('a -> 'b t) -> 'b t
end

(** {2 Logging} *)

val print_logs : 'a t -> unit

val sprintf_logs : 'a t -> string

val all_keep_logs : ?default:'a -> 'a t list -> 'a list t

val all_okay : 'a t list -> 'a list t

val fold : 'a list -> init:'b -> f:('b -> 'a -> 'b t) -> 'b t

val fold_right : 'a list -> f:('a -> 'b -> 'b t) -> init:'b -> 'b t

val to_exn : 'a t -> 'a

val of_opt : log:Log.t -> 'a option -> 'a t
