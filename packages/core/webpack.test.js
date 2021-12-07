import { EnvironmentPlugin } from 'webpack'
import config from './webpack.config'

export default {
	...config[0],
	externals: [],
	target: 'node',
	output: {
		devtoolFallbackModuleFilenameTemplate: '[absolute-resource-path]?[hash]',
		devtoolModuleFilenameTemplate: '[absolute-resource-path]',
	},
	plugins: [
		new EnvironmentPlugin({
			NODE_ENV: 'test',
		}),
	],
}
