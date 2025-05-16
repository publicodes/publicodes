export type Outputs = string
export type BaseType =
  | { number: null }
  | { string: null }
  | { boolean: null }
  | { date: null }
  | null

export type Types = {
  readonly [P in string]: BaseType
}

export type Parameters<T extends Types> = {
  readonly [K in keyof T]: { readonly [K2 in keyof T]?: null }
}

export type GetType<T extends BaseType> =
  T extends null ? unknown
  : T extends { number: null } ? number
  : T extends { string: null } ? string
  : T extends { boolean: null } ? boolean
  : T extends { date: null } ? Date
  : never

export type ValueOf<T extends readonly unknown[]> = T[number]

export type GetContext<
  T extends Types,
  P extends Parameters<T>,
  R extends Extract<keyof T, string>,
> = Partial<{ readonly [K in keyof P[R] & keyof T]: GetType<T[K]> }>

export interface Publicodes<T extends Types, P extends Parameters<T>> {
  readonly types: T
  readonly parameters: P
  readonly evaluationTree: unknown
}

export type EvaluationTree = Record<string, Computation>

export type Value = number | string | boolean | null | undefined | Date

type UnaryOp = '-' | '∅'
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
  | { d: string } // Date format like 'YYYY-MM-DD' or 'YYYY-MM'
  | { get: string } // get value from context
  | { context: Record<string, Computation>; value: Computation }
