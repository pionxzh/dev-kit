import type { FC } from 'react'

export const CellTypes = {
  Array: '6f84aa0b-aa88-48e3-96f8-c19f00f60ee0',
  Boolean: '1b692f8e-6f4d-4708-bf04-e624e7101a3d',
  Json: 'e01e830e-8dd5-4c2e-a8eb-dc3945d8c001',
  Number: '21112007-716a-4c28-80f3-a058aea50a0b',
  String: '00bfb075-9d08-4ab6-ba2d-f7bcccdb09b0'
} as const

type CellTypesKeys = keyof typeof CellTypes;
export type CellType = typeof CellTypes[CellTypesKeys]

export type Cell =
  (undefined | null | boolean | string | number | object)
  | Cell[]

export type Row = Record<string, Cell>
export type Column = Cell[]

export type ConfigPanelProps<Config extends Record<string, unknown>> = {
  config: Config
  onChangeConfig: (apply: (oldConfig: Config) => Config) => void
}

export interface SheetFunction<Func extends (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any, config: Config, ...args: unknown[]) => Promise<any>,
  Config extends Record<string, unknown> = Record<string, unknown>> {
  /**
   * Unique ID
   */
  id: string
  type: 'transform' | 'summary' | 'compute' | 'predict'
  name: string
  func: Func
  defaultConfig: Config
  config?: FC<ConfigPanelProps<Config>>
}

export interface SheetTransformFunction<Config extends Record<string, unknown> = Record<string, unknown>> extends SheetFunction<(
  cells: Cell[], config: Config) => Promise<Cell[]>,
  Config> {
  type: 'transform'
}

export interface ComputeConfig {
  inputs: {
    type: CellType
    name: string
  }[]
  outputs: {
    type: CellType
    name: string
  }
  [key: string]: unknown
}

export interface SheetPredictFunction<Config extends ComputeConfig = ComputeConfig> extends SheetFunction<(
  columns: Column[], config: Config) => Promise<Column[]>,
  Config> {
  type: 'predict'
}

export interface SheetSummaryFunction<Config extends Record<string, unknown> = Record<string, unknown>> extends SheetFunction<(
  column: Column, config: Config) => Promise<Cell>,
  Config> {
  type: 'summary'
}

/**
 * read multiple columns, output multiple columns
 */
export interface SheetComputeFunction<Config extends Record<string, unknown> = Record<string, unknown>> extends SheetFunction<// todo
  (sheet: unknown, config: Config) => Promise<unknown>,
  Config> {
  type: 'compute'
}
