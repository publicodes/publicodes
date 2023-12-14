import resolveNodeModules from '@rollup/plugin-node-resolve'

export default {
	build: {
		rollupOptions: {
			plugins: [resolveNodeModules()],
		},
	},
}
