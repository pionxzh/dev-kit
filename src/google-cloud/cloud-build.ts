import { debuglog } from 'node:util'

import { CloudBuildClient } from '@google-cloud/cloudbuild'

import {
  createAuth,
  GoogleClientConfig
} from './util.js'

const logger = debuglog('textea-dev-kit')

export interface CloudBuildConfig extends GoogleClientConfig {}

export function createCloudBuild (config: CloudBuildConfig) {
  const cloudBuildClient = new CloudBuildClient({
    projectId: config.projectId,
    auth: config.auth ? createAuth(config.auth) : undefined
  })
  logger('create cloud build client success.')
  logger('project id: %s', config.projectId)

  const apis = {
    _client: cloudBuildClient
  } as const
  Object.freeze(apis)
  return apis
}
