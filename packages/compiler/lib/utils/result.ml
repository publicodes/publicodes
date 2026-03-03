let ( let* ) m f = Base.Result.bind m ~f

let ( >>= ) m f = Base.Result.bind m ~f

let ( >>| ) m f = Base.Result.map m ~f
