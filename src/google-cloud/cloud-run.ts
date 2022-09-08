import { debuglog } from 'node:util'

import { v2 } from '@google-cloud/run'

import type { CloudBuildConfig } from './cloud-build.js'
import { createAuth, getCloudRunServiceName } from './util.js'

const logger = debuglog('textea-dev-kit')

export function createCloudRun (config: CloudBuildConfig) {
  const cloudRunClient = new v2.ServicesClient({
    projectId: config.projectId,
    auth: config.auth ? createAuth(config.auth) : undefined
  })
  logger('create cloud run client success')
  const apis = {
    getCloudRunService: async (owner: string, repoName: string) => {
      const serviceName = getCloudRunServiceName(owner, repoName)
      const name = `projects/${config.projectId}/locations/us-central1/services/${serviceName}`
      const [detail] = await cloudRunClient.getService({
        name
      })
      if (detail !== null) {
        logger('get service success')
      }
      return detail
    },
    getCloudRunServiceURL: async (owner: string, repoName: string) => {
      const { uri } = await apis.getCloudRunService(owner, repoName)
      logger('get service url: %s', uri)
      return uri
    },
    createCloudRun: async (owner: string, repoName: string) => {
      const serviceName = getCloudRunServiceName(owner, repoName)
      // tip: let it crash if build trigger already exist
      await cloudRunClient.createService({
        parent: `projects/${config.projectId}/locations/us-central1`,
        serviceId: serviceName,
        service: {
          description: 'Created by redstone',
          template: {
            containers: [
              {
                // use hello world image in the first run
                image: 'us-docker.pkg.dev/cloudrun/container/hello:latest'
              }
            ],
            maxInstanceRequestConcurrency: 100,
            timeout: {
              seconds: 10
            },
            scaling: {
              minInstanceCount: 1,
              maxInstanceCount: 5
            }
          }
        }
      })
    }
  } as const
  Object.freeze(apis)
  return apis
}
