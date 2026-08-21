Should generalize the least precise side:

  $ publicodes compile ./input/ -o - | ../../../scripts/get_rules.awk
  const rules = {
    'inferred from comparison . number with unit': {
      /**
       * Parameters of "inferred from comparison . number with unit"
       * @typedef {{
       *  'inferred from comparison . number with unit'?: number
       * }} inferred_from_comparison_·_number_with_unitParams
       */
      /**
       * Evaluate "inferred from comparison . number with unit" with evaluation trace, and information on
       * missing and needed parameters.
       * @type {(params?: inferred_from_comparison_·_number_with_unitParams, options?: {Options}) => {value: number, needed: Array<keyof inferred_from_comparison_·_number_with_unitParams>, missing: Array<keyof inferred_from_comparison_·_number_with_unitParams>, trace: {Trace}}}
       */
      evaluate: (params = {}, options) =>
        $evaluate(_inferred_from_comparison_·_number_with_unit, params, options),
      /** @type {"number"} */
      type: "number",
      /** @type {"euros"} */
      unit: "euros",
      /**
       * Parameter list for "inferred from comparison . number with unit"
       * @type {Array<keyof inferred_from_comparison_·_number_with_unitParams>}
       */
      params: ['inferred from comparison . number with unit'],
    },
    'inferred from comparison . boolean': {
      /**
       * Parameters of "inferred from comparison . boolean"
       * @typedef {{
       *  'inferred from comparison . boolean'?: boolean
       * }} inferred_from_comparison_·_booleanParams
       */
      /**
       * Evaluate "inferred from comparison . boolean" with evaluation trace, and information on
       * missing and needed parameters.
       * @type {(params?: inferred_from_comparison_·_booleanParams, options?: {Options}) => {value: boolean, needed: Array<keyof inferred_from_comparison_·_booleanParams>, missing: Array<keyof inferred_from_comparison_·_booleanParams>, trace: {Trace}}}
       */
      evaluate: (params = {}, options) =>
        $evaluate(_inferred_from_comparison_·_boolean, params, options),
      /** @type {"boolean"} */
      type: "boolean",
      /**
       * Parameter list for "inferred from comparison . boolean"
       * @type {Array<keyof inferred_from_comparison_·_booleanParams>}
       */
      params: ['inferred from comparison . boolean'],
    },
    'inferred from comparison . texte': {
      /**
       * Parameters of "inferred from comparison . texte"
       * @typedef {{
       *  'inferred from comparison . texte'?: text
       * }} inferred_from_comparison_·_texteParams
       */
      /**
       * Evaluate "inferred from comparison . texte" with evaluation trace, and information on
       * missing and needed parameters.
       * @type {(params?: inferred_from_comparison_·_texteParams, options?: {Options}) => {value: text, needed: Array<keyof inferred_from_comparison_·_texteParams>, missing: Array<keyof inferred_from_comparison_·_texteParams>, trace: {Trace}}}
       */
      evaluate: (params = {}, options) =>
        $evaluate(_inferred_from_comparison_·_texte, params, options),
      /** @type {"text"} */
      type: "text",
      /**
       * Parameter list for "inferred from comparison . texte"
       * @type {Array<keyof inferred_from_comparison_·_texteParams>}
       */
      params: ['inferred from comparison . texte'],
    },
    'inferred from comparison . enum': {
      /**
       * Parameters of "inferred from comparison . enum"
       * @typedef {{
       *  'inferred from comparison . enum'?: ('toto'|'tutu')
       * }} inferred_from_comparison_·_enumParams
       */
      /**
       * Evaluate "inferred from comparison . enum" with evaluation trace, and information on
       * missing and needed parameters.
       * @type {(params?: inferred_from_comparison_·_enumParams, options?: {Options}) => {value: ('toto'|'tutu'), needed: Array<keyof inferred_from_comparison_·_enumParams>, missing: Array<keyof inferred_from_comparison_·_enumParams>, trace: {Trace}}}
       */
      evaluate: (params = {}, options) =>
        $evaluate(_inferred_from_comparison_·_enum, params, options),
      /** @type {"symbol"} */
      type: "symbol",
      /**
       * Parameter list for "inferred from comparison . enum"
       * @type {Array<keyof inferred_from_comparison_·_enumParams>}
       */
      params: ['inferred from comparison . enum'],
    },
    'inferred from comparison . date': {
      /**
       * Parameters of "inferred from comparison . date"
       * @typedef {{
       *  'inferred from comparison . date'?: date
       * }} inferred_from_comparison_·_dateParams
       */
      /**
       * Evaluate "inferred from comparison . date" with evaluation trace, and information on
       * missing and needed parameters.
       * @type {(params?: inferred_from_comparison_·_dateParams, options?: {Options}) => {value: date, needed: Array<keyof inferred_from_comparison_·_dateParams>, missing: Array<keyof inferred_from_comparison_·_dateParams>, trace: {Trace}}}
       */
      evaluate: (params = {}, options) =>
        $evaluate(_inferred_from_comparison_·_date, params, options),
      /** @type {"date"} */
      type: "date",
      /**
       * Parameter list for "inferred from comparison . date"
       * @type {Array<keyof inferred_from_comparison_·_dateParams>}
       */
      params: ['inferred from comparison . date'],
    },
    'inferred from comparison . enum 2': {
      /**
       * Parameters of "inferred from comparison . enum 2"
       * @typedef {{
       *  'inferred from comparison . enum 2'?: ('foo'|'bar')
       * }} inferred_from_comparison_·_enum_2Params
       */
      /**
       * Evaluate "inferred from comparison . enum 2" with evaluation trace, and information on
       * missing and needed parameters.
       * @type {(params?: inferred_from_comparison_·_enum_2Params, options?: {Options}) => {value: ('foo'|'bar'), needed: Array<keyof inferred_from_comparison_·_enum_2Params>, missing: Array<keyof inferred_from_comparison_·_enum_2Params>, trace: {Trace}}}
       */
      evaluate: (params = {}, options) =>
        $evaluate(_inferred_from_comparison_·_enum_2, params, options),
      /** @type {"symbol"} */
      type: "symbol",
      /**
       * Parameter list for "inferred from comparison . enum 2"
       * @type {Array<keyof inferred_from_comparison_·_enum_2Params>}
       */
      params: ['inferred from comparison . enum 2'],
    },
    'generalize to number . sum': {
      /**
       * Parameters of "generalize to number . sum"
       * @typedef {{
       * }} generalize_to_number_·_sumParams
       */
      /**
       * Evaluate "generalize to number . sum" with evaluation trace, and information on
       * missing and needed parameters.
       * @type {(params?: generalize_to_number_·_sumParams, options?: {Options}) => {value: number, needed: Array<keyof generalize_to_number_·_sumParams>, missing: Array<keyof generalize_to_number_·_sumParams>, trace: {Trace}}}
       */
      evaluate: (params = {}, options) =>
        $evaluate(_generalize_to_number_·_sum, params, options),
      /** @type {"number"} */
      type: "number",
      /** @type {"l"} */
      unit: "l",
      /**
       * Parameter list for "generalize to number . sum"
       * @type {Array<keyof generalize_to_number_·_sumParams>}
       */
      params: [],
    },
    'generalize to number . addition': {
      /**
       * Parameters of "generalize to number . addition"
       * @typedef {{
       * }} generalize_to_number_·_additionParams
       */
      /**
       * Evaluate "generalize to number . addition" with evaluation trace, and information on
       * missing and needed parameters.
       * @type {(params?: generalize_to_number_·_additionParams, options?: {Options}) => {value: number, needed: Array<keyof generalize_to_number_·_additionParams>, missing: Array<keyof generalize_to_number_·_additionParams>, trace: {Trace}}}
       */
      evaluate: (params = {}, options) =>
        $evaluate(_generalize_to_number_·_addition, params, options),
      /** @type {"number"} */
      type: "number",
      /** @type {"l"} */
      unit: "l",
      /**
       * Parameter list for "generalize to number . addition"
       * @type {Array<keyof generalize_to_number_·_additionParams>}
       */
      params: [],
    },
    'generalize to number . product': {
      /**
       * Parameters of "generalize to number . product"
       * @typedef {{
       * }} generalize_to_number_·_productParams
       */
      /**
       * Evaluate "generalize to number . product" with evaluation trace, and information on
       * missing and needed parameters.
       * @type {(params?: generalize_to_number_·_productParams, options?: {Options}) => {value: number, needed: Array<keyof generalize_to_number_·_productParams>, missing: Array<keyof generalize_to_number_·_productParams>, trace: {Trace}}}
       */
      evaluate: (params = {}, options) =>
        $evaluate(_generalize_to_number_·_product, params, options),
      /** @type {"number"} */
      type: "number",
      /** @type {"l^3"} */
      unit: "l^3",
      /**
       * Parameter list for "generalize to number . product"
       * @type {Array<keyof generalize_to_number_·_productParams>}
       */
      params: [],
    },
    'generalize to number . max of': {
      /**
       * Parameters of "generalize to number . max of"
       * @typedef {{
       * }} generalize_to_number_·_max_ofParams
       */
      /**
       * Evaluate "generalize to number . max of" with evaluation trace, and information on
       * missing and needed parameters.
       * @type {(params?: generalize_to_number_·_max_ofParams, options?: {Options}) => {value: number, needed: Array<keyof generalize_to_number_·_max_ofParams>, missing: Array<keyof generalize_to_number_·_max_ofParams>, trace: {Trace}}}
       */
      evaluate: (params = {}, options) =>
        $evaluate(_generalize_to_number_·_max_of, params, options),
      /** @type {"number"} */
      type: "number",
      /** @type {"aucune"} */
      unit: "aucune",
      /**
       * Parameter list for "generalize to number . max of"
       * @type {Array<keyof generalize_to_number_·_max_ofParams>}
       */
      params: [],
    },
    'generalize to number . power with unit': {
      /**
       * Parameters of "generalize to number . power with unit"
       * @typedef {{
       * }} generalize_to_number_·_power_with_unitParams
       */
      /**
       * Evaluate "generalize to number . power with unit" with evaluation trace, and information on
       * missing and needed parameters.
       * @type {(params?: generalize_to_number_·_power_with_unitParams, options?: {Options}) => {value: number, needed: Array<keyof generalize_to_number_·_power_with_unitParams>, missing: Array<keyof generalize_to_number_·_power_with_unitParams>, trace: {Trace}}}
       */
      evaluate: (params = {}, options) =>
        $evaluate(_generalize_to_number_·_power_with_unit, params, options),
      /** @type {"number"} */
      type: "number",
      /** @type {"aucune"} */
      unit: "aucune",
      /**
       * Parameter list for "generalize to number . power with unit"
       * @type {Array<keyof generalize_to_number_·_power_with_unitParams>}
       */
      params: [],
    }
  }
  export const parameters = {
  }
  export const outputs = {
    'inferred from comparison . number with unit': rules['inferred from comparison . number with unit'],
    'inferred from comparison . boolean': rules['inferred from comparison . boolean'],
    'inferred from comparison . texte': rules['inferred from comparison . texte'],
    'inferred from comparison . enum': rules['inferred from comparison . enum'],
    'inferred from comparison . date': rules['inferred from comparison . date'],
    'inferred from comparison . enum 2': rules['inferred from comparison . enum 2'],
    'generalize to number . sum': rules['generalize to number . sum'],
    'generalize to number . addition': rules['generalize to number . addition'],
    'generalize to number . product': rules['generalize to number . product'],
    'generalize to number . max of': rules['generalize to number . max of'],
    'generalize to number . power with unit': rules['generalize to number . power with unit'],
  }

