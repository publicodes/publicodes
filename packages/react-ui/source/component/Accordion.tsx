import { useState } from 'react'
import styled, { css } from 'styled-components'
import { AccordionItem } from '../contexts'
import { Arrow } from './icons'

const AccordionContainer = styled.div`
	overflow: hidden;
	border-radius: 6px;
	border: 1px solid #bbb;
`

const H3 = styled.h3`
	font-size: 16px;
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
	border: 0 solid #bbb;
	${({ i }) =>
		i > 0 &&
		css`
			border-top-width: 1px;
		`}

	& ${H3} {
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

	const toggleAccordion = (i: number) => () =>
		setOpen((arr) => {
			arr[i] = !arr[i]

			return [...arr]
		})

	return (
		<AccordionContainer>
			{items.map(({ id, title, children }, i) => (
				<AccordionWrapper id={id} key={id} i={i}>
					<H3>
						<button onClick={toggleAccordion(i)}>
							<span>{title}</span>
							<StyledArrow $isOpen={open[i]} />
						</button>
					</H3>
					<div>
						<Child open={!!open[i]}>{children}</Child>
					</div>
				</AccordionWrapper>
			))}
		</AccordionContainer>
	)
}
