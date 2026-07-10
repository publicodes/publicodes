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
	const childPrec = PRECEDENCE[childKind] ?? -1

	if (childPrec < parentPrec) return true
	if (childPrec > parentPrec) return false

	if (parentKind === 'sub' || parentKind === 'div') return true
	if (parentKind === 'pow') return side === 'left'
	return false
}
