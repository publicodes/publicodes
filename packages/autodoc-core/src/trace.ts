/**
 * Les deux valeurs que le moteur écrit là où une règle n'a rien : une absence, et une règle
 * qui ne s'applique pas. Ce sont les symboles du module — `TraceValue` accepte un symbole, et
 * les états d'une `ValueView` disent lequel.
 */
export const NotDefined = Symbol.for('not defined')
export const NotApplicable = Symbol.for('not applicable')

export type TraceValue = Date | number | string | boolean | symbol
export type NodeId = string
export type ContextStackId = string
export type Trace = Record<NodeId, Record<ContextStackId, TraceValue>>
