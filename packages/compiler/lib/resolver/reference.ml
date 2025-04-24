open Core

let parents rule =
  List.fold
    ~f:(fun (acc, parents) rule ->
      let current = acc @ [ rule ] in
      (current, current :: parents))
    ~init:([], []) rule
  |> snd

let resolve ~rules ~current (name : string list) =
  let parent_paths = parents current @ [ [] ] in
  List.find_map parent_paths ~f:(fun parent ->
      let rule = parent @ name in
      (* We dont want to match the current rule if there is a matching parent rule *)
      if List.equal String.equal rule current then None
      else if Set.mem rules rule then Some rule
      else None)
  |> ( function
  | Some x -> Some x
  (* If no matching, we check if the current rule is a match *)
  | None ->
      if List.equal String.equal (List.slice current (-List.length name) 0) name
      then Some current
      else None )
  |> Option.value_exn ~message:"No matching rule found"
