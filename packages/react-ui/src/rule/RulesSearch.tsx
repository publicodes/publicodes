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

	const [selectedIndex, setSelectedIndex] = useState(-1)

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
		setSelectedIndex(-1)
	}, [dottedName])

	useEffect(() => {
		const results = fuse.search(searchQuery, { limit: 10 })
		setSearchResults(results.map((result) => result.item))
		setSelectedIndex(-1)
	}, [searchQuery])

	const isEmpty = searchResults.length === 0
	const resultsId = 'documentation-search-results'
	const inputId = 'documentation-search-input'

	return (
		<SearchContainer id="documentation-search">
			<SearchLabel htmlFor={inputId}>Rechercher une règle</SearchLabel>
			<SearchInput
				id={inputId}
				type="text"
				placeholder="Chercher une règle"
				value={searchQuery}
				onChange={(e) => setSearchQuery(e.target.value)}
				onFocus={(e) => setSearchQuery(e.target.value)}
				empty={isEmpty}
				aria-expanded={!isEmpty}
				aria-haspopup="listbox"
				aria-controls={resultsId}
				aria-activedescendant={
					selectedIndex >= 0 ? `search-result-${selectedIndex}` : undefined
				}
				role="combobox"
				autoComplete="on"
			/>
			{searchQuery.length > 0 && (
				<SROnlyDiv aria-live="polite" aria-atomic="true">
					{searchResults.length > 0 ?
						`${searchResults.length} résultat${searchResults.length > 1 ? 's' : ''} trouvé${searchResults.length > 1 ? 's' : ''}`
					:	'Aucun résultat trouvé'}
				</SROnlyDiv>
			)}
			{!isEmpty ?
				<SearchResults
					id={resultsId}
					role="listbox"
					aria-label="Résultats de recherche"
				>
					{searchResults.map(({ name, title }, i) => {
						const isSelected = i === selectedIndex
						return (
							<SearchItem
								key={name}
								id={`search-result-${i}`}
								isLast={i === searchResults.length - 1}
								isSelected={isSelected}
								onClick={() => setSearchQuery('')}
								role="option"
								aria-selected={isSelected}
							>
								<RuleLinkWithContext dottedName={name}>
									<ItemContent onClick={() => setSearchQuery('')}>
										<ItemName>{name}</ItemName>
										<ItemTitle>{title}</ItemTitle>
									</ItemContent>
								</RuleLinkWithContext>
							</SearchItem>
						)
					})}
				</SearchResults>
			: searchQuery.length > 0 ?
				<NoResultsMessage role="status" aria-live="polite">
					Aucun résultat trouvé pour &quot;{searchQuery}&quot;
				</NoResultsMessage>
			:	null}
		</SearchContainer>
	)
}

const SearchContainer = styled.div`
	margin-bottom: 1rem;
	margin-right: 1rem;
	max-width: 350px;
`

const SearchLabel = styled.label`
	position: absolute;
	width: 1px;
	height: 1px;
	padding: 0;
	margin: -1px;
	overflow: hidden;
	clip: rect(0, 0, 0, 0);
	white-space: nowrap;
	border: 0;
`

const SearchInput = styled.input<{ empty: boolean }>`
	width: 100%;
	padding: 0.5rem;
	border: 1px solid #4a5565;
	border-radius: ${({ empty }) => (empty ? '5px' : '5px 5px 0 0')};
	&:focus {
		outline: none;
		border: 1px solid #666;
		box-shadow: 0 0 0 2px rgba(102, 102, 102, 0.2);
	}
`

const SearchResults = styled.div`
	background-color: white;
	border: 1px solid #ccc;
	border-top: none;
	border-radius: 0 0 0.25rem 0.25rem;
	position: relative;
	max-height: 300px;
	overflow-y: auto;
`

const NoResultsMessage = styled.div`
	padding: 0.5rem;
	border: 1px solid #dee2e6;
	border-top: none;
	border-radius: 0 0 0.25rem 0.25rem;
	color: #6c757d;
	font-style: italic;
`

const SearchItem = styled.div<{ isLast: boolean; isSelected: boolean }>`
	padding: 0.5rem;
	border-bottom: ${({ isLast }) => (isLast ? 'none' : '1px solid #e6e6e6')};
	border-left: 2px solid transparent;
	border-radius: ${({ isLast }) => (isLast ? '0 0 0.25rem 0.25rem' : '0')};
	background-color: ${({ isSelected }) =>
		isSelected ? '#f0f0f0' : 'transparent'};

	&:hover {
		background-color: ${({ isSelected }) =>
			isSelected ? '#e0e0e0' : '#f6f6f6'};
	}

	&:focus {
		outline: 2px solid #007bff;
		outline-offset: -2px;
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

const SROnlyDiv = styled.p`
	position: absolute;
	width: 1px;
	height: 1px;
	padding: 0;
	margin: -1px;
	overflow: hidden;
	clip: rect(0, 0, 0, 0);
	white-space: nowrap;
	border-width: 0;
`
