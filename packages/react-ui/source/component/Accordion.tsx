import { useState } from 'react'
import styled, { css } from 'styled-components'
import { AccordionItem } from '../contexts'
import { ArrowDown, ArrowUp } from './icons'

const AccordionWrapper = styled.div`
	overflow: hidden;
	border-radius: 6px;
	border: 1px solid #9db9f1;
`

const H3 = styled.h3`
	font-size: 16px;
	font-weight: 700;
	margin: 2rem 0px 1rem;
	color: rgb(29, 66, 140);
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
		background: #f0f5ff;
		background-color: rgb(240, 245, 255);
		color: rgb(29, 66, 140);
		padding: 1.5rem;
		cursor: pointer;
		font-size: 1rem;
		font-family: Roboto, sans-serif;
		font-weight: bold;

		&:hover {
			text-decoration: underline;
		}
	}
`

const Div = styled.div<{ i: number }>`
	border: 0 solid #9db9f1;
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

const Arrow = styled.div`
	display: inline-block;
	width: 25px;
	height: 25px;
`

export interface AccordionProps {
	items: AccordionItem[]
}

export const Accordion = ({ items }: AccordionProps) => {
	const [open, setOpen] = useState<(undefined | boolean)[]>([])

	const toggleAccordion = (i: number) => () =>
		setOpen((arr) => {
			const newOpen = [...arr]
			newOpen[i] = !newOpen[i]

			return newOpen
		})

	return (
		<AccordionWrapper>
			{items.map(({ id, title, children }, i) => (
				<Div id={id} key={id} i={i}>
					<H3>
						<button onClick={toggleAccordion(i)}>
							<span>{title}</span>
							<Arrow>{open[i] ? <ArrowUp /> : <ArrowDown />}</Arrow>
						</button>
					</H3>
					<div>
						<Child open={!!open[i]}>{children}</Child>
					</div>
				</Div>
			))}
		</AccordionWrapper>
	)
}
