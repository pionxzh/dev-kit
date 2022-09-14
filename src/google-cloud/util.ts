// region generate unique name that won't make conflict with each user
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

export const createAuth = (info: AuthInfo) => {
  return new GoogleAuth({
    credentials: info
  })
}

export const getCloudBuildTriggerName = (
  owner: string, repoName: string) => `${owner}-${repoName}`.toLowerCase()

// google cloud run only accept a lowercase name
export const getCloudRunServiceName = (owner: string, repoName: string) =>
  `${owner}-${repoName}`.toLowerCase()
// endregion

export type GoogleClientConfig = Pick<ClientOptions, 'projectId'> & {
  auth?: AuthInfo
}
