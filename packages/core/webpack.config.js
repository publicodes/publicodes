/* eslint-env node */
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'

const babelLoader = {
	loader: 'babel-loader',
	options: {
		cacheDirectory: true,
		rootMode: 'upward',
		presets: [
			[
				'@babel/preset-env',
				{
					targets: {
						esmodules: true,
					},
					useBuiltIns: 'entry',
					corejs: '3',
				},
			],
		],
	},
}
const common = {
	resolve: {
		extensions: ['.ts', '.tsx', '.js'],
	},
	mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
	entry: new URL('./source/index.ts', import.meta.url).pathname,
	module: {
		rules: [
			{
				test: /\.(js|ts|tsx)$/,
				use: babelLoader,
				exclude: /node_modules|dist/,
			},
			{
				test: /\.ne$/,
				use: [babelLoader, 'nearley-loader'],
			},
			{
				test: /\.yaml$/,
				use: ['json-loader', 'yaml-loader'],
			},
			// Fixes fsevents bug import bug, see https://stackoverflow.com/questions/64103792/fsevents-causes-module-parse-failed-unexpected-character
			{
				test: /.node$/,
				loader: 'node-loader',
			},
		],
	},
}

export default [
	{
		...common,
		plugins: process.env.ANALYZE_BUNDLE ? [new BundleAnalyzerPlugin()] : [],
		output: {
			filename: 'index.js',
			path: new URL('./dist/esm', import.meta.url).pathname,
			libraryTarget: 'module',
		},
		experiments: {
			outputModule: true,
		},
	},
	{
		...common,
		output: {
			filename: 'index.cjs',
			path: new URL('./dist/umd', import.meta.url).pathname,
			library: 'publicodes',
			libraryTarget: 'umd',
			globalObject: 'this',
		},
		externals:
			// Every non-relative module is external
			/^[a-z\-0-9]+$/,
	},
	// Add a .min.js version for browser in production mode
	process.env.NODE_ENV === 'production' && {
		...common,
		output: {
			filename: 'index.min.js',
			library: 'publicodes',
			libraryTarget: 'global',
		},
	},
].filter(Boolean)
