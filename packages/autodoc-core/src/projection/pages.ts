import type { LookupCtx, RelatedRuleView } from './types'
import { displayName } from './names'

/**
 * Whether the model gives a rule a page: the rules the host declares a URL for, and those
 * the author marked `public`.
 */
export const hasPage = (ctx: LookupCtx, address: string): boolean =>
	ctx.pages?.has(address) === true || ctx.ast[address]?.public === true

/** The way to that page, when there is one: the rule, and the name a control reads. */
export const pageOf = (
	ctx: LookupCtx,
	address: string,
): RelatedRuleView | null =>
	hasPage(ctx, address) ?
		{ address, name: displayName(ctx.ast, address) }
	:	null
