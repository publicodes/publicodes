open Ppxlib

let expand ~ctxt env_var =
  let loc = Expansion_context.Extension.extension_point_loc ctxt in
  match Sys.getenv env_var with
  | value ->
      let ident = Longident.parse "Some" in
      let loc_ident = Ast_builder.Default.Located.mk ~loc ident in
      let value = Ast_builder.Default.estring ~loc value in
      Ast_builder.Default.pexp_construct ~loc loc_ident (Some value)
  | exception Not_found ->
      let ident = Longident.parse "None" in
      let loc_ident = Ast_builder.Default.Located.mk ~loc ident in
      Ast_builder.Default.pexp_construct ~loc loc_ident None

let my_extension =
  Extension.V3.declare "comptime_env_opt" Extension.Context.expression
    Ast_pattern.(single_expr_payload (estring __))
    expand

let rule = Ppxlib.Context_free.Rule.extension my_extension

let () = Driver.register_transformation ~rules:[rule] "comptime_env_opt"
