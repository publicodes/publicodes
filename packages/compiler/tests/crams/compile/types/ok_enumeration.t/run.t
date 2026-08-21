Replacements should be correctly be inferred in enumerations:

  $ publicodes compile ./input/ -o - | ../../../scripts/get_rules.awk
  
  E024
  information de type manquante pour ce résultat [type warning]
       ╒══  ./input/rules.publicodes:31:1 ══
    30 │   public: oui
    31 │ c4: # type unknown
       │ ˘˘˘
   Hint: Spécifiez le type de la règle.
   Hint: Par exemple :
         
         c4:
           type: nombre
  const rules = {
    'a1': {
      /**
       * Parameters of "a1"
       * @typedef {{
       * }} a1Params
       */
      /**
       * Evaluate "a1" with evaluation trace, and information on
       * missing and needed parameters.
       * @type {(params?: a1Params, options?: {Options}) => {value: (10.000000|20.000000), needed: Array<keyof a1Params>, missing: Array<keyof a1Params>, trace: {Trace}}}
       */
      evaluate: (params = {}, options) =>
        $evaluate(_a1, params, options),
      /** @type {"number"} */
      type: "number",
      /** @type {"euros"} */
      unit: "euros",
      /**
       * Parameter list for "a1"
       * @type {Array<keyof a1Params>}
       */
      params: [],
    },
    'c1': {
      /**
       * Parameters of "c1"
       * @typedef {{
       * }} c1Params
       */
      /**
       * Evaluate "c1" with evaluation trace, and information on
       * missing and needed parameters.
       * @type {(params?: c1Params, options?: {Options}) => {value: 20.000000, needed: Array<keyof c1Params>, missing: Array<keyof c1Params>, trace: {Trace}}}
       */
      evaluate: (params = {}, options) =>
        $evaluate(_c1, params, options),
      /** @type {"number"} */
      type: "number",
      /** @type {"euros"} */
      unit: "euros",
      /**
       * Parameter list for "c1"
       * @type {Array<keyof c1Params>}
       */
      params: [],
    },
    'a2': {
      /**
       * Parameters of "a2"
       * @typedef {{
       * }} a2Params
       */
      /**
       * Evaluate "a2" with evaluation trace, and information on
       * missing and needed parameters.
       * @type {(params?: a2Params, options?: {Options}) => {value: (10.000000|20.000000|30.000000), needed: Array<keyof a2Params>, missing: Array<keyof a2Params>, trace: {Trace}}}
       */
      evaluate: (params = {}, options) =>
        $evaluate(_a2, params, options),
      /** @type {"number"} */
      type: "number",
      /** @type {"aucune"} */
      unit: "aucune",
      /**
       * Parameter list for "a2"
       * @type {Array<keyof a2Params>}
       */
      params: [],
    },
    'a3': {
      /**
       * Parameters of "a3"
       * @typedef {{
       * }} a3Params
       */
      /**
       * Evaluate "a3" with evaluation trace, and information on
       * missing and needed parameters.
       * @type {(params?: a3Params, options?: {Options}) => {value: (10.000000|20.000000), needed: Array<keyof a3Params>, missing: Array<keyof a3Params>, trace: {Trace}}}
       */
      evaluate: (params = {}, options) =>
        $evaluate(_a3, params, options),
      /** @type {"number"} */
      type: "number",
      /** @type {"aucune"} */
      unit: "aucune",
      /**
       * Parameter list for "a3"
       * @type {Array<keyof a3Params>}
       */
      params: [],
    },
    'a4': {
      /**
       * Parameters of "a4"
       * @typedef {{
       *  'c4'?: unknown
       * }} a4Params
       */
      /**
       * Evaluate "a4" with evaluation trace, and information on
       * missing and needed parameters.
       * @type {(params?: a4Params, options?: {Options}) => {value: "foo", needed: Array<keyof a4Params>, missing: Array<keyof a4Params>, trace: {Trace}}}
       */
      evaluate: (params = {}, options) =>
        $evaluate(_a4, params, options),
      /** @type {"text"} */
      type: "text",
      /**
       * Parameter list for "a4"
       * @type {Array<keyof a4Params>}
       */
      params: ['c4'],
    },
    'b4': {
      /**
       * Parameters of "b4"
       * @typedef {{
       *  'c4'?: unknown
       * }} b4Params
       */
      /**
       * Evaluate "b4" with evaluation trace, and information on
       * missing and needed parameters.
       * @type {(params?: b4Params, options?: {Options}) => {value: 42.000000, needed: Array<keyof b4Params>, missing: Array<keyof b4Params>, trace: {Trace}}}
       */
      evaluate: (params = {}, options) =>
        $evaluate(_b4, params, options),
      /** @type {"number"} */
      type: "number",
      /** @type {"aucune"} */
      unit: "aucune",
      /**
       * Parameter list for "b4"
       * @type {Array<keyof b4Params>}
       */
      params: ['c4'],
    },
    'inferred enum could be a subset of the explicit type': {
      /**
       * Parameters of "inferred enum could be a subset of the explicit type"
       * @typedef {{
       * }} inferred_enum_could_be_a_subset_of_the_explicit_typeParams
       */
      /**
       * Evaluate "inferred enum could be a subset of the explicit type" with evaluation trace, and information on
       * missing and needed parameters.
       * @type {(params?: inferred_enum_could_be_a_subset_of_the_explicit_typeParams, options?: {Options}) => {value: ('foo'|'bar'|'toot'), needed: Array<keyof inferred_enum_could_be_a_subset_of_the_explicit_typeParams>, missing: Array<keyof inferred_enum_could_be_a_subset_of_the_explicit_typeParams>, trace: {Trace}}}
       */
      evaluate: (params = {}, options) =>
        $evaluate(_inferred_enum_could_be_a_subset_of_the_explicit_type, params, options),
      /** @type {"symbol"} */
      type: "symbol",
      /**
       * Parameter list for "inferred enum could be a subset of the explicit type"
       * @type {Array<keyof inferred_enum_could_be_a_subset_of_the_explicit_typeParams>}
       */
      params: [],
    },
    'inferred enum from variation with context': {
      /**
       * Parameters of "inferred enum from variation with context"
       * @typedef {{
       * }} inferred_enum_from_variation_with_contextParams
       */
      /**
       * Evaluate "inferred enum from variation with context" with evaluation trace, and information on
       * missing and needed parameters.
       * @type {(params?: inferred_enum_from_variation_with_contextParams, options?: {Options}) => {value: ('foo'|'bar'|'too'|'zoo'|'tutu'), needed: Array<keyof inferred_enum_from_variation_with_contextParams>, missing: Array<keyof inferred_enum_from_variation_with_contextParams>, trace: {Trace}}}
       */
      evaluate: (params = {}, options) =>
        $evaluate(_inferred_enum_from_variation_with_context, params, options),
      /** @type {"symbol"} */
      type: "symbol",
      /**
       * Parameter list for "inferred enum from variation with context"
       * @type {Array<keyof inferred_enum_from_variation_with_contextParams>}
       */
      params: [],
    },
    'inferred enum from variation with context . enum': {
      /**
       * Parameters of "inferred enum from variation with context . enum"
       * @typedef {{
       *  'inferred enum from variation with context . enum'?: ('foo'|'bar'|'too'|'zoo'|'tutu'|'default')
       * }} inferred_enum_from_variation_with_context_·_enumParams
       */
      /**
       * Evaluate "inferred enum from variation with context . enum" with evaluation trace, and information on
       * missing and needed parameters.
       * @type {(params?: inferred_enum_from_variation_with_context_·_enumParams, options?: {Options}) => {value: ('foo'|'bar'|'too'|'zoo'|'tutu'|'default'), needed: Array<keyof inferred_enum_from_variation_with_context_·_enumParams>, missing: Array<keyof inferred_enum_from_variation_with_context_·_enumParams>, trace: {Trace}}}
       */
      evaluate: (params = {}, options) =>
        $evaluate(_inferred_enum_from_variation_with_context_·_enum, params, options),
      /** @type {"symbol"} */
      type: "symbol",
      /**
       * Parameter list for "inferred enum from variation with context . enum"
       * @type {Array<keyof inferred_enum_from_variation_with_context_·_enumParams>}
       */
      params: ['inferred enum from variation with context . enum'],
    },
    'c4': {
      /**
       * Parameters of "c4"
       * @typedef {{
       *  'c4'?: unknown
       * }} c4Params
       */
      /**
       * Evaluate "c4" with evaluation trace, and information on
       * missing and needed parameters.
       * @type {(params?: c4Params, options?: {Options}) => {value: unknown, needed: Array<keyof c4Params>, missing: Array<keyof c4Params>, trace: {Trace}}}
       */
      evaluate: (params = {}, options) =>
        $evaluate(_c4, params, options),
      /** @type {"unknown"} */
      type: "unknown",
      /**
       * Parameter list for "c4"
       * @type {Array<keyof c4Params>}
       */
      params: ['c4'],
    }
  }
  export const parameters = {
    'c4': rules['c4'],
  }
  export const outputs = {
    'a1': rules['a1'],
    'c1': rules['c1'],
    'a2': rules['a2'],
    'a3': rules['a3'],
    'a4': rules['a4'],
    'b4': rules['b4'],
    'inferred enum could be a subset of the explicit type': rules['inferred enum could be a subset of the explicit type'],
    'inferred enum from variation with context': rules['inferred enum from variation with context'],
    'inferred enum from variation with context . enum': rules['inferred enum from variation with context . enum'],
  }
