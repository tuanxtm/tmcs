import { lstatSync, mkdtempSync, realpathSync, renameSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import postcss from 'postcss'
import tailwindcss from '@tailwindcss/postcss'

export async function writeFrontendStyles(outputDirectory: string) {
  const entry = [
    "@import '../../src/app/(frontend)/styles.css';",
    "@source '../../src';",
    "@source './';",
    '@source inline("flex md:block");',
    '@layer base { :root { --font-jetbrains-mono: monospace; } }',
  ].join('\n')
  const result = await postcss([tailwindcss({ base: process.cwd() })]).process(entry, {
    from: path.resolve('tests/fixtures/frontend-styles.css'),
  })
  writeFileSync(path.join(outputDirectory, 'frontend.css'), result.css)
}

export function retireFrontendFixture(outputDirectory: string) {
  const resolved = realpathSync(outputDirectory)
  if (
    lstatSync(outputDirectory).isSymbolicLink() ||
    path.dirname(resolved) !== realpathSync(tmpdir()) ||
    !path.basename(resolved).startsWith('tmcs-')
  ) {
    throw new Error(`Refusing to move an unexpected fixture directory: ${outputDirectory}`)
  }
  const trash = mkdtempSync(path.join(tmpdir(), 'tmcs-fixture-trash-'))
  renameSync(resolved, path.join(trash, path.basename(resolved)))
}
