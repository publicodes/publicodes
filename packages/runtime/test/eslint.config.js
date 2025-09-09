import baseConfig from '../../../eslint.config'
export default [
  ...baseConfig,
  {
    rules: { '@typescript-eslint/no-unsafe-member-access': 'warn' },
  },
]
