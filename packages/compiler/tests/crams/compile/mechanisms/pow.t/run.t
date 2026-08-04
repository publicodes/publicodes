Ok puissance :
  $ publicodes compile ok -o - | ../../../scripts/get_rules.awk
  const rules = {
    'a': {
      /**
       * Parameters of "a"
       * @typedef {{
       * }} aParams
       */
      /**
       * Evaluate "a" with evaluation trace, and information on
       * missing and needed parameters.
       * @type {(params?: aParams, options?: {Options}) => {value: number, needed: Array<keyof aParams>, missing: Array<keyof aParams>, trace: {Trace}}}
       */
      evaluate: (params = {}, options) =>
        $evaluate(_a, params, options),
      /** @type {number} */
      type: 'number',
      /** @type {"euros"} */
      unit: "euros",
      /**
       * Parameter list for "a"
       * @type {Array<keyof aParams>}
       */
      params: [],
    },
    'b': {
      /**
       * Parameters of "b"
       * @typedef {{
       * }} bParams
       */
      /**
       * Evaluate "b" with evaluation trace, and information on
       * missing and needed parameters.
       * @type {(params?: bParams, options?: {Options}) => {value: 4.000000euros, needed: Array<keyof bParams>, missing: Array<keyof bParams>, trace: {Trace}}}
       */
      evaluate: (params = {}, options) =>
        $evaluate(_b, params, options),
      /** @type {4.000000euros} */
      type: '4.000000euros',
      /**
       * Parameter list for "b"
       * @type {Array<keyof bParams>}
       */
      params: [],
    }
  }
  export const parameters = {
  }
  export const outputs = {
    'a': rules['a'],
    'b': rules['b'],
  }
