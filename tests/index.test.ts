import { expectTypeOf } from 'expect-type'
import { v4 as uuid } from 'uuid'
import { describe, expect, test } from 'vitest'

import {
  baseCellTypes,
  createSheetFunction,
  defineCellType
} from '../src/index.mjs'

describe('sheet', () => {
  type MyCellType = `my-cell-type${string}`
  const myCellType = defineCellType<MyCellType>(
    uuid(),
    'myCell',
    'my-cell-type',
    (value):
    value is MyCellType => typeof value === 'string' &&
      value.startsWith('my-cell-type')
  )

  test('define cell type', () => {
    expect(myCellType.is(baseCellTypes.string)).eq(false)

    type MyAnotherCellType = `my-another-cell-type${string}`
    const siblingType = defineCellType(
      uuid(),
      'siblingType',
      'my-another-cell-type',
      (value): value is MyAnotherCellType => typeof value === 'string' &&
        value.startsWith('my-another-cell-type'),
      baseCellTypes.string
    )
    expect(siblingType.is(baseCellTypes.string)).eq(true)
    expect(siblingType.is(myCellType)).eq(false)
    expect(myCellType.is(siblingType)).eq(false)

    const sonType = defineCellType<MyCellType>(
      uuid(),
      'sonType',
      'my-cell-type',
      (value):
      value is MyCellType => typeof value === 'string' &&
        value.startsWith('my-cell-type'),
      myCellType
    )
    expect(sonType.is(myCellType)).eq(true)
    expect(myCellType.is(sonType)).eq(false)

    const grandsonType = defineCellType<MyCellType>(
      uuid(),
      'grandson',
      'my-cell-type',
      (value):
      value is MyCellType => typeof value === 'string' &&
        value.startsWith('my-cell-type'),
      sonType
    )
    expect(grandsonType.is(myCellType)).eq(true)
    expect(grandsonType.is(sonType)).eq(true)
    expect(sonType.is(grandsonType)).eq(false)

    expect(() => {
      defineCellType(
        uuid(),
        'foo',
        '',
        (value): value is string => false,
        {
          id: uuid(),
          displayName: 'bar',
          defaultValue: '',
          validate: (value): value is string => false,
          is: () => false
        }
      )
    }).toThrowErrorMatchingInlineSnapshot(
      '"\'extended\' is not an instance of \'AbstractCellType\'"')
  })

  test('define map function', () => {
    const fn = createSheetFunction(
      'to-lowercase',
      'To LowerCase',
      'map',
      {
        input: {
          type: baseCellTypes.string,
          name: 'input column'
        },
        foo: {
          type: myCellType,
          name: 'goo'
        }
      },
      {
        output: {
          type: baseCellTypes.string,
          name: 'output column'
        }
      },
      { /* no config */ },
      async (columns) => {
        expectTypeOf(columns.foo).not.toEqualTypeOf<string[]>()
        expectTypeOf(columns.foo).toEqualTypeOf<MyCellType[]>()
        expectTypeOf(columns.input).toEqualTypeOf<string[]>()
        return {
          output: columns.input.map(item => item.toUpperCase())
        }
      },
      undefined,
      undefined
    )
    expect(fn.inputs.input.type).toBe(baseCellTypes.string)
    expect(fn.outputs.output.type).toBe(baseCellTypes.string)
  })

  test('define reduce function', () => {
    const fn = createSheetFunction(
      'sum',
      'Sum',
      'reduce',
      {
        type: baseCellTypes.number,
        name: 'input column'
      },
      {
        type: baseCellTypes.number,
        name: 'output'
      },
      {/* no config */ },
      async (numbers) => {
        return numbers.reduce((p, x) => p + x)
      }
    )
    expect(fn.input.type).toBe(baseCellTypes.number)
    expect(fn.output.type).toBe(baseCellTypes.number)
  })
})
