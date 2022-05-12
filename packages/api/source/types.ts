import type Engine from 'publicodes'
import type { PublicodesExpression } from 'publicodes'

export type Expressions = PublicodesExpression | PublicodesExpression[]

export type Situation = Partial<Record<string, PublicodesExpression>>

export type NewEngine = (
	expressions: Expressions,
	situation?: Situation
) => Engine
