import { parseArgs } from 'node:util'

import { Status } from '@grpc/grpc-js/src/constants'

import { createCloudBuild, createCloudRun } from '../google-cloud'

interface GoogleClientError extends Error {
  code: Status
  details: string
}

export type Args = {
  projectId: string
  repo: string
  owner: string
}

/**
 * @example
 * ```
 *  --projectId=textea-sheet --owner=TexteaInc --repo=RePublic
 * ```
 */
export function getArgs (): Args {
  const args = process.argv.slice(2)

  const result = parseArgs({
    args,
    options: {
      projectId: {
        type: 'string'
      },
      owner: {
        type: 'string'
      },
      repo: {
        type: 'string'
      }
    }
  })

  if (
    result.values.projectId == null ||
    result.values.repo == null ||
    result.values.owner == null
  ) {
    throw new Error('require parameters')
  }
  return result.values as Args
}

export function createApis (projectId: string) {
  return Object.assign(
    Object.create(null) as {},
    createCloudRun({
      projectId
    }),
    createCloudBuild({
      projectId
    })
  )
}

export function handleGoogleClientError (_: unknown) {
  // why google api is so shit?
  const error = _ as GoogleClientError
  if (error.code === Status.ALREADY_EXISTS) {
    console.log('target project name already exist')
  } else {
    console.error(Status[error.code])
    const internalError = new Error(Status[error.code])
    internalError.cause = error
    throw internalError
  }
}
