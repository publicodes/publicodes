open Ast
open Base
open Parse
open Utils
open Utils.Output

let file = File.std

let%test_unit "parse scalar" =
  let str = "scalar" in
  let output = parse file str in
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
                ; file }
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
  let output = parse file str in
  match result output with
  | Some yaml ->
      [%test_eq: yaml] yaml
        (`O
           [ (* Key *)
             ( Mark.mk_pos
                 ~pos:
                   { start_pos= {line= 2; column= 3; index= 3}
                   ; end_pos= {line= 2; column= 11; index= 11}
                   ; file }
                 {value= "ma règle"; style= `Plain}
             , (* Value *)
               `Scalar
                 (Mark.mk_pos
                    ~pos:
                      { start_pos= {line= 2; column= 12; index= 12}
                      ; end_pos= {line= 2; column= 12; index= 12}
                      ; file }
                    {value= ""; style= `Plain} ) )
           ; (* Key *)
             ( Mark.mk_pos
                 ~pos:
                   { start_pos= {line= 3; column= 3; index= 15}
                   ; end_pos= {line= 3; column= 4; index= 16}
                   ; file }
                 {value= "b"; style= `Plain}
             , (* Value *)
               `Scalar
                 (Mark.mk_pos
                    ~pos:
                      { start_pos= {line= 4; column= 5; index= 22}
                      ; end_pos= {line= 4; column= 6; index= 23}
                      ; file }
                    {value= "2"; style= `Plain} ) ) ] )
  | None ->
      print_logs output ;
      assert false

let%test_unit "parse array" =
  let str = "[a, 'a . b',1.4]" in
  let output = parse file str in
  match result output with
  | Some yaml ->
      [%test_eq: yaml] yaml
        (`A
           [ `Scalar
               (Mark.mk_pos
                  ~pos:
                    { start_pos= {line= 1; column= 2; index= 1}
                    ; end_pos= {line= 1; column= 3; index= 2}
                    ; file }
                  {value= "a"; style= `Plain} )
           ; `Scalar
               (Mark.mk_pos
                  ~pos:
                    { start_pos= {line= 1; column= 5; index= 4}
                    ; end_pos= {line= 1; column= 12; index= 11}
                    ; file }
                  {value= "a . b"; style= `Single_quoted} )
           ; `Scalar
               (Mark.mk_pos
                  ~pos:
                    { start_pos= {line= 1; column= 13; index= 12}
                    ; end_pos= {line= 1; column= 16; index= 15}
                    ; file }
                  {value= "1.4"; style= `Plain} ) ] )
  | None ->
      print_logs output ;
      assert false
