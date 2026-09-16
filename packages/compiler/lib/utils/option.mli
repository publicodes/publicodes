val ( let* ) : 'a option -> ('a -> 'b option) -> 'b option

val ( let+ ) : 'a option -> ('a -> 'b) -> 'b option

val ( >>= ) : 'a option -> ('a -> 'b option) -> 'b option

val ( >>| ) : 'a option -> ('a -> 'b) -> 'b option
