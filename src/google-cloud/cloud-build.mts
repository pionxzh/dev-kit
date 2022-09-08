import { debuglog } from 'node:util'

import { CloudBuildClient } from '@google-cloud/cloudbuild'

import { createFunixBuildSteps } from './funix-build-steps.mjs'
import {
  createAuth,
  getCloudBuildTriggerName,
  getCloudRunServiceName,
  GoogleClientConfig
} from './util.mjs'

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
    createBuildTrigger: async (owner: string, repoName: string) => {
      const triggerName = getCloudBuildTriggerName(owner, repoName)
      const serviceName = getCloudRunServiceName(owner, repoName)
      // tip: let it crash if build trigger already exist
      const [trigger] = await cloudBuildClient.createBuildTrigger({
        projectId: config.projectId,
        trigger: {
          name: triggerName,
          description: 'Build And Deploy to Cloud Run managed by Redstone API',
          github: {
            owner,
            name: repoName,
            push: {
              branch: 'main'
            }
          },
          build: createFunixBuildSteps(serviceName)
        }
      })
      return trigger
    }
  } as const
  Object.freeze(apis)
  return apis
}
