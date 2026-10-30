(** [to_json_str ~replacement_graph ~make_not_applicable_graph typed_ast] returns
    a JSON string representation of [typed_ast], including the replacement
    declarations and the replacement trees resolved at each reference site. *)
let to_json_str = To_json.to_str
