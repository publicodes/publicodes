import Engine, { PublicodesExpression } from 'publicodes'

type Expressions = PublicodesExpression | PublicodesExpression[]
type Situation = Partial<Record<string, PublicodesExpression>>

export type NewEngine = (
	expressions: Expressions,
	situation?: Situation
) => Engine
