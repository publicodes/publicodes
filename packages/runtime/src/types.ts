export type BaseType =
	| { number: null }
	| { string: null }
	| { boolean: null }
	| { date: null }
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
	: O[R]['type'] extends { number: null } ? number
	: O[R]['type'] extends { string: null } ? string
	: O[R]['type'] extends { boolean: null } ? boolean
	: O[R]['type'] extends { date: null } ? Date
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
	| [BinaryOp, NodeIndex, NodeIndex]
	| [UnaryOp, NodeIndex]
	| [NodeIndex, NodeIndex, NodeIndex] // Conditional
	| string
	| null
	| boolean
	| number
	| [] // Undefined
	| { date: string } // Date format like 'YYYY-MM-DD' or 'YYYY-MM'
	| { get: string } // get value from context
	| { context: Record<string, Computation>; value: NodeIndex }
