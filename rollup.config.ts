import { basename, resolve } from 'node:path'

import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import type {
  ModuleFormat,
  OutputOptions,
  RollupCache,
  RollupOptions
} from 'rollup'
import dts from 'rollup-plugin-dts'

let cache: RollupCache

const dtsOutput = new Set<[string, string]>()

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
    file: resolve(outputDir, `${baseName}.${format === 'es' ? 'm' : ''}js`),
    sourcemap: true,
    name: 'DevKit',
    format,
    banner: `/// <reference types="./${baseName}.d.ts" />`,
    globals: external.reduce((object, module) => {
      object[module] = module
      return object
    }, {})
  }))
}

const buildMatrix = (input: string, output: string): RollupOptions => {
  dtsOutput.add([input.replaceAll('.js', '.d.ts'), output])
  return {
    input,
    output: outputMatrix(output),
    cache,
    external,
    plugins: [
      commonjs({
        esmExternals: true
      }),
      nodeResolve({
        exportConditions: ['import', 'require', 'default']
      })
    ]
  }
}

const dtsMatrix = (): RollupOptions[] => {
  return [...dtsOutput.values()].flatMap(([input, output]) => ({
    input,
    cache,
    output: {
      file: resolve(outputDir, `${output}.d.ts`),
      format: 'es'
    },
    plugins: [
      dts()
    ]
  }))
}

const build: RollupOptions[] = [
  buildMatrix('./dist/out/google-cloud/index.js', 'google-cloud'),
  buildMatrix('./dist/out/python/index.js', 'python'),
  buildMatrix('./dist/out/sheet/index.js', 'sheet'),
  buildMatrix('./dist/out/theme/index.js', 'theme'),
  buildMatrix('./dist/out/utils/index.js', 'utils'),
  ...dtsMatrix()
]

export default build
