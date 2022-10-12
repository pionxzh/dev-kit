// region generate unique name that won't make conflict with each user
import type { Octokit } from '@octokit/rest'
import { GoogleAuth } from 'google-auth-library'
import type { ClientOptions } from 'google-gax'

export type AuthInfo = {
  type: 'service_account'
  project_id: string
  private_key: string
  private_key_id: string
  client_email: string
  client_id: string
  auth_uri: string
  token_uri: string
  auth_provider_x509_cert_url: string
  client_x509_cert_url: string
}

export const createAuth = (info: AuthInfo): GoogleAuth => {
  return new GoogleAuth({
    credentials: info
  })
}

// google cloud build images only accept a lowercase name
export const getProjectId = (
  owner: string, repoName: string
) => `${owner}-${repoName}`.toLowerCase()

export const getCloudBuildTriggerName = (
  owner: string, repoName: string) => `${owner}-${repoName}`.toLowerCase()

// google cloud run only accept a lowercase name
export const getCloudRunServiceName = (owner: string, repoName: string) =>
  `${owner}-${repoName}`.toLowerCase()
// endregion

export type GoogleClientConfig = Pick<ClientOptions, 'projectId'> & {
  auth?: AuthInfo
}

export async function getGitHubRepoZip (
  octokit: Octokit,
  owner: string,
  repo: string,
  ref: string = 'main'
): Promise<ArrayBuffer> {
  const response = await octokit.request(
    'GET /repos/{owner}/{repo}/tarball/{ref}', {
      owner,
      repo,
      ref
    }
  )
  return response.data as ArrayBuffer
}
