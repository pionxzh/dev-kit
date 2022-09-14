/**
 * Documents:
 *  - Schema: https://cloud.google.com/build/docs/build-config-file-schema
 *  - Substitution variables: https://cloud.google.com/build/docs/configuring-builds/substitute-variable-values
 */
import type { google } from '@google-cloud/cloudbuild/build/protos/protos'

// todo: put these into `Substitution variables`
// Refs: https://github.com/TexteaInc/PyDataFront
const funixEntryPoint = 'python3 -m pydatafront main'
const deployRegion = 'us-central1' // iowa
const gcrHostname = 'us.gcr.io'
const platform = 'managed'

export const createFunixBuildSteps = (
  cloudRunServiceName: string,
  _config?: {/* todo: support multi regions */ }): google.devtools.cloudbuild.v1.IBuild => {
  const labels = [
    'managed-by-redstone-deploy',
    'commit-sha=$COMMIT_SHA',
    'gcb-build-id=$BUILD_ID'
  ].join(',')
  const dockerImageUrl = `${gcrHostname}/github.com/$PROJECT_ID/$REPO_NAME/${cloudRunServiceName}:$COMMIT_SHA`
  return {
    tags: [
      'redstone-auto-deploy',
      cloudRunServiceName
    ],
    images: [
      // push to Google Container Registry
      dockerImageUrl
    ],
    steps: [
      // todo(himself65): check whether user already have `requirements.txt` before step 1?
      // step 1: build Funix
      {
        name: 'gcr.io/k8s-skaffold/pack',
        id: 'build-pack',
        entrypoint: 'pack',
        env: [
          `GOOGLE_ENTRYPOINT=${funixEntryPoint}`
        ],
        args: [
          'build',
          dockerImageUrl,
          '--builder=gcr.io/buildpacks/builder:v1',
          '--network=cloudbuild',
          '--path=.',
          '--env=GOOGLE_ENTRYPOINT'
        ]
      },
      // step 2: push to Google Container Registry
      //  Does this conflict with 'build.images'?
      {
        name: 'gcr.io/cloud-builders/docker',
        args: [
          'push',
          dockerImageUrl
        ]
      },
      // step 3: push to Google Cloud Run by service name
      {
        name: 'gcr.io/google.com/cloudsdktool/cloud-sdk:slim',
        id: 'deploy',
        entrypoint: 'gcloud',
        args: [
          'run',
          'services',
          'update',
          cloudRunServiceName,
          `--platform=${platform}`,
          `--image=${dockerImageUrl}`,
          `--labels=${labels}`,
          `--region=${deployRegion}`
        ]
      }
    ]
  }
}
