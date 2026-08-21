The type def should have priority over the inferred types:

  $ publicodes compile ./input/ -o - | ../../../scripts/get_rules.awk
  const rules = {
    'simple value': {
      /**
       * Parameters of "simple value"
       * @typedef {{
       * }} simple_valueParams
       */
      /**
       * Evaluate "simple value" with evaluation trace, and information on
       * missing and needed parameters.
       * @type {(params?: simple_valueParams, options?: {Options}) => {value: ('foo'|'toot'), needed: Array<keyof simple_valueParams>, missing: Array<keyof simple_valueParams>, trace: {Trace}}}
       */
      evaluate: (params = {}, options) =>
        $evaluate(_simple_value, params, options),
      /** @type {"symbol"} */
      type: "symbol",
      /**
       * Parameter list for "simple value"
       * @type {Array<keyof simple_valueParams>}
       */
      params: [],
    },
    'infered enum': {
      /**
       * Parameters of "infered enum"
       * @typedef {{
       * }} infered_enumParams
       */
      /**
       * Evaluate "infered enum" with evaluation trace, and information on
       * missing and needed parameters.
       * @type {(params?: infered_enumParams, options?: {Options}) => {value: ('foo'|'toot'), needed: Array<keyof infered_enumParams>, missing: Array<keyof infered_enumParams>, trace: {Trace}}}
       */
      evaluate: (params = {}, options) =>
        $evaluate(_infered_enum, params, options),
      /** @type {"symbol"} */
      type: "symbol",
      /**
       * Parameter list for "infered enum"
       * @type {Array<keyof infered_enumParams>}
       */
      params: [],
    },
    'default value': {
      /**
       * Parameters of "default value"
       * @typedef {{
       *  'default value'?: ('foo'|'toot')
       * }} default_valueParams
       */
      /**
       * Evaluate "default value" with evaluation trace, and information on
       * missing and needed parameters.
       * @type {(params?: default_valueParams, options?: {Options}) => {value: ('foo'|'toot'), needed: Array<keyof default_valueParams>, missing: Array<keyof default_valueParams>, trace: {Trace}}}
       */
      evaluate: (params = {}, options) =>
        $evaluate(_default_value, params, options),
      /** @type {"symbol"} */
      type: "symbol",
      /**
       * Parameter list for "default value"
       * @type {Array<keyof default_valueParams>}
       */
      params: ['default value'],
    },
    'with replacement': {
      /**
       * Parameters of "with replacement"
       * @typedef {{
       * }} with_replacementParams
       */
      /**
       * Evaluate "with replacement" with evaluation trace, and information on
       * missing and needed parameters.
       * @type {(params?: with_replacementParams, options?: {Options}) => {value: ('foo'|'bar'|'toot'), needed: Array<keyof with_replacementParams>, missing: Array<keyof with_replacementParams>, trace: {Trace}}}
       */
      evaluate: (params = {}, options) =>
        $evaluate(_with_replacement, params, options),
      /** @type {"symbol"} */
      type: "symbol",
      /**
       * Parameter list for "with replacement"
       * @type {Array<keyof with_replacementParams>}
       */
      params: [],
    }
  }
  export const parameters = {
  }
  export const outputs = {
    'simple value': rules['simple value'],
    'infered enum': rules['infered enum'],
    'default value': rules['default value'],
    'with replacement': rules['with replacement'],
  }
