#!/usr/bin/env node
/**
 * npm install -g ts-node
 * npx download-github-repo --owner=TexteaInc --repo=RePublic --ref=main --auth=xxx
 */
import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { parseArgs } from 'node:util'

import { Octokit } from '@octokit/rest'

const args = process.argv.slice(2)
const { values } = parseArgs({
  args,
  options: {
    owner: {
      type: 'string'
    },
    repo: {
      type: 'string'
    },
    auth: {
      type: 'string'
    },
    ref: {
      type: 'string'
    }
  }
})

if (typeof values.repo !== 'string') {
  throw new Error('cannot find repo')
}
if (typeof values.owner !== 'string') {
  throw new Error('cannot find repo')
}

const auth = values.auth ?? process.env.GITHUB_AUTH
if (typeof auth !== 'string') {
  throw new Error('cannot find auth')
}
const owner = values.owner
const repo = values.repo
const ref = values.ref ?? 'main'

async function main () {
  const octokit = new Octokit({
    auth
  })
  const response = await octokit.request(
    'GET /repos/{owner}/{repo}/tarball/{ref}', {
      owner,
      repo,
      ref
    }
  )
  const arrayBuffer = response.data
  const outputPath = resolve(process.cwd(), 'repo.tar.gz')
  await writeFile(outputPath, Buffer.from(arrayBuffer))
  console.log(`download to ${outputPath} success.`)
}

main().then(/* do nothing */)
