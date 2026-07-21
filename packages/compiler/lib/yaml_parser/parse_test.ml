open Ast
open Base
open Parse
open Utils
open Utils.Output

let%test_unit "parse scalar" =
  let str = "scalar" in
  let output = parse "test" str in
  match result output with
  | Some yaml ->
      [%test_eq: yaml] yaml
        (`Scalar
           (Mark.mk_pos
              ~pos:
                { start_pos= Pos.Point.dummy
                ; end_pos=
                    { line= 1
                    ; column= 1 + String.length str
                    ; index= String.length str }
                ; file= "test" }
              {value= "scalar"; style= `Plain} ) )
  | None ->
      print_logs output ;
      assert false

let%test_unit "parse obj" =
  let str = {|
  ma règle:
  b:
    2
  |} in
  let output = parse "test" str in
  match result output with
  | Some yaml ->
      [%test_eq: yaml] yaml
        (`O
           [ (* Key *)
             ( Mark.mk_pos
                 ~pos:
                   { start_pos= {line= 2; column= 3; index= 3}
                   ; end_pos= {line= 2; column= 11; index= 11}
                   ; file= "test" }
                 {value= "ma règle"; style= `Plain}
             , (* Value *)
               `Scalar
                 (Mark.mk_pos
                    ~pos:
                      { start_pos= {line= 2; column= 12; index= 12}
                      ; end_pos= {line= 2; column= 12; index= 12}
                      ; file= "test" }
                    {value= ""; style= `Plain} ) )
           ; (* Key *)
             ( Mark.mk_pos
                 ~pos:
                   { start_pos= {line= 3; column= 3; index= 15}
                   ; end_pos= {line= 3; column= 4; index= 16}
                   ; file= "test" }
                 {value= "b"; style= `Plain}
             , (* Value *)
               `Scalar
                 (Mark.mk_pos
                    ~pos:
                      { start_pos= {line= 4; column= 5; index= 22}
                      ; end_pos= {line= 4; column= 6; index= 23}
                      ; file= "test" }
                    {value= "2"; style= `Plain} ) ) ] )
  | None ->
      print_logs output ;
      assert false

let%test_unit "parse array" =
  let str = "[a, 'a . b',1.4]" in
  let output = parse "test" str in
  match result output with
  | Some yaml ->
      [%test_eq: yaml] yaml
        (`A
           [ `Scalar
               (Mark.mk_pos
                  ~pos:
                    { start_pos= {line= 1; column= 2; index= 1}
                    ; end_pos= {line= 1; column= 3; index= 2}
                    ; file= "test" }
                  {value= "a"; style= `Plain} )
           ; `Scalar
               (Mark.mk_pos
                  ~pos:
                    { start_pos= {line= 1; column= 5; index= 4}
                    ; end_pos= {line= 1; column= 12; index= 11}
                    ; file= "test" }
                  {value= "a . b"; style= `Single_quoted} )
           ; `Scalar
               (Mark.mk_pos
                  ~pos:
                    { start_pos= {line= 1; column= 13; index= 12}
                    ; end_pos= {line= 1; column= 16; index= 15}
                    ; file= "test" }
                  {value= "1.4"; style= `Plain} ) ] )
  | None ->
      print_logs output ;
      assert false
