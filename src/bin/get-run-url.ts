#!/usr/bin/env ts-node
import { createApis, getArgs } from './util'

/**
 * Pre Requirement: https://cloud.google.com/build/docs/api/reference/libraries
 *
 * ```shell
 *  NODE_DEBUG=redstone ./scripts/get-run-url.ts --projectId=textea-sheet --owner=TexteaInc --repo=RePublic
 * ```
 */

const { projectId, owner, repo } = getArgs()

const apis = createApis(projectId)

async function main () {
  await apis.getCloudRunServiceURL(owner, repo)
}
main().then(/* do nothing */)
