import type { FC } from 'react'

export abstract class AbstractCellType<Value = unknown> {
  public readonly abstract id: string
  public readonly abstract displayName: string
  public readonly abstract defaultValue: Value

  public abstract validate: (value: unknown) => value is Value

  public is<Type extends AbstractCellType> (t: Type): this is Type {
    return this instanceof t.constructor
  }
}

export class NumberCellType extends AbstractCellType<number> {
  id = '21112007-716a-4c28-80f3-a058aea50a0b'
  displayName = 'number'
  defaultValue = 0
  validate = (value: unknown): value is number => typeof value === 'number'
}

export class StringCellType extends AbstractCellType<string> {
  id = '00bfb075-9d08-4ab6-ba2d-f7bcccdb09b0'
  displayName = 'string'
  defaultValue = ''
  validate = (value: unknown): value is string => typeof value === 'string'
}

export class ObjectCellType extends AbstractCellType<Record<string, unknown>> {
  id = 'e01e830e-8dd5-4c2e-a8eb-dc3945d8c001'
  // name in `python`
  displayName = 'dict'
  defaultValue = {}
  validate = (value: unknown): value is Record<string, unknown> => typeof value ===
    'object'
}

export class BooleanCellType extends AbstractCellType<boolean> {
  id = '1b692f8e-6f4d-4708-bf04-e624e7101a3d'
  displayName = 'boolean'
  defaultValue = false
  validate = (value: unknown): value is boolean => typeof value === 'boolean'
}

export class ArrayCellType extends AbstractCellType<unknown[]> {
  id = '6f84aa0b-aa88-48e3-96f8-c19f00f60ee0'
  displayName = 'array'
  defaultValue = []
  validate = (value: unknown): value is unknown[] => Array.isArray(value)
}

export const baseCellTypes = {
  Array: ArrayCellType,
  Boolean: BooleanCellType,
  Object: ObjectCellType,
  Number: NumberCellType,
  String: StringCellType
} as const

export type BaseCellTypes = typeof baseCellTypes
export type BaseCellTypesKeys = keyof BaseCellTypes
export type BaseCellType = InstanceType<BaseCellTypes[BaseCellTypesKeys]>

export type Cell =
  (undefined | null | boolean | string | number | object)
  | Cell[]

export type Row = Record<string, Cell>
export type Column = Cell[]

export type ConfigPanelProps<Config extends Record<string, unknown>> = {
  config: Config
  onChangeConfig: (apply: (oldConfig: Config) => Config) => void
}

export type IOItem = {
  type: BaseCellType
  name: string
}

export type IO = {
  [key: string]: IOItem
}

export type SheetFunctionType = 'map' | 'reduce' | 'transform'

export type UnionToIntersection<U> =
  (U extends any ? (k: U) => void : never) extends ((k: infer I) => void)
    ? I
    : never

export type LastOf<T> =
  UnionToIntersection<T extends any ? () => T : never> extends () => (infer R)
    ? R
    : never

export type Push<T extends any[], V> = [...T, V];
export type TupleUnion<T, L = LastOf<T>, N = [T] extends [never]
  ? true
  : false> =
  true extends N ? [] : Push<TupleUnion<Exclude<T, L>>, L>
export type ObjValueTuple<T, KS extends any[] = TupleUnion<keyof T>, R extends any[] = []> =
  KS extends [infer K, ...infer KT]
    ? ObjValueTuple<T, KT, [...R, T[K & keyof T]]>
    : R

export type InferIOItemToJSType<T extends IOItem> =
  T extends { type: infer U }
    ? U extends AbstractCellType<infer V>
      ? V
      : never
    : never

export type Arg<T extends unknown[]> = T extends [infer U, ...infer V]
  ? U extends IOItem
    ? [InferIOItemToJSType<U>[], ...Arg<V>]
    : [unknown, ...Arg<V>] : []

export type Columns<T extends IO> = {
  [Key in keyof T]: InferIOItemToJSType<T[Key]>[]
}

// fixme: if type is reduce, output a cell or cell array instead of columns
export interface SheetFunction<Type extends SheetFunctionType = SheetFunctionType,
  Inputs extends IO = IO,
  Outputs extends IO = IO,
  Config extends Record<string, unknown> = Record<string, any>> {
  /**
   * UUID4
   */
  id: string
  type: Type
  name: string
  inputs: Inputs
  outputs: Outputs
  fn: (
    columns: Columns<Inputs>,
    config: Config) => Promise<Columns<Outputs>>
  defaultConfig: Config
  configPanel: FC<ConfigPanelProps<Config>> | undefined,
  description: string | undefined
}

export const createSheetFunction = <Type extends SheetFunctionType,
  Inputs extends IO,
  Outputs extends IO,
  Config extends Record<string, unknown>>
(
  id: string,
  name: string,
  type: Type,
  inputs: Inputs,
  outputs: Outputs,
  defaultConfig: Config,
  fn: SheetFunction<Type, Inputs, Outputs, Config>['fn'],
  configPanel?: SheetFunction<Type, Inputs, Outputs, Config>['configPanel'],
  description?: SheetFunction<Type, Inputs, Outputs, Config>['description']
): SheetFunction<Type, Inputs, Outputs, Config> => {
  return {
    id,
    type,
    inputs,
    outputs,
    name,
    defaultConfig,
    fn,
    configPanel,
    description
  }
}

/**
 * This is an example
 */
export const getExample = () => createSheetFunction(
  'to-lowercase',
  'To LowerCase',
  'map',
  {
    input: {
      type: new baseCellTypes.String(),
      name: 'input column'
    }
  },
  {
    output: {
      type: new baseCellTypes.String(),
      name: 'output column'
    }
  },
  { /* no config */ },
  async (columns) => {
    return {
      output: columns.input.map(item => item.toUpperCase())
    }
  },
  undefined,
  undefined
)
