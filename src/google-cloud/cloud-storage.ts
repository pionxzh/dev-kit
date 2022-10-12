import { Storage } from '@google-cloud/storage'
import { Octokit } from '@octokit/rest'
import { Buffer } from 'buffer'

import type { GoogleClientConfig } from './util'
import { createAuth, getGitHubRepoZip } from './util'

export * from './util'

export interface CloudStorageConfig extends GoogleClientConfig {}

export function createCloudStorage (config: CloudStorageConfig) {
  const storage = new Storage({
    projectId: config.projectId,
    // fixme: ignore the error
    authClient: (config.auth ? createAuth(config.auth) : undefined) as any
  })

  return {
    saveBuffer: async (
      userName: string,
      fileName: string,
      arrayBuffer: ArrayBuffer
    ) => {
      const bucket = storage.bucket(userName)
      const file = bucket.file(fileName)
      await file.save(Buffer.from(arrayBuffer))
    },
    downloadGitHubRepoZip: async (config: {
      auth: string
      owner: string
      repo: string
      branch?: string
    }) => {
      const octokit = new Octokit({
        auth: config.auth
      })
      return await getGitHubRepoZip(
        octokit,
        config.owner,
        config.repo,
        config.branch
      )
    }
  }
}
