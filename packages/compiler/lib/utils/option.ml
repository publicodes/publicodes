let ( let* ) m f = Base.Option.bind m ~f

let ( let+ ) m f = Base.Option.map m ~f

let ( >>= ) m f = Base.Option.bind m ~f

let ( >>| ) m f = Base.Option.map m ~f
