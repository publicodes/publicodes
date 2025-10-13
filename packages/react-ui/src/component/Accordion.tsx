import { useState } from 'react'
import { css, styled } from 'styled-components'
import { AccordionItem } from '../contexts'
import { Arrow } from './icons/Arrow'

const AccordionContainer = styled.section`
	overflow: hidden;
	border-radius: 6px;
	border: 1px solid #1a1a1a;
`

const H4 = styled.h4`
	font-weight: 700;
	margin: 2rem 0px 1rem;
	font-size: 1.25rem;
	line-height: 1.75rem;

	button {
		display: flex;
		flex-wrap: nowrap;
		flex-direction: row;
		align-content: center;
		align-items: center;
		justify-content: space-between;
		text-align: left;
		width: 100%;
		height: 50px;
		border: none;
		padding: 1.5rem;
		cursor: pointer;
		font-size: 1rem;
		font-weight: bold;

		&:hover {
			text-decoration: underline;
		}
	}
`

const AccordionWrapper = styled.div<{ i: number }>`
	border: 0 solid #1a1a1a;
	${({ i }) =>
		i > 0 &&
		css`
			border-top-width: 1px;
		`}

	& ${H4} {
		margin: 0;
	}
`

const Child = styled.div<{ open: boolean }>`
	display: ${({ open }) => (open ? 'block' : 'none')};
	margin: 1.5rem;
`

const StyledArrow = styled(Arrow)<{ $isOpen: boolean }>`
	display: inline-block;
	width: 25px;
	transition: transform 0.1s;
	height: 25px;
	transform: rotate(${({ $isOpen }) => ($isOpen ? `180deg` : `360deg`)});
`

export interface AccordionProps {
	items: AccordionItem[]
}

export const Accordion = ({ items }: AccordionProps) => {
	const [open, setOpen] = useState<boolean[]>([])

	const toggleAccordion = (i: number) => {
		setOpen((arr) => {
			const newArr = [...arr]
			newArr[i] = !newArr[i]
			return newArr
		})
	}

	const handleKeyDown = (event: React.KeyboardEvent, i: number) => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault()
			toggleAccordion(i)
		}
	}

	return (
		<AccordionContainer role="region">
			{items.map(({ id, title, children }, i) => {
				const isOpen = !!open[i]
				const buttonId = `accordion-button-${id}`
				const contentId = `accordion-content-${id}`

				return (
					<AccordionWrapper key={id} i={i}>
						<H4>
							<button
								id={buttonId}
								type="button"
								aria-expanded={isOpen}
								aria-controls={contentId}
								onClick={() => toggleAccordion(i)}
								onKeyDown={(e) => handleKeyDown(e, i)}
							>
								<span>{title}</span>
								<StyledArrow $isOpen={isOpen} aria-hidden="true" />
							</button>
						</H4>
						<div
							id={contentId}
							role="region"
							aria-labelledby={buttonId}
							aria-hidden={!isOpen}
						>
							<Child open={isOpen}>{children}</Child>
						</div>
					</AccordionWrapper>
				)
			})}
		</AccordionContainer>
	)
}
