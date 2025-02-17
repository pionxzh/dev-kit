import { baseCellTypes, CellType } from '../sheet'

const f = (...args: Parameters<typeof fetch>) => fetch(...args)
  .then(response => response.json())

export type BaseType = 'int' | 'str' | 'list' | 'dict'
export type PyType = BaseType | `typing.List[${BaseType}]`

export function matchType (type: PyType): CellType {
  switch (type) {
    case 'str': {
      return baseCellTypes.string
    }
    case 'int': {
      return baseCellTypes.number
    }
    case 'dict': {
      return baseCellTypes.object
    }
    case 'list': {
      return baseCellTypes.array
    }
    default: {
      if (type.startsWith('typing.List')) {
        const size = 'typing.List'.length
        return matchType(type.substr(size + 1, type.length - size - 2) as PyType)
      }
      return baseCellTypes.string
    }
  }
}

export type FunctionPreview = {
  /**
   * Unique ID that won't make conflict
   */
  id: string
  name: string
  description: string
  path: `/param/${string}`
}

export type GetListResponse = {
  list: FunctionPreview[]
}

export async function getList (
  url: URL,
  init?: RequestInit
): Promise<GetListResponse> {
  return f(url, {
    ...init,
    method: 'GET'
  })
}

export type Param = {
  type: PyType
  treat_as: 'config' | 'column' | 'cell'
  whitelist?: string[]
  example?: any[]
}

export type FunctionDetail = {
  /**
   * Unique ID that won't make conflict
   */
  id: string
  /**
   * Display Name
   */
  name: string
  // fixme: remove null
  destination: null | string
  /**
   * Params of the function
   */
  params: {
    [key: string]: {
      type: PyType
      treat_as: 'config' | 'column' | 'cell'
      whitelist?: string[]
      example?: any[]
    }
  }
  /**
   * Output data type
   */
  return_type: {
    [key: string]: PyType
  }
  /**
   * Description of this function
   */
  description: string
  /**
   * Json Schema
   *  Refs: https://json-schema.org/
   */
  schema: Record<string, any>
}

export async function getParam (
  url: URL,
  init?: RequestInit
): Promise<FunctionDetail> {
  return f(url, {
    ...init,
    method: 'GET'
  })
}

export type CallBody = {
  [x: string]: any
}

export type PostCallResponseSuccess = {
  // we cannot find a type that describe different responses
  [key: string]: any
}

export type PostCallResponseError = {
  'error_type': 'wrapper' | 'function'
  'error_body': string
}

export type PostCallResponse = PostCallResponseSuccess | PostCallResponseError

export async function callFunction (
  url: URL, body: CallBody, init?: RequestInit
): Promise<PostCallResponse> {
  return f(url, {
    ...init,
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      ...init?.headers,
      'Content-Type': 'application/json'
    }
  })
}
