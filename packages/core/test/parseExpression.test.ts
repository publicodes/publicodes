import { describe, expect, it } from 'vitest'
import { parseExpression } from '../src/parseExpression'

describe('parseExpression', () => {
	it('should parse simple number', () => {
		expect(parseExpression('42')).toMatchInlineSnapshot(`
      {
        "constant": {
          "nodeValue": 42,
          "type": "number",
        },
      }
    `)
	})

	it('should parse simple addition', () => {
		expect(parseExpression('2 + 3')).toMatchInlineSnapshot(`
      {
        "+": [
          {
            "constant": {
              "nodeValue": 2,
              "type": "number",
            },
          },
          {
            "constant": {
              "nodeValue": 3,
              "type": "number",
            },
          },
        ],
      }
    `)
	})

	it('should handle precedence', () => {
		expect(parseExpression('2 + 3 * 4')).toMatchInlineSnapshot(`
      {
        "+": [
          {
            "constant": {
              "nodeValue": 2,
              "type": "number",
            },
          },
          {
            "*": [
              {
                "constant": {
                  "nodeValue": 3,
                  "type": "number",
                },
              },
              {
                "constant": {
                  "nodeValue": 4,
                  "type": "number",
                },
              },
            ],
          },
        ],
      }
    `)
	})

	it('should handle precedence with parenthesis', () => {
		expect(parseExpression('(2 + 3) * 4')).toMatchInlineSnapshot(`
      {
        "*": [
          {
            "+": [
              {
                "constant": {
                  "nodeValue": 2,
                  "type": "number",
                },
              },
              {
                "constant": {
                  "nodeValue": 3,
                  "type": "number",
                },
              },
            ],
          },
          {
            "constant": {
              "nodeValue": 4,
              "type": "number",
            },
          },
        ],
      }
    `)
	})

	it('should handle precedence with exponentiation', () => {
		expect(parseExpression('a / b ** 4')).toMatchInlineSnapshot(`
      {
        "/": [
          {
            "variable": "a",
          },
          {
            "**": [
              {
                "variable": "b",
              },
              {
                "constant": {
                  "nodeValue": 4,
                  "type": "number",
                },
              },
            ],
          },
        ],
      }
    `)
	})

	it.skip('should handle precedence in complexe expression', () => {
		expect(parseExpression('a + b * c + d > e ** 4 / 2'))
			.toMatchInlineSnapshot(`
      {
        ">": [
          {
            "+": [
              {
                "+": [
                  {
                    "variable": "a",
                  },
                  {
                    "*": [
                      {
                        "variable": "b",
                      },
                      {
                        "variable": "c",
                      },
                    ],
                  },
                ],
              },
              {
                "variable": "d",
              },
            ],
          },
          {
            "/": [
              {
                "**": [
                  {
                    "variable": "e",
                  },
                  {
                    "constant": {
                      "nodeValue": 4,
                      "type": "number",
                    },
                  },
                ],
              },
              {
                "constant": {
                  "nodeValue": 2,
                  "type": "number",
                },
              },
            ],
          },
        ],
      }
    `)
	})

	it('should parse variable references', () => {
		expect(parseExpression('salary')).toMatchInlineSnapshot(`
      {
        "variable": "salary",
      }
    `)
	})

	it('should parse dotted names', () => {
		expect(
			parseExpression('artiste-auteur . cotisations . CSG-CRDS . assiette'),
		).toMatchInlineSnapshot(`
      {
        "variable": "artiste-auteur . cotisations . CSG-CRDS . assiette",
      }
    `)
	})

	it('should parse parent symbol in dottedname', () => {
		expect(parseExpression('^ . cotisations . CSG-CRDS . assiette'))
			.toMatchInlineSnapshot(`
      {
        "variable": "^ . cotisations . CSG-CRDS . assiette",
      }
    `)
	})

	it('should parse boolean values', () => {
		expect(parseExpression('oui')).toMatchInlineSnapshot(`
      {
        "constant": {
          "nodeValue": true,
          "type": "boolean",
        },
      }
    `)
		expect(parseExpression('non')).toMatchInlineSnapshot(`
      {
        "constant": {
          "nodeValue": false,
          "type": "boolean",
        },
      }
    `)
	})

	it('should parse strings', () => {
		expect(parseExpression("'hello'")).toMatchInlineSnapshot(`
      {
        "constant": {
          "nodeValue": "hello",
          "type": "string",
        },
      }
    `)
	})

	it('should parse strings with double quotes', () => {
		expect(parseExpression('"hello"')).toMatchInlineSnapshot(`
      {
        "constant": {
          "nodeValue": "hello",
          "type": "string",
        },
      }
    `)
	})

	it('should parse strings in a greedy way (v2 breaking ?)', () => {
		expect(parseExpression("'hello' = 'hola'")).toMatchInlineSnapshot(`
      {
        "constant": {
          "nodeValue": "hello' = 'hola",
          "type": "string",
        },
      }
    `)
	})

	it('should parse numbers with units', () => {
		expect(parseExpression('42 €')).toMatchInlineSnapshot(`
			{
			  "constant": {
			    "nodeValue": 42,
			    "rawUnit": "€",
			    "type": "number",
			  },
			}
		`)
	})

	it('should parse numbers with units without spaces', () => {
		expect(parseExpression('42% /an')).toMatchInlineSnapshot(`
      {
        "constant": {
          "nodeValue": 42,
          "rawUnit": "% /an",
          "type": "number",
        },
      }
    `)
	})

	it('should parse complex expressions', () => {
		expect(parseExpression('2 * (3 + 4)')).toMatchInlineSnapshot(`
      {
        "*": [
          {
            "constant": {
              "nodeValue": 2,
              "type": "number",
            },
          },
          {
            "+": [
              {
                "constant": {
                  "nodeValue": 3,
                  "type": "number",
                },
              },
              {
                "constant": {
                  "nodeValue": 4,
                  "type": "number",
                },
              },
            ],
          },
        ],
      }
    `)
	})

	it('should parse expressions with unary minus in parenthesis', () => {
		expect(parseExpression('(-1) * a')).toMatchInlineSnapshot(`
			{
			  "*": [
			    {
			      "-": [
			        {
			          "constant": {
			            "nodeValue": 0,
			            "type": "number",
			          },
			        },
			        {
			          "constant": {
			            "nodeValue": 1,
			            "type": "number",
			          },
			        },
			      ],
			    },
			    {
			      "variable": "a",
			    },
			  ],
			}
		`)
	})

	it('should parse comparisons', () => {
		expect(parseExpression('42 > 41')).toMatchInlineSnapshot(`
      {
        ">": [
          {
            "constant": {
              "nodeValue": 42,
              "type": "number",
            },
          },
          {
            "constant": {
              "nodeValue": 41,
              "type": "number",
            },
          },
        ],
      }
    `)
	})

	it('should parse dates', () => {
		expect(parseExpression('12/2024')).toMatchInlineSnapshot(`
      {
        "constant": {
          "nodeValue": "12/2024",
          "type": "date",
        },
      }
    `)
	})

	it('should parse unary minus', () => {
		expect(parseExpression('-42')).toMatchInlineSnapshot(`
			{
			  "-": [
			    {
			      "constant": {
			        "nodeValue": 0,
			        "type": "number",
			      },
			    },
			    {
			      "constant": {
			        "nodeValue": 42,
			        "type": "number",
			      },
			    },
			  ],
			}
		`)
	})

	it('should parse unary minus with spaces and reference', () => {
		expect(parseExpression('- salaire . net')).toMatchInlineSnapshot(`
			{
			  "-": [
			    {
			      "constant": {
			        "nodeValue": 0,
			        "type": "number",
			      },
			    },
			    {
			      "variable": "salaire . net",
			    },
			  ],
			}
		`)
	})
})
