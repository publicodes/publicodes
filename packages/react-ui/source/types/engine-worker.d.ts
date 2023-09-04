import { PublicodesReactActions } from '../actions'

declare module '@publicodes/worker' {
	interface UserConfig {
		additionalActions: PublicodesReactActions
	}
}
