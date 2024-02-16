import React from 'react'
export default class ErrorBoundary extends React.Component<{
	children: React.ReactNode
}> {
	state: { error: false | { message: string; name: string } } = { error: false }

	static getDerivedStateFromError(error: Error) {
		// eslint-disable-next-line no-console
		console.error(error)
		return { error: { message: error.message, name: error.name } }
	}
	render() {
		if (this.state.error) {
			return (
				<div
					style={{
						background: 'lightyellow',
						padding: '20px',
						borderRadius: '5px',
					}}
				>
					<strong>{this.state.error.name}</strong>
					<br />
					{nl2br(this.state.error.message)}
					<br />
					<br />
					<a onClick={() => window.location.reload()}>Rafraichir</a>
				</div>
			)
		}
		return this.props.children
	}
}

const newlineRegex = /(\r\n|\r|\n)/g

export function nl2br(str: string) {
	if (typeof str !== 'string') {
		return str
	}

	return str.split(newlineRegex).map(function (line, index) {
		if (line.match(newlineRegex)) {
			return React.createElement('br', { key: index })
		}
		return line
	})
}
