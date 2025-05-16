let exit_err = 1

let exit_parsing_err = 2

open Cmdliner

let files = Arg.(non_empty & pos_all file [] & info [] ~docv:"FILE")
