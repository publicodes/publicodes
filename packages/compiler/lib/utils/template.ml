type t = (string * Jingoo.Jg_types.tvalue) list

let from_template template models =
  Jingoo.Jg_template.from_string
    ~env:
      { autoescape= false
      ; strict_mode= true
      ; template_dirs= []
      ; filters= []
      ; extensions= [] }
    template ~models
