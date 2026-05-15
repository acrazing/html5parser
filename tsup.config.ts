import { readFileSync } from 'node:fs';
import { defineConfig, type Options } from 'tsup';

interface PackageJson {
  name: string;
  dependencies?: Record<string, string>;
}

const packageJson = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
) as PackageJson;

const id = packageJson.name.split('/').pop() ?? packageJson.name;
const globalName = id.charAt(0).toUpperCase() + id.substring(1);
const dependencies = Object.keys(packageJson.dependencies ?? {});
const outputName = 'index';

const sharedOptions = {
  entry: ['src/index.ts'],
  target: 'es2020',
  sourcemap: true,
  outDir: 'dist',
  splitting: false,
  esbuildOptions(options) {
    options.entryNames = outputName;
  },
} satisfies Options;

const outExtension =
  (extension: string): Options['outExtension'] =>
  () => ({ js: extension });

export default defineConfig([
  {
    ...sharedOptions,
    name: 'esm',
    format: 'esm',
    dts: true,
    external: dependencies,
    outExtension: outExtension('.js'),
  },
  {
    ...sharedOptions,
    name: 'cjs',
    format: 'cjs',
    external: dependencies,
    outExtension: outExtension('.cjs'),
  },
  {
    ...sharedOptions,
    name: 'browser',
    format: 'iife',
    platform: 'browser',
    globalName,
    minify: true,
    external: [],
    noExternal: dependencies,
    outExtension: outExtension('.umd.js'),
  },
]);
