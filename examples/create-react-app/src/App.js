import './App.css'
import logo from './logo-publicodes.svg'
import Publicodes from './Publicodes.js'

function App() {
	return (
		<div>
			<header className="app_header">
				<a
					href="https://publi.codes"
					target="_blank"
					rel="noopener noreferrer"
					aria-label="voir la documentation de publicodes"
				>
					<img src={logo} alt="logo" />
					Publicodes
				</a>
			</header>
			<main className="app_container">
				<Publicodes />
			</main>
		</div>
	)
}

export default App
