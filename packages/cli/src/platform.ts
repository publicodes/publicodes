import os from 'node:os'

export function getPublicodesBinName(): string {
	const platform = os.platform()

	switch (platform) {
		case 'linux':
			return 'publicodes-linux'
		case 'darwin':
			return 'publicodes-macos'
		case 'win32':
			return 'publicodes-windows.exe'
		default:
			throw new Error(`Unsupported platform: ${platform}`)
	}
}
