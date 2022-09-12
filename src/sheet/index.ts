import type { FC } from 'react'
import { validate as isUUID } from 'uuid'

export const typeRegistry = new Map<string, CellType>()

export interface CellType<Value extends BaseValue = any, BaseValue = any> {
  readonly id: string
  readonly displayName: string
  readonly defaultValue: Value
  readonly validate: (value: BaseValue) => value is Value

  is<ExpectedCellType extends CellType<unknown>> (t: ExpectedCellType): this is ExpectedCellType
}

export abstract class AbstractCellType<Value extends BaseValue, BaseValue = unknown> implements CellType<Value, BaseValue> {
  public readonly abstract id: string
  public readonly abstract displayName: string
  public readonly abstract defaultValue: Value

  public abstract validate: (value: BaseValue) => value is Value

  public is<ExpectedCellType extends CellType<unknown>> (t: ExpectedCellType): this is ExpectedCellType {
    return this instanceof t.constructor
  }
}

type CellTypeConstructor = typeof AbstractCellType

function isCellTypeConstructor (fn: Function): fn is CellTypeConstructor {
  return fn === AbstractCellType || fn.prototype instanceof AbstractCellType
}

export function defineCellType<Value extends BaseValue, BaseValue = unknown> (
  id: string,
  displayName: string,
  defaultValue: Value,
  validate: (value: BaseValue) => value is Value,
  extended?: CellType<BaseValue>
): CellType<Value, BaseValue> {
  if (!isUUID(id)) {
    throw new TypeError('\'id\' is not a uuid')
  } else if (typeRegistry.has(id)) {
    if (typeof window === 'undefined') {
      // Server Side Rendering
      //  early return
      return typeRegistry.get(id)!
    }
    throw new Error(`'id' ${id} already exists`)
  } else {
    let SuperCellType: CellTypeConstructor
    if (extended) {
      if (!isCellTypeConstructor(extended.constructor)) {
        throw new TypeError(
          '\'extended\' is not an instance of \'AbstractCellType\'')
      }
      SuperCellType = extended.constructor
    } else {
      SuperCellType = AbstractCellType
    }
    const cellType: CellType<Value, BaseValue> = new (class extends SuperCellType<Value, BaseValue> {
      id = id
      displayName = displayName
      defaultValue = defaultValue
      validate = validate
    })()
    typeRegistry.set(id, cellType)
    return cellType
  }
}

export const numberCellType = defineCellType<number>(
  '21112007-716a-4c28-80f3-a058aea50a0b',
  'number',
  0,
  (value): value is number => typeof value === 'number'
)

export const stringCellType = defineCellType<string>(
  '00bfb075-9d08-4ab6-ba2d-f7bcccdb09b0',
  'string',
  '',
  (value): value is string => typeof value === 'string'
)

export const objectCellType = defineCellType<Record<string, unknown>>(
  'e01e830e-8dd5-4c2e-a8eb-dc3945d8c001',
  // name in `python`
  'dict',
  {},
  (value): value is Record<string, unknown> => typeof value === 'object'
)

export const booleanCellType = defineCellType<boolean>(
  '1b692f8e-6f4d-4708-bf04-e624e7101a3d',
  'boolean',
  false,
  (value): value is boolean => typeof value === 'boolean'
)

export const arrayCellType = defineCellType<unknown[]>(
  '6f84aa0b-aa88-48e3-96f8-c19f00f60ee0',
  'array',
  [],
  (value): value is unknown[] => Array.isArray(value)
)

export const baseCellTypes = {
  array: arrayCellType,
  boolean: booleanCellType,
  object: objectCellType,
  number: numberCellType,
  string: stringCellType
} as const

export type BaseCellTypes = typeof baseCellTypes
export type BaseCellTypesKeys = keyof BaseCellTypes
export type BaseCellType = BaseCellTypes[BaseCellTypesKeys]

export type ConfigPanelProps<Config extends Record<string, unknown>> = {
  config: Config
  onChangeConfig: (apply: (oldConfig: Config) => Config) => void
}

export type IOItem<Type extends BaseCellType = BaseCellType> = {
  type: Type
  name: string
}

export type IO = {
  [key: string]: IOItem
}

export type SheetFunctionType = 'map' | 'reduce' | 'transform'

export type InferIOItemToJSType<T extends IOItem> =
  T extends { type: infer U }
    ? U extends AbstractCellType<infer V, unknown>
      ? V
      : never
    : never

export type Columns<T extends IO> = {
  [Key in keyof T]: InferIOItemToJSType<T[Key]>[]
}

export interface SheetMapFunction<Inputs extends IO = IO,
  Outputs extends IO = IO,
  Config extends Record<string, unknown> = Record<string, any>> {
  /**
   * UUID4
   */
  id: string
  type: Extract<SheetFunctionType, 'map' | 'transform'>
  name: string
  inputs: Inputs
  outputs: Outputs
  fn: (
    columns: Columns<Inputs>,
    config: Config) => Promise<Columns<Outputs>>
  defaultConfig: Config
  configPanel: FC<ConfigPanelProps<Config>> | undefined
  description: string | undefined
}

export interface SheetReduceFunction<Inputs extends IOItem = IOItem,
  Outputs extends IOItem = IOItem,
  Config extends Record<string, unknown> = Record<string, any>> {
  /**
   * UUID4
   */
  id: string
  type: Extract<SheetFunctionType, 'reduce'>
  name: string
  input: Inputs
  output: Outputs
  fn: (
    column: InferIOItemToJSType<Inputs>[],
    config: Config) => Promise<InferIOItemToJSType<Outputs>>
  defaultConfig: Config
  configPanel: FC<ConfigPanelProps<Config>> | undefined
  description: string | undefined
}

export type SheetFunction = SheetReduceFunction | SheetMapFunction

export function createSheetFunction<Inputs extends IOItem = IOItem,
  Outputs extends IOItem = IOItem,
  Config extends Record<string, unknown> = Record<string, any>> (
  id: string,
  name: string,
  type: Extract<SheetFunctionType, 'reduce'>,
  input: Inputs,
  output: Outputs,
  defaultConfig: Config,
  fn: SheetReduceFunction<Inputs, Outputs, Config>['fn'],
  configPanel?: SheetReduceFunction<Inputs, Outputs, Config>['configPanel'],
  description?: SheetReduceFunction<Inputs, Outputs, Config>['description']
): SheetReduceFunction<Inputs, Outputs, Config>
export function createSheetFunction<Inputs extends IO,
  Outputs extends IO,
  Config extends Record<string, unknown>> (
  id: string,
  name: string,
  type: Omit<SheetFunctionType, 'reduce'>,
  inputs: Inputs,
  outputs: Outputs,
  defaultConfig: Config,
  fn: SheetMapFunction<Inputs, Outputs, Config>['fn'],
  configPanel?: SheetMapFunction<Inputs, Outputs, Config>['configPanel'],
  description?: SheetMapFunction<Inputs, Outputs, Config>['description']
): SheetMapFunction<Inputs, Outputs, Config>
export function createSheetFunction
(
  id: string,
  name: string,
  type: any,
  inputs: any,
  outputs: any,
  defaultConfig: any,
  fn: any,
  configPanel?: any,
  description?: any
): any {
  return {
    id,
    type,
    [type === 'reduce' ? 'input' : 'inputs']: inputs,
    [type === 'reduce' ? 'output' : 'outputs']: outputs,
    name,
    defaultConfig,
    fn,
    configPanel,
    description
  }
}
