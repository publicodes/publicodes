/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
	title: 'Publicodes',
	tagline: "Le langage pour les algorithmes d'intérêt public",
	url: 'https://publi.codes',
	baseUrl: '/',
	onBrokenLinks: 'warn', // TODO: use 'throw',
	onBrokenMarkdownLinks: 'warn',
	favicon: 'img/favicon-32x32.png',
	organizationName: 'betagouv',
	projectName: 'publicodes',
	themes: ['@docusaurus/theme-live-codeblock'],
	themeConfig: {
		navbar: {
			title: 'Publicodes',
			logo: {
				alt: 'Publicodes logo',
				src: 'img/logo-publicodes.svg',
			},
			items: [
				{
					type: 'doc',
					docId: 'principes-de-base',
					position: 'left',
					label: 'Documentation',
				},
				{
					to: 'studio',
					position: 'left',
					label: 'Bac à sable',
				},
				{
					href: 'https://gitter.im/publicodes/community',
					label: 'Chat',
					position: 'right',
				},
				{
					href: 'https://github.com/betagouv/publicodes',
					label: 'GitHub',
					position: 'right',
				},
			],
		},
		prism: {
			// Unfortunately, I can't find a good dark theme for `yaml` snippets. The
			// `themes/github` works well with different colors for keys and values
			// but it doesn't exist in dark mode variant in the default list.
			theme: require('prism-react-renderer/themes/palenight'),
		},
		footer: {
			links: [
				{
					title: 'À propos',
					items: [
						{
							label: 'Statistiques de consultation',
							to: '/statistiques',
						},
					],
				},
			],
		},
	},
	presets: [
		[
			'@docusaurus/preset-classic',
			{
				docs: {
					sidebarPath: require.resolve('./sidebars.js'),
					editUrl:
						'https://github.com/betagouv/publicodes/edit/master/website/',
					remarkPlugins: [
						[require('@docusaurus/remark-plugin-npm2yarn'), { sync: true }],
					],
				},
				theme: {
					customCss: require.resolve('./src/css/custom.css'),
				},
				pages: {
					remarkPlugins: [require('@docusaurus/remark-plugin-npm2yarn')],
				},
			},
		],
	],
	scripts: [
		'plausible',
		{
			src: 'https://plausible.io/js/plausible.js',
			'data-domain': 'publi.codes',
			defer: true,
		},
	],
	plugins: [
		// Hacky Webpack config magic in order to display the Publicodes
		// documentation in the studio. Indeed the documentation component depends
		// on a old version of `react-markdown` which is expect some "browserify"
		// logic to be handled by Webpack, which is no longer the case in Webpack 5.
		// TODO: We should upgrade `react-markdown` and remove this unbearable
		// config -- but of course `react-markdwon` API changed in breaking ways so
		// there is a little bit of work involved.
		function ConfigWebpackPlugin() {
			return {
				name: 'config-webpack',
				configureWebpack() {
					return {
						resolve: {
							fallback: {
								path: require.resolve('path-browserify'),
							},
						},
						plugins: [
							new (require('webpack').ProvidePlugin)({
								process: 'process/browser.js',
							}),
						],
					}
				},
			}
		},
	],
}
