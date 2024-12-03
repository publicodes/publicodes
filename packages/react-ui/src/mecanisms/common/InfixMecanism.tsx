import { EvaluatedNode } from 'publicodes'
import React from 'react'
import Explanation from '../../Explanation'

export const InfixMecanism = ({
	value,
	prefixed,
	children,
}: {
	value: EvaluatedNode
	children: React.ReactNode
	prefixed?: boolean
}) => {
	return (
		<div>
			{prefixed && children}
			<div
				className="value"
				style={{
					position: 'relative',
					margin: '1rem 0',
				}}
			>
				<Explanation node={value} />
			</div>
			{!prefixed && children}
		</div>
	)
}
