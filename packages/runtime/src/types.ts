export type Outputs = string
export type BaseType =
  | 'number'
  | 'string'
  | 'undefined'
  | 'null'
  | 'boolean'
  | 'date'
  | null
export type Types<O extends Outputs> = Record<O, BaseType>

export type Parameters<O extends Outputs> = {
  readonly [K in O]: ReadonlyArray<O>
}

export type GetType<T extends BaseType> =
  T extends null ? unknown
  : T extends 'number' ? number
  : T extends 'string' ? string
  : T extends 'undefined' ? undefined
  : T extends 'null' ? null
  : T extends 'boolean' ? boolean
  : T extends 'date' ? Date
  : never

export type ValueOf<T extends readonly unknown[]> = T[number]

export type GetContext<
  O extends Outputs,
  T extends Types<O>,
  P extends Parameters<O>,
  R extends O,
> = Partial<{ readonly [K in ValueOf<P[R]>]: GetType<T[K]> }>

export interface Publicodes<
  O extends Outputs,
  T extends Types<O>,
  P extends Parameters<O>,
> {
  readonly outputs: ReadonlyArray<O>
  readonly types: T
  readonly parameters: P
  readonly evaluationTree: EvaluationTree
}

export type EvaluationTree = Record<string, Computation>

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
