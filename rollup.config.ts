import { basename, resolve } from 'node:path'

import type { ModuleFormat, OutputOptions, RollupOptions } from 'rollup'

const outputDir = resolve(__dirname, 'dist')
const external = [
  'react',
  'react-dom',
  '@google-cloud/cloudbuild',
  '@google-cloud/run',
  'uuid',
  '@mui/material/styles',
  'google-auth-library',
  'node:util'
]

const outputMatrix = (
  name: string, format: ModuleFormat[] = ['es', 'umd']): OutputOptions[] => {
  const baseName = basename(name)
  return format.flatMap(format => ({
    file: resolve(outputDir,
      `${baseName}.${format === 'es' ? 'm' : ''}js`),
    sourcemap: true,
    name: 'DevKit',
    format,
    banner: `/// <reference types="./es/${baseName}.d.mts" />`,
    globals: external.reduce((object, module) => {
      object[module] = module
      return object
    }, {})
  }))
}

const entry: RollupOptions = {
  input: './dist/es/index.mjs',
  output: outputMatrix('index'),
  external
}

const build: RollupOptions[] = [
  entry
]

export default build
