open Core
open Shared
open Eval.Concrete_type

(*
Todo : we might want to generate a JSON file AND ts file that imports it
This would allow to implement interpreter in different langages
*)

let generate ~parameters ~eval_tree =
  let parameters_json =
    `Assoc
      (List.map parameters ~f:(fun (key, value) ->
           ( Rule_name.to_string key
           , `List
               (List.map value ~f:(fun rule ->
                    `String (Rule_name.to_string rule) ) ) ) ) )
  in
  let output_json =
    `List
      (List.map
         ~f:(fun (rule, _) -> `String (Rule_name.to_string rule))
         parameters )
  in
  let types_json =
    `Assoc
      (List.map parameters ~f:(fun (key, _) ->
           ( Rule_name.to_string key
           , match (Eval.Tree.rule_meta eval_tree key).typ with
             | Some Number ->
                 `String "number"
             | Some String ->
                 `String "string"
             | Some Bool ->
                 `String "boolean"
             | Some Date ->
                 `String "date"
             | None ->
                 `Null ) ) )
  in
  let publicodes =
    `Assoc
      [ ("evaluationTree", From_eval_tree.to_json eval_tree)
      ; ("outputs", output_json)
      ; ("parameters", parameters_json)
      ; ("types", types_json) ]
  in
  (* NOTE: This generic code could be moved in the typescript interpreter
		 code instead? *)
  Format.sprintf
    {|
import { Publicodes } from '../../src/types'

const publicodes = %s as const

export type Output = (typeof publicodes.outputs)[number]
export type Parameter = typeof publicodes.parameters
export type Types = typeof publicodes.types

export default publicodes as unknown as Publicodes<Output, Types, Parameter>
    |}
    (Yojson.Safe.to_string publicodes)
