export function objectFlip<
	K extends string,
	V extends string | number | symbol
>(obj: Record<K, V>): Record<V, K> {
	const ret = {};
	Object.keys(obj).forEach((key) => {
		ret[obj[key]] = key;
	});
	return ret as Record<V, K>;
}
