module.exports = async function studioRoute() {
	return {
		name: 'studio-route',
		async contentLoaded({ actions }) {
			const { addRoute } = actions

			addRoute({
				path: '/studio/:target*',
				component: '../src/pages/studio',
				exact: true,
			})
		},
	}
}
