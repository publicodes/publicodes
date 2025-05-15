let exit_err = 1

open Cmdliner
open Cmdliner.Term.Syntax

let files = Arg.(non_empty & pos_all file [] & info [] ~docv:"FILE")
