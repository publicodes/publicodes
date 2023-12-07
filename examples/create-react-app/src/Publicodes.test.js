import { fireEvent, render, screen } from '@testing-library/react'
import fs from 'fs'
import { rest } from 'msw'
import { setupServer } from 'msw/node'

import Publicodes from './Publicodes'

Object.defineProperty(window, 'matchMedia', {
	value: () => ({
		matches: false,
		addListener: () => {},
		removeListener: () => {},
	}),
})

const server = setupServer(
	rest.get('/CO2-douche.publicodes.yaml', (_, res, ctx) => {
		// Respond with a mocked user token that gets persisted
		// in the `sessionStorage` by the `Login` component.
		const rules = fs.readFileSync('./public/CO2-douche.publicodes.yaml', 'utf8')
		return res(ctx.text(rules))
	}),
)

// Enable API mocking before tests.
beforeAll(() => server.listen())

// Reset any runtime request handlers we may add during the tests.
afterEach(() => server.resetHandlers())

// Disable API mocking after the tests ar
test('renders loading text while fetching rules', () => {
	render(<Publicodes />)
	const loadElement = screen.getByText(
		/Chargement des règles de calculs en cours.../i,
	)
	expect(loadElement).toBeInTheDocument()
})

test('initialize correctly publicodes', async () => {
	render(<Publicodes />)
	const title = await screen.findAllByText("Impact carbone d'une douche")
	expect(title[0]).toBeInTheDocument()
})

test('navigation in documentation', async () => {
	render(<Publicodes />)
	const debit = await screen.findAllByText('Débit')
	fireEvent.click(debit[0])
	expect(document.body).toHaveTextContent('18 litre / min')
})
