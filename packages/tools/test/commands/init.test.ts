import { execSync } from 'child_process'
import { CLIExecutor, runInDir } from '../cli-utils'
import fs from 'fs'
import { basePackageJson, PackageJson } from '../../src/utils/pjson'
import path from 'path'

const cli = new CLIExecutor()

describe('publicodes init', () => {
  it('should update existing package.json', async () => {
    runInDir('tmp', async (cwd) => {
      execSync('yarn init -y')

      const { stdout } = await cli.execCommand('init -y -p yarn')

      expect(stdout).toContain('Dependencies installed')
      expect(stdout).toContain('Files generated')
      expect(stdout).toContain('New to Publicodes?')

      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'))
      expect(packageJson).toMatchObject<PackageJson>(
        getExpectedBasePackageJson(cwd, packageJson),
      )

      expect(
        packageJson.devDependencies['@publicodes/tools'],
      ).not.toBeUndefined()

      expect(fs.existsSync('node_modules')).toBe(true)
      expect(fs.existsSync('yarn.lock')).toBe(true)
      expect(fs.existsSync('README.md')).toBe(true)
      expect(fs.existsSync('src/salaire.publicodes')).toBe(true)
      expect(fs.existsSync('test/salaire.test.ts')).toBe(true)
    })
  })

  it('should update existing package.json but no install', async () => {
    runInDir('tmp', async (cwd) => {
      execSync('yarn init -y')

      const { stdout } = await cli.execCommand('init -y --no-install -p yarn')

      expect(stdout).toContain('Files generated')
      expect(stdout).toContain('New to Publicodes?')

      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'))
      expect(packageJson).toMatchObject<PackageJson>(
        getExpectedBasePackageJson(cwd, packageJson),
      )
      expect(
        packageJson.devDependencies['@publicodes/tools'],
      ).not.toBeUndefined()

      expect(fs.existsSync('node_modules')).toBe(false)
      expect(fs.existsSync('yarn.lock')).toBe(false)
      expect(fs.existsSync('README.md')).toBe(true)
      expect(fs.existsSync('src/salaire.publicodes')).toBe(true)
    })
  })
})

function getExpectedBasePackageJson(
  cwd: string,
  packageJson: PackageJson,
): PackageJson {
  return {
    name: path.basename(cwd),
    type: 'module',
    main: 'publicodes-build/index.js',
    types: 'publicodes-build/index.d.ts',
    files: ['publicodes-build'],
    peerDependencies: basePackageJson.peerDependencies,
    devDependencies: basePackageJson.devDependencies,
    version: '1.0.0',
    description: '',
    author: '',
    license: 'MIT',
  }
}
