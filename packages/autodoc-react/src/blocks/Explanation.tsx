import type { OperandView } from '@publicodes/autodoc-core'
import { useEffect, useState, type ReactElement } from 'react'
import { useAutodocPage } from '../components/AutodocPageContext'
import { FoldControl } from './FoldControl'
import { RulePageLink } from './RulePageLink'
import { Value } from './Value'
import { ExplanationList } from './ExplanationList'

/** What a reader copies keeps the shape of the computation: a tab per level of
 * indentation, then a tab between the cells. A grid ignores whitespace-only text
 * nodes, so what the eye sees does not change. */
const indentOf = (depth: number): string => '\n' + '\t'.repeat(depth)

/**
 * Le repli d'une fiche dure le temps de son mouvement : assez pour qu'on le voie, pas plus.
 * La même durée est écrite dans la règle `publicodes-detail` de la feuille de style.
 */
const FOLD_MS = 200

export function Explanation({
	view,
	head = false,
	lastValue = false,
	flush = false,
}: {
	view: OperandView
	head?: boolean
	lastValue?: boolean
	/** A line of a table: no operator column, so it starts at the edge of its sheet. */
	flush?: boolean
}): ReactElement {
	const page = useAutodocPage()
	const { toggleRow } = page
	// la fiche reste montée le temps de se replier : React ne peut pas animer un nœud qu'il
	// retire, et le papier doit se refermer sous la ligne qui l'a ouvert
	const [kept, setKept] = useState(view.detail)
	const open = view.detail !== null
	useEffect(() => {
		if (open) {
			setKept(view.detail)
			return
		}
		const timer = setTimeout(() => setKept(null), FOLD_MS)
		return () => clearTimeout(timer)
	}, [open, view.detail])
	const sheet = open ? view.detail : kept
	// une fiche qui nomme sa colonne est une table : son mot se lit sur la ligne qui l'ouvre,
	// pas sur une ligne à elle, et ses entrées se rangent dans les colonnes de la règle
	const table = sheet?.header ?? null
	const label = view.label ?? ''
	const note = view.parameterNote ?? undefined
	const termNote = view.gutter === '' ? note : undefined
	const control = (className: string) => (
		<button
			type="button"
			className={className}
			title={view.description ?? undefined}
			aria-expanded={view.open}
			onClick={() => view.key !== null && toggleRow(view.key)}
		>
			{label}
		</button>
	)
	const line = (
		<div
			className={
				'publicodes-row' +
				(head ? ' publicodes-row--head' : '') +
				(view.inert ? ' publicodes-row--inert' : '') +
				(view.folded ? ' publicodes-row--folded' : '') +
				(view.open ? ' publicodes-row--open' : '') +
				(flush ? ' publicodes-row--flush' : '') +
				(view.key !== null ? ' publicodes-row--unfoldable' : '') +
				(lastValue ? ' publicodes-row--last-value' : '')
			}
		>
			{indentOf(view.depth)}
			{/* the operator column: one mark, whether the line carries a sign or a mechanism's
			    word. A sign stays bare, at the notation's size; a word carries the pastille,
			    at the label's — so the two read as what they are */}
			{!head && !flush && (
				<>
					{/* une étiquette ouvre la colonne, un opérateur la ferme : la classe dit lequel des
					    deux, et la feuille de style les aligne */}
					<span
						className={
							'publicodes-row__gutter' +
							(view.gutterIsMechanism ? ' publicodes-row__gutter--label' : '')
						}
					>
						{view.gutter !== '' && (
							<span
								className={
									'publicodes-row__label' +
									(view.gutterIsMechanism ?
										' publicodes-row__label--word' +
										(view.gutter === '=' ? ' publicodes-row__label--equal' : '')
									:	' publicodes-row__label--sign')
								}
								title={note}
							>
								{view.gutter}
							</span>
						)}
					</span>
					{'\t'}
				</>
			)}
			<span className="publicodes-row__term" title={termNote}>
				{/* la phrase explique le premier mot de la ligne : le mot du langage s'il y en a
				    un, le nom de la ligne sinon */}
				{view.control === 'term' ?
					control(
						'publicodes-row__control' +
							(view.termIsMechanism ?
								' publicodes-row__label publicodes-row__label--word'
							:	''),
					)
				: view.termIsMechanism && view.label !== null ?
					// un mot du langage garde sa pastille, qu'il ouvre quelque chose ou non
					<span className="publicodes-row__label publicodes-row__label--word">
						{view.label}
					</span>
				:	view.label}
				{view.page && (
					<RulePageLink address={view.page.address} name={view.page.name} />
				)}
			</span>
			{'\t'}
			{table !== null ?
				// le mot de la table est la valeur de cette ligne-là : une seule cellule
				<span className="publicodes-value">
					<span className="publicodes-row__label publicodes-row__label--word">
						{table}
					</span>
				</span>
			: view.control === 'value' ?
				// the figure itself is the control, so it must be printed inside it
				<button
					type="button"
					className="publicodes-row__control publicodes-value"
					aria-expanded={view.open}
					onClick={() => view.key !== null && toggleRow(view.key)}
				>
					<Value value={view.value} />
				</button>
			:	<Value value={view.value} />}
			{view.fold && <FoldControl fold={view.fold} />}
		</div>
	)

	// the answer line is not written on a sheet of its own
	if (head) return line

	// the wrapper is the line's group: it carries the columns of the computation, so the line
	// and the sheet it opens share one grid. It is a sheet only where there is one to open —
	// the same element either way, so unfolding replaces no node under the reader's hand.
	return (
		<div
			className="publicodes-block"
			data-sheet={sheet ? true : undefined}
			// une ligne sans colonne d'opérateur n'en paie pas le prix : sa fiche commence au
			// bord du bloc, et son propre retrait est celui de sa colonne de marques
			data-flush={flush ? true : undefined}
		>
			{line}
			{sheet && (
				<div
					className="publicodes-detail"
					data-open={open}
					data-table={table === null ? undefined : 'true'}
					// une fiche qu'aucun clic n'ouvre — celle d'un `contexte` — est là d'emblée :
					// rien ne l'a dépliée, donc elle ne se déplie pas au premier rendu
					data-static={view.key === null && !head ? true : undefined}
				>
					<ExplanationList view={sheet} />
				</div>
			)}
		</div>
	)
}
