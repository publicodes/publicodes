type target_type = Js | Debug_eval_tree | Json_doc

val compile :
     input_files:string list
  -> output_type:target_type
  -> default_to_public:bool
  -> string Utils.Output.t
