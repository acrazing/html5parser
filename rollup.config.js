/*
 * @since 2020-11-03 13:16:07
 * @author acrazing <joking.young@gmail.com>
 */

import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import sourceMaps from 'rollup-plugin-sourcemaps';
import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';

const packageJson = require('./package.json');

const deps = Object.keys(packageJson.dependencies).concat(Object.keys(packageJson.devDependencies));

const id = packageJson.name.split('/').pop();

const options = (format, index = 'index') => ({
  input: `src/${index}.ts`,
  output: {
    file: `dist/${id}${index === 'index' ? '' : '-' + index}.${format}.js`,
    format,
    sourcemap: true,
    name: id.charAt(0).toUpperCase() + id.substring(1),
    plugins: format === 'umd' ? [terser({ format: { comments: false } })] : [],
  },
  external: format === 'umd' ? [] : deps,
  plugins: [
    typescript({
      tsconfigOverride: {
        compilerOptions: { module: 'esnext' },
        exclude: ['src/**/*.spec.ts', 'src/**/*.spec.tsx'],
      },
    }),
    commonjs(),
    resolve({ preferBuiltins: true }),
    sourceMaps(),
  ],
});

export default [options('cjs'), options('es'), options('umd')];
