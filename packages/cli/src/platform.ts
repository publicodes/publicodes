import os from 'node:os'

export function getPublicodesBinName(): string {
  const platform = os.platform()
  if (process.env.NODE_ENV === 'development') {
    return 'publicodes'
  }
  switch (platform) {
    case 'linux':
      return 'publicodes-linux'
    case 'darwin':
      return 'publicodes-macos'
    case 'win32':
      return 'publicodes-win32.exe'
    default:
      throw new Error(`Unsupported platform: ${platform}`)
  }
}
