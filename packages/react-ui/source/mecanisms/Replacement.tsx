import { EvaluatedNode } from 'publicodes/source/AST/types'
import { VariationNode } from 'publicodes/source/mecanisms/variations'
import React, { useEffect, useRef, useState } from 'react'
import Explanation from '../Explanation'
import { RuleLinkWithContext } from '../RuleLink'
import Variations from './Variations'

export default function Replacement(node: VariationNode & EvaluatedNode) {
	const applicableReplacement = node.explanation.find(
		(ex) => ex.satisfied
	)?.consequence
	const replacedNode = node.explanation.slice(-1)[0].consequence as {
		dottedName: string
	}
	const [displayReplacements, changeDisplayReplacement] = useState(false)

	return (
		<span>
			<Explanation node={applicableReplacement ?? replacedNode} />
			{applicableReplacement && (
				<>
					&nbsp;
					<button
						onClick={() => changeDisplayReplacement(!displayReplacements)}
					>
						🔄
					</button>{' '}
					&nbsp;
				</>
			)}
			{displayReplacements && (
				<Overlay onClose={() => changeDisplayReplacement(false)}>
					<h3>Remplacement existant</h3>
					<p>
						Un ou plusieurs remplacements ciblent la règle{' '}
						<RuleLinkWithContext dottedName={replacedNode.dottedName} /> à cet
						endroit. Sa valeur est calculée selon la formule suivante :
					</p>

					<Variations {...node} />
					<div style={{ marginTop: '1rem' }} />
					<p>
						<a href="https://publi.codes/documentation/principes-de-base#remplacement">
							En savoir plus sur le remplacement dans publicodes
						</a>
					</p>
				</Overlay>
			)}
		</span>
	)
}

function Overlay({
	children,
	onClose,
}: {
	children: React.ReactNode
	onClose: () => void
}) {
	const divRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const hideOnClickOutside = (click) => {
			if (!divRef.current) {
				return
			}
			if (divRef.current.contains(click.target)) {
				return
			}
			onClose()
		}
		window.addEventListener('click', hideOnClickOutside)
		return () => window.removeEventListener('click', hideOnClickOutside)
	}, [])
	return (
		<div
			ref={divRef}
			style={{
				backgroundColor: 'white',
				zIndex: 3,
				boxShadow: '0px 1px 2px rgba(0,0,0,0.25)',
				position: 'absolute',
				padding: '1rem',
				border: '1px solid rgba(0,0,0,0.25)',
				borderRadius: '0.3rem',
			}}
		>
			{children}
		</div>
	)
}
