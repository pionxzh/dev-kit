import { basename, resolve } from 'node:path'

import ts from '@rollup/plugin-sucrase'
import type { ModuleFormat, OutputOptions, RollupOptions } from 'rollup'

const outputDir = resolve(__dirname, 'dist')

const outputMatrix = (
  name: string, format: ModuleFormat[] = ['es', 'umd']): OutputOptions[] => {
  const baseName = basename(name)
  return format.flatMap(format => ({
    file: resolve(outputDir,
      `${baseName}.${format === 'es' ? 'm' : ''}js`),
    sourcemap: true,
    name: 'DevKit',
    format,
    banner: `/// <reference types="./${baseName}.d.ts" />`
  }))
}

const base = {
  input: './dist/es/index.mjs',
  output: outputMatrix('index'),
  plugins: [ts({ transforms: ['typescript'] })]
}

const build: RollupOptions[] = [
  base
]

export default build
