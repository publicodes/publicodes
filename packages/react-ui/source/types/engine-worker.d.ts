import { Actions } from '../actions'

declare module '@publicodes/worker-react' {
	interface UserConfig {
		additionalActions: Actions
	}
}
