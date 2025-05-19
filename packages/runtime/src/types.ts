export type BaseType =
  | { number: null }
  | { string: null }
  | { boolean: null }
  | { date: null }
  | null

export type Types = {
  readonly [P in string]: BaseType
}

export type GetType<T extends Types, R extends keyof T> =
  T[R] extends null ? unknown
  : T[R] extends { number: null } ? number
  : T[R] extends { string: null } ? string
  : T[R] extends { boolean: null } ? boolean
  : T[R] extends { date: null } ? Date
  : never

export type Parameters<T extends Types> = {
  readonly [K in keyof T]: { readonly [K2 in keyof T]?: null }
}
export type RuleName<T extends Types> = Extract<keyof T, string>

export type GetContext<
  T extends Types,
  P extends Parameters<T>,
  R extends RuleName<T>,
> = Partial<{ readonly [K in keyof P[R] & keyof T]: GetType<T, K> }>

export interface Publicodes<T extends Types, P extends Parameters<T>> {
  readonly types: T
  readonly parameters: P
  readonly evaluationTree: unknown
}

export type EvaluationTree = Record<string, Computation>

export type Evaluation<
  T extends Types,
  P extends Parameters<T>,
  R extends RuleName<T>,
> = {
  value: GetType<T, R> | undefined | null
  inputs: keyof GetContext<T, P, R>
}

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
