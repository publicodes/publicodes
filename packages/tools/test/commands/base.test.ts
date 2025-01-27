import { CLIExecutor, runInDir } from '../cli-utils'

describe('publicodes --help', () => {
  it('should list all available commands', async () => {
    const cli = new CLIExecutor()

    runInDir('tmp', async () => {
      const { stdout } = await cli.execCommand('--help')
      expect(stdout).toContain('init')
      expect(stdout).toContain('compile')
    })
  })
})
