export type NotDefined = symbol & { __brand: 'NotDefined' }
export type NotApplicable = symbol & { __brand: 'NotApplicable' }

export const NotDefined = Symbol.for('not defined') as NotDefined
export const NotApplicable = Symbol.for('not applicable') as NotApplicable

export type TraceValue =
	| Date
	| number
	| string
	| boolean
	| NotApplicable
	| NotDefined
export type NodeId = string
export type ContextStackId = string
export type Trace = Record<NodeId, Record<ContextStackId, TraceValue>>
