type reporting = [`Error | `Warning | `None]

type flags = {orphan_rules: reporting}

type t = {flags: flags}
