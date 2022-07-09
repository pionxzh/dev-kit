import { CellType, cellTypes } from '../sheet'

export type BaseType = 'int' | 'str' | 'float' | 'list' | 'dict' | 'tuple'

export function matchType (type: BaseType): CellType {
  switch (type) {
    case 'str': {
      return cellTypes.String
    }
    case 'int': {
      return cellTypes.Number
    }
    case 'list': {
      return cellTypes.Array
    }
    default: {
      return cellTypes.String
    }
  }
}

export type FunctionPreview = {
  name: string
  path: `/param/${string}`
}

export type ListPostResponse = {
  list: FunctionPreview[]
}

export type ParamResponse = {
  decorated_params: {
    [key: string]: {
      type: 'int' | 'str'
      treat_as: 'config' | 'column' | 'cell'
      whitelist?: string[]
      example?: any[]
    }
  }
  output_type: {
    [key: string]: 'int' | 'str'
  }
  path: `/call/${string}`
}

export type CallBody = {
  [x: string]: any
}
