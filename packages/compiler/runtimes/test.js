/** Exported outputs/inputs */

const rules = {
	'ma règle': {
		/**
		 * Parameters of "ma règle"
		 * @typedef {{
				'ma règle'? : number | undefined;
				a?: string | undefined
			}} MaRègleParams
		 */

		/**
		 * Evaluate "ma règle"
		@param {MaRègleParams} params
		@param {boolean} [cache=false]
    @return {string | null | undefined}
    */
		evaluate: (params = {}, cache = false) => null /**todo */,
		/**
		 * Ma super règle
		 * @type {string}
		 */
		title: 'Ma super règle',
		/**
		 * @type {"number"}
		 */
		type: 'number',
		/**
		 * @type{"€"}
		 */
		unit: '€',
		/** List of params
		 * @type {Array<keyof MaRègleParams>}
		 */
		params: ['ma règle', 'a'],
		meta: {
			question: 'Quel est la valeur de ?',
		} /** @type {const} */,
	},
	a: {
		/**
		 * Parameters of "a"
		 * @typedef {{
				a?: boolean | undefined
			}} AParams
		 */

		/**
		 * Evaluate "a"
		@param {AParams} params
		@param {boolean} [cache=false]
    @return {string | null | undefined}
    */
		evaluate: (params = {}, cache = false) => null /** todo */,
		/**
		 * A
		 * @type {string}
		 */
		title: 'A',
		/**
		 * @type {"boolean"}
		 */
		type: 'boolean',
		/** Parameter list for "a"
		 * @type {Array<keyof AParams>}
		 */
		params: ['a'],
	},
}

export default rules
