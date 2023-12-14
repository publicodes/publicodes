import type PublicodesEngine from 'publicodes'
import type { PublicodesExpression } from 'publicodes'

export type Expressions = PublicodesExpression | PublicodesExpression[]

export type Situation = Partial<Record<string, PublicodesExpression>>

export type Engine = PublicodesEngine
