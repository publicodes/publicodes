export type CompiledPublicodes = Record<string, Computation>

export type Value = number | string | boolean | null | undefined | Date

type UnaryOp = '-'
export type BinaryOp =
  | '+'
  | '-'
  | '*'
  | '/'
  | '**'
  | '='
  | '!='
  | '<'
  | '<='
  | '>'
  | '>='
  | '&&'
  | '||'

export type Computation =
  | [Computation, BinaryOp, Computation]
  | [UnaryOp, Computation]
  | string // Reference
  | null
  | boolean
  | [] // Undefined
  | [number]
  | [string]
  | {
      if: Computation
      then: Computation
      else: Computation
    }
  | {
      d: string // Date format like 'YYYY-MM-DD' or 'YYYY-MM'
    }
