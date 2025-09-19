export type BaseType =
	| { number: boolean }
	| { string: boolean }
	| { boolean: boolean }
	| { date: boolean }
	| null

export type Outputs = {
	readonly [outputName: string]: {
		readonly parameters: { readonly [paramName: string]: null }
		readonly type: BaseType
		readonly nodeIndex: NodeIndex | null
	}
}

export type GetType<O extends Outputs, R extends keyof O> =
	O[R]['type'] extends null ? unknown
	: O[R]['type'] extends { number: boolean } ? number
	: O[R]['type'] extends { string: boolean } ? string
	: O[R]['type'] extends { boolean: boolean } ? boolean
	: O[R]['type'] extends { date: boolean } ? Date
	: never

export type Parameters<O extends Outputs> = {
	readonly [K in keyof O]: O[K]['parameters']
}
export type RuleName<O extends Outputs> = Extract<keyof O, string>

export type GetContext<O extends Outputs, R extends RuleName<O>> = Partial<{
	readonly [K in keyof O[R]['parameters'] & keyof O]: GetType<O, K>
}>

export interface Publicodes<O extends Outputs> {
	readonly evaluation: unknown
	readonly outputs: O
}

export type Evaluation<O extends Outputs, R extends RuleName<O>> = {
	value: GetType<O, R> | undefined | null
	neededParameters: Array<keyof GetContext<O, R>>
	missingParameters: Array<keyof GetContext<O, R>>
}
type NodeIndex = number
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
	| [BinaryOp, left: NodeIndex, right: NodeIndex]
	| [UnaryOp, NodeIndex]
	| [if_: NodeIndex, then_: NodeIndex, else_: NodeIndex] // Conditional
	| string
	| null
	| boolean
	| number
	| [] // Undefined
	| { date: string } // Date format like 'YYYY-MM-DD' or 'YYYY-MM'
	| { get: string } // get value from context
	| { context: Record<string, NodeIndex>; value: NodeIndex }
	| ['round', 'up' | 'down' | '~', precision: NodeIndex, value: NodeIndex]
