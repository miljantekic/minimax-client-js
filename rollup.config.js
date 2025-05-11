import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import pkg from './package.json';

const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
];

export default [
  // CommonJS (for Node) build
  {
    input: 'src/index.ts',
    output: {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
    },
    external,
    plugins: [
      typescript({ 
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: 'dist',
        rootDir: 'src'
      }),
      resolve(),
      commonjs(),
    ],
  },
  // ES module (for bundlers) build
  {
    input: 'src/index.ts',
    output: {
      file: pkg.module,
      format: 'es',
      sourcemap: true,
    },
    external,
    plugins: [
      typescript({ 
        tsconfig: './tsconfig.json',
        declaration: false,
        declarationDir: undefined
      }),
      resolve(),
      commonjs(),
    ],
  },
  // Minified browser-ready build (if needed in the future)
  {
    input: 'src/index.ts',
    output: {
      name: 'MinimaxClient',
      file: pkg.module.replace('.esm.js', '.min.js'),
      format: 'umd',
      sourcemap: true,
    },
    plugins: [
      typescript({ 
        tsconfig: './tsconfig.json',
        declaration: false,
        declarationDir: undefined
      }),
      resolve(),
      commonjs(),
      terser(),
    ],
  },
];
