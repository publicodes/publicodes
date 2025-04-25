import { describe, test, expect, vi } from 'vitest'
import { evaluate } from './evaluate'
import { BinaryOp, CompiledPublicodes, Computation } from './types'

describe('evaluate', () => {
  test('should evaluate string references', () => {
    const compiledPublicodes: CompiledPublicodes = {
      a: [42],
    }
    const value: Computation = 'a'

    expect(evaluate(compiledPublicodes, value)).toBe(42)
  })

  test('should return null for null computations', () => {
    const compiledPublicodes: CompiledPublicodes = {}
    const value: Computation = null

    expect(evaluate(compiledPublicodes, value)).toBe(null)
  })

  test('should return undefined for empty arrays', () => {
    const compiledPublicodes: CompiledPublicodes = {}
    const value: Computation = []

    expect(evaluate(compiledPublicodes, value)).toBe(undefined)
  })

  test('should return the first element for single-element arrays', () => {
    const compiledPublicodes: CompiledPublicodes = {}

    expect(evaluate(compiledPublicodes, [42])).toBe(42)

    expect(evaluate(compiledPublicodes, ['hello'])).toBe('hello')
  })

  describe('Unary operations', () => {
    test('should handle unary negation operator', () => {
      const compiledPublicodes: CompiledPublicodes = {}

      expect(evaluate(compiledPublicodes, ['-', [5]])).toBe(-5)

      const withReference: CompiledPublicodes = {
        a: [10],
      }
      expect(evaluate(withReference, ['-', 'a'])).toBe(-10)
    })

    test('should handle nested operations', () => {
      const compiledPublicodes: CompiledPublicodes = {
        a: [5],
        b: ['-', 'a'],
      }

      expect(evaluate(compiledPublicodes, 'b')).toBe(-5)
    })

    test('should handle non-number values in unary operations', () => {
      const compiledPublicodes: CompiledPublicodes = {
        a: null,
        b: [],
      }

      // These should return the non-number value as is
      expect(evaluate(compiledPublicodes, ['-', 'a'])).toBe(null)
      expect(evaluate(compiledPublicodes, ['-', 'b'])).toBe(undefined)
    })
  })

  describe('Binary operations', () => {
    test('should handle all arithmetic operator', () => {
      expect(evaluate({}, [[6], '+', [3]])).toBe(9)
      expect(evaluate({}, [[6], '-', [3]])).toBe(3)
      expect(evaluate({}, [[6], '*', [3]])).toBe(18)
      expect(evaluate({}, [[6], '/', [3]])).toBeCloseTo(2)
      expect(evaluate({}, [[6], '**', [3]])).toBe(216)
    })

    test('should handle all comparison operator', () => {
      expect(evaluate({}, [[6], '<', [3]])).toBe(false)
      expect(evaluate({}, [[6], '<=', [3]])).toBe(false)
      expect(evaluate({}, [[6], '<=', [6]])).toBe(true)

      expect(evaluate({}, [[6], '>', [3]])).toBe(true)
      expect(evaluate({}, [[6], '>=', [3]])).toBe(true)
      expect(evaluate({}, [[6], '>=', [6]])).toBe(true)

      expect(evaluate({}, [[6], '=', [3]])).toBe(false)
    })

    test('should handle all logical operator', () => {
      expect(evaluate({}, [true, '&&', true])).toBe(true)
      expect(evaluate({}, [false, '||', false])).toBe(false)
      expect(evaluate({}, [false, '&&', true])).toBe(false)
      expect(evaluate({}, [true, '||', false])).toBe(true)
    })

    const throwIfAccessed = {
      get a() {
        throw new Error('Unexpected evaluation')
      },
    } as unknown as CompiledPublicodes

    test('[multiplicative|comparison] should not evaluate the second operand when first operand is null', () => {
      const operators: BinaryOp[] = [
        '*',
        '/',
        '**',
        '=',
        '!=',
        '<',
        '<=',
        '>',
        '>=',
        '&&',
      ]

      operators.forEach((op) => {
        const run = () => evaluate(throwIfAccessed, [null, op, 'a'])
        expect(run).not.toThrow()
        expect(run()).toBe(null)
      })
    })

    test('[*|/|**] should not evaluate the second operand when first operand is 0', () => {
      const operators: BinaryOp[] = ['*', '/', '**']

      operators.forEach((op) => {
        const run = () => evaluate(throwIfAccessed, [[0], op, 'a'])
        expect(run).not.toThrow()
        expect(run()).toBe(0)
      })
    })

    test('&& should not evaluate the second operand when first operand is false', () => {
      const run = () => evaluate(throwIfAccessed, [false, '&&', 'a'])
      expect(run).not.toThrow()
      expect(run()).toBe(false)
    })

    test('|| should not evaluate the second operand when first operand is true', () => {
      const run = () => evaluate(throwIfAccessed, [true, '||', 'a'])
      expect(run).not.toThrow()
      expect(run()).toBe(true)
    })

    test('should return undefined if one operand is undefined', () => {
      const operators: BinaryOp[] = [
        '+',
        '-',
        '*',
        '/',
        '**',
        '=',
        '!=',
        '<',
        '<=',
        '>',
        '>=',
        '&&',
        '||',
      ] as BinaryOp[]
      operators.forEach((op) => {
        expect(evaluate({}, [[], op, [10]])).toBe(undefined)
      })
    })

    test('should not return undefined if we can deduce the result from the second operand', () => {
      expect(evaluate({}, [[], '&&', false])).toBe(false)
      expect(evaluate({}, [[], '||', true])).toBe(true)
      expect(evaluate({}, [[], '*', [0]])).toBe(0)
      expect(evaluate({}, [[], '**', [0]])).toBe(1)
      expect(() => evaluate({}, [[], '/', [0]])).toThrow('Division by zero')
    })

    // test('should handle non-number values in binary operations', () => {
    //   const compiledPublicodes: CompiledPublicodes = {
    //     a: null,
    //     b: [],
    //   }

    //   // These should return the non-number value as is
    //   expect(evaluate(compiledPublicodes, ['+', 'a', [3]])).toBe(null)
    //   expect(evaluate(compiledPublicodes, ['b', '-', [5]])).toBe(undefined)
    // })
  })
  describe('if-then-else', () => {
    describe('Conditional selection (ternary)', () => {
      test('should return null if condition is null', () => {
        const compiledPublicodes: CompiledPublicodes = {
          condition: null,
          thenBranch: [42],
          elseBranch: [24],
        }

        const value: Computation = {
          if: 'condition',
          then: 'thenBranch',
          else: 'elseBranch',
        }

        expect(evaluate(compiledPublicodes, value)).toBe(null)
      })

      test('should evaluate and return then branch if condition is true', () => {
        const compiledPublicodes: CompiledPublicodes = {
          condition: true,
          thenBranch: [42],
          elseBranch: [24],
        }

        const value: Computation = {
          if: 'condition',
          then: 'thenBranch',
          else: 'elseBranch',
        }

        expect(evaluate(compiledPublicodes, value)).toBe(42)
      })

      test('should evaluate and return else branch if condition is false', () => {
        const compiledPublicodes: CompiledPublicodes = {
          condition: false,
          thenBranch: [42],
          elseBranch: [24],
        }

        const value: Computation = {
          if: 'condition',
          then: 'thenBranch',
          else: 'elseBranch',
        }

        expect(evaluate(compiledPublicodes, value)).toBe(24)
      })

      test('should handle nested conditionals', () => {
        const compiledPublicodes: CompiledPublicodes = {
          outerCondition: true,
          innerCondition: false,
          value1: [1],
          value2: [2],
          value3: [3],

          inner: {
            if: 'innerCondition',
            then: 'value2',
            else: 'value3',
          },
        }

        const value: Computation = {
          if: 'outerCondition',
          then: 'value1',
          else: 'inner',
        }

        expect(evaluate(compiledPublicodes, value)).toBe(1)

        // Change outer condition to test nested evaluation
        compiledPublicodes.outerCondition = false
        expect(evaluate(compiledPublicodes, value)).toBe(3)
      })
    })
  })
  describe('date', () => {
    test('should evaluate date expressions', () => {
      expect(evaluate({}, { d: '2022-01-01' })).toEqual(
        new Date('2022-01-01').valueOf(),
      )
      expect(evaluate({}, { d: '2025-11' })).toEqual(
        new Date('2025-11-01').valueOf(),
      )
    })
    test('should allow date comparison', () => {
      expect(
        evaluate({}, [{ d: '2022-01-01' }, '<=', { d: '2022-01' }]),
      ).toEqual(true)
      expect(
        evaluate({}, [{ d: '2022-01-01' }, '<', { d: '2022-01-02' }]),
      ).toEqual(true)
      expect(
        evaluate({}, [{ d: '2022-01-02' }, '>', { d: '2022-01-01' }]),
      ).toEqual(true)
      expect(
        evaluate({}, [{ d: '2022-01-01' }, '>=', { d: '2022-01-01' }]),
      ).toEqual(true)
      expect(
        evaluate({}, [{ d: '2022-01-01' }, '=', { d: '2022-01-01' }]),
      ).toEqual(true)
      expect(
        evaluate({}, [{ d: '2022-01-01' }, '!=', { d: '2022-01-02' }]),
      ).toEqual(true)

      expect(
        evaluate({}, [{ d: '2022-01-02' }, '<', { d: '2022-01-01' }]),
      ).toEqual(false)
      expect(
        evaluate({}, [{ d: '2022-01-01' }, '>', { d: '2022-01-02' }]),
      ).toEqual(false)
      expect(
        evaluate({}, [{ d: '2022-01-02' }, '=', { d: '2022-01-01' }]),
      ).toEqual(false)
    })
  })
})
