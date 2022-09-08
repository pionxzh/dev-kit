#!/usr/bin/env ts-node
/**
 * Pre Requirement: https://cloud.google.com/build/docs/api/reference/libraries
 *
 * ```shell
 *  NODE_DEBUG=redstone ./scripts/create-service.ts --projectId=textea-sheet --owner=TexteaInc --repo=RePublic
 * ```
 */

import { createApis, getArgs, handleGoogleClientError } from './util'

const { projectId, owner, repo } = getArgs()

const apis = createApis(projectId)

async function main () {
  await apis.createCloudRun(owner, repo).catch(handleGoogleClientError)
  await apis.createBuildTrigger(owner, repo).catch(handleGoogleClientError)
}

main().then(/* do nothing */)
