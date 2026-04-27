val ( let* ) : ('a, 'b) result -> ('a -> ('c, 'b) result) -> ('c, 'b) result

val ( >>| ) : ('a, 'b) result -> ('a -> 'c) -> ('c, 'b) result

val ( >>= ) : ('a, 'b) result -> ('a -> ('c, 'b) result) -> ('c, 'b) result
