import { CellType, cellTypes } from '../sheet/index.js'

const f = (...args: Parameters<typeof fetch>) => fetch(...args).
  then(response => response.json())

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

export type GetListResponse = {
  list: FunctionPreview[]
}

export function getList (url: URL): Promise<GetListResponse> {
  return f(url, {
    method: 'GET'
  })
}

export type GetParamResponse = {
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

export function getParam (url: URL): Promise<GetParamResponse> {
  return f(url, {
    method: 'GET'
  })
}

export type CallBody = {
  [x: string]: any
}

export type PostCallResponse = {
  [x: string]: any
}

export function callFunction (
  url: URL, body: CallBody
): Promise<PostCallResponse> {
  return f(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json'
    }
  })
}
