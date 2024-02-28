import { useContext, useEffect, useState } from 'react'
import { useEngine } from '../hooks'
import { styled } from 'styled-components'
import Fuse from 'fuse.js'
import { RuleLinkWithContext } from '../RuleLink'
import { DottedNameContext } from '../contexts'

type SearchableRule = {
	name: string
	title?: string
}

export default function RulesSearch() {
	const engine = useEngine()
	const dottedName = useContext(DottedNameContext)
	const rules: SearchableRule[] = Object.entries(engine.getParsedRules()).map(
		([name, rule]) => {
			return { name, title: rule?.rawNode?.titre }
		},
	)
	const [searchResults, setSearchResults] = useState<SearchableRule[]>([])
	const [searchQuery, setSearchQuery] = useState('')

	const fuse = new Fuse(rules, { keys: ['title', 'name'] })

	useEffect(() => {
		setSearchQuery('')
	}, [dottedName])

	useEffect(() => {
		const results = fuse.search(searchQuery, { limit: 10 })
		setSearchResults(results.map((result) => result.item))
	}, [searchQuery])

	const isEmpty = searchResults.length === 0

	return (
		<SearchContainer id="documentation-search">
			<SearchInput
				id="documentation-search-input"
				type="text"
				placeholder="Chercher une règle"
				value={searchQuery}
				onChange={(e) => setSearchQuery(e.target.value)}
				onFocus={(e) => setSearchQuery(e.target.value)}
				empty={isEmpty}
			/>
			{!isEmpty ?
				<SearchResults id="documentation-search-results">
					{searchResults.map(({ name, title }, i) => {
						return (
							<SearchItem
								key={name}
								id="documentation-search-item"
								isLast={i === searchResults.length - 1}
								onClick={() => setSearchQuery('')}
							>
								<RuleLinkWithContext dottedName={name}>
									<ItemContent onClick={() => setSearchQuery('')}>
										<ItemName id="documentation-search-item-name">
											{name}
										</ItemName>
										<ItemTitle id="documentation-search-item-title">
											{title}
										</ItemTitle>
									</ItemContent>
								</RuleLinkWithContext>
							</SearchItem>
						)
					})}
				</SearchResults>
			:	null}
		</SearchContainer>
	)
}

const SearchContainer = styled.div`
	margin-bottom: 1rem;
	margin-right: 1rem;
	max-width: 350px;
`

const SearchInput = styled.input<{ empty: boolean }>`
	width: 100%;
	padding: 0.5rem;
	border: 1px solid #ccc;
	border-radius: ${({ empty }) => (empty ? '5px' : '5px 5px 0 0')};

	&:focus {
		outline: none;
		border: 1px solid #666;
	}
`

const SearchResults = styled.div`
	background-color: white;
	border: 1px solid #ccc;
	border-top: none;
	border-radius: 0 0 0.25rem 0.25rem;
	position: relative;
`

const SearchItem = styled.div<{ isLast: boolean }>`
	padding: 0.5rem;
	border-bottom: ${({ isLast }) => (isLast ? 'none' : '1px solid #e6e6e6')};
	border-left: 2px solid transparent;
	border-radius: ${({ isLast }) => (isLast ? '0 0 0.25rem 0.25rem' : '0')};

	&:hover {
		background-color: #f6f6f6;
	}
`
const ItemContent = styled.span`
	display: flex;
	flex-wrap: wrap;
	flex-gap: 0.5rem;
	align-items: center;
`

const ItemName = styled.span`
	width: 100%;
`
const ItemTitle = styled.span`
	color: #666;
`
