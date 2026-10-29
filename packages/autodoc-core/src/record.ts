/**
 * Un nœud de l'AST lu comme un dictionnaire : l'AST est du JSON, et une descente générique
 * y vérifie ce qu'elle trouve avant de le lire.
 */
export const isRecord = (node: unknown): node is Record<string, unknown> =>
	node !== null && typeof node === 'object'
