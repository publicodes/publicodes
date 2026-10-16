export const PRECEDENCE: Record<string, number> = {
	or: 1,
	and: 2,
	eq: 3,
	noteq: 3,
	gt: 4,
	lt: 4,
	gteq: 4,
	lteq: 4,
	add: 5,
	sub: 5,
	mul: 6,
	div: 6,
	pow: 7,
}

export function needsParens(
	parentKind: string,
	childKind: string,
	side: 'left' | 'right',
): boolean {
	const parentPrec = PRECEDENCE[parentKind] ?? -1
	const childPrec = PRECEDENCE[childKind]
	// A reference and a constant are atoms: they never need wrapping, and
	// treating them as lowest precedence wrapped every one of them.
	if (childPrec === undefined) return false

	if (childPrec < parentPrec) return true
	if (childPrec > parentPrec) return false

	if (parentKind === 'sub' || parentKind === 'div') return true
	if (parentKind === 'pow') return side === 'left'
	return false
}

/**
 * The chains a page writes flat: `a + b + c` is one equation, not a sum inside a sum. A
 * power and a comparison never flatten — their nesting *is* the meaning — and a chain
 * that opens a subtraction or a division turns its operators around (`inverts`).
 */
const FLATTENING: Record<string, readonly string[]> = {
	add: ['add', 'sub'],
	sub: ['add', 'sub'],
	mul: ['mul', 'div'],
	div: ['mul', 'div'],
	and: ['and'],
	or: ['or'],
}

/** Whether a chain of the same precedence reads the same flattened. */
export function flattens(parentKind: string, childKind: string): boolean {
	return FLATTENING[parentKind]?.includes(childKind) ?? false
}

/**
 * Whether the operators under a line turn around: `a − (b + c)` writes `− b` and `− c`,
 * and `a ÷ (b × c)` writes `÷ b` and `÷ c`.
 */
export const inverts = (kind: string): boolean => kind === 'sub' || kind === 'div'
