import type { PublicodeAST } from '@publicodes/autodoc-core/ast'

/**
 * Le JSON du modèle, lu comme l'AST qu'il est. Le compilateur écrit ces fichiers et le schéma
 * les décrit, mais TypeScript ne lit d'un JSON que ses littéraux (`kind: string`) : c'est la
 * seule frontière où le type est affirmé plutôt que vérifié.
 */
export const asAst = (json: unknown): PublicodeAST => json as PublicodeAST
