import baseConfig from '../../eslint.config.js'
import tseslint from 'typescript-eslint'

export default tseslint.config(...baseConfig, {
	ignores: ['rolldown.config.js', 'bin/**'],
})
