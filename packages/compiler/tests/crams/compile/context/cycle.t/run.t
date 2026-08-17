Valid :

  $ publicodes compile input -o - | ../../../scripts/get_rules.awk
  const rules = {
    'out': {
      /**
       * Parameters of "out"
       * @typedef {{
       *  'c'?: number
       * }} outParams
       */
      /**
       * Evaluate "out" with evaluation trace, and information on
       * missing and needed parameters.
       * @type {(params?: outParams, options?: {Options}) => {value: number, needed: Array<keyof outParams>, missing: Array<keyof outParams>, trace: {Trace}}}
       */
      evaluate: (params = {}, options) =>
        $evaluate(_out, params, options),
      /** @type {"number"} */
      type: "number",
      /** @type {"aucune"} */
      unit: "aucune",
      /**
       * Parameter list for "out"
       * @type {Array<keyof outParams>}
       */
      params: ['c'],
    },
    'c': {
      /**
       * Parameters of "c"
       * @typedef {{
       * }} cParams
       */
      /**
       * Evaluate "c" with evaluation trace, and information on
       * missing and needed parameters.
       * @type {(params?: cParams, options?: {Options}) => {value: number, needed: Array<keyof cParams>, missing: Array<keyof cParams>, trace: {Trace}}}
       */
      evaluate: (params = {}, options) =>
        $evaluate(_c, params, options),
      /** @type {"number"} */
      type: "number",
      /** @type {"aucune"} */
      unit: "aucune",
      /**
       * Parameter list for "c"
       * @type {Array<keyof cParams>}
       */
      params: [],
    }
  }
  export const parameters = {
    'c': rules['c'],
  }
  export const outputs = {
    'out': rules['out'],
  }
