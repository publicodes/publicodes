import { useState } from 'react'
import { styled } from 'styled-components'

const PreWrapper = styled.div`
	position: relative;
	:hover button,
	:focus-within button {
		opacity: 1;
	}
`

const Bar = styled.div`
	position: absolute;
	right: 0;
	top: 0;
	margin: 0.5rem;
	line-height: 0;

	& button {
		margin: 0;
		padding: 1px 3px;
		transition: opacity ease-in-out 0.1s;
		opacity: 0.25;

		:hover {
			cursor: pointer;
		}
		:not(:last-child) {
			margin-right: 0.5rem;
		}
	}
`

const Pre = styled.pre`
	overflow: auto;
	padding: 0.5rem;
	background-color: #e6e9ec;
	border-radius: 0.25rem;
`

export interface CodeProps {
	tabs: { [name: string]: string }
}

export const Code = ({ tabs }: CodeProps) => {
	const [tab, setTab] = useState<string>()
	const tabKeys = Object.keys(tabs)

	const activeTab = tab ?? tabKeys[0]

	return (
		<PreWrapper>
			<Bar>
				{typeof navigator !== 'undefined' && navigator.clipboard && (
					<button
						onClick={() => navigator.clipboard.writeText(tabs[activeTab])}
					>
						copier
					</button>
				)}
				{tabKeys.length > 1 &&
					tabKeys
						.filter((name) => name !== activeTab)
						.map((name) => (
							<button key={name} onClick={() => setTab(name)}>
								{name}
							</button>
						))}
			</Bar>
			<Pre>
				<code>{tabs[activeTab]}</code>
			</Pre>
		</PreWrapper>
	)
}
