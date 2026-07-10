export function getRefDisplayName(
	targetRule: string,
	currentRule: string,
	doc: Record<string, { title?: string }>,
): string {
	const targetEntry = doc[targetRule]
	if (targetEntry?.title) {
		return targetEntry.title
	}

	if (!currentRule) {
		return targetRule
	}

	const targetParts = targetRule.split(' . ')
	const currentParts = currentRule.split(' . ')

	let commonLen = 0
	while (
		commonLen < targetParts.length &&
		commonLen < currentParts.length &&
		targetParts[commonLen] === currentParts[commonLen]
	) {
		commonLen++
	}

	const remaining = targetParts.slice(commonLen)
	return remaining.length > 0
		? remaining.join(' . ')
		: targetParts[targetParts.length - 1]
}
