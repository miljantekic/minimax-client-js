import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import pkg from './package.json';
import path from 'path';

const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
];

// Function to exclude test files from the build
const excludeTestFiles = () => {
  return {
    name: 'exclude-test-files',
    resolveId(source, importer) {
      // Skip if no importer (entry point)
      if (!importer) return null;
      
      // Normalize paths for cross-platform compatibility
      const normalizedSource = path.normalize(source);
      
      // Exclude test files and test utilities
      if (
        normalizedSource.includes('__tests__') || 
        normalizedSource.includes('.test.') ||
        normalizedSource.includes('.spec.')
      ) {
        return { id: 'empty-module', external: true };
      }
      return null;
    }
  };
};

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
      excludeTestFiles(),
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
      excludeTestFiles(),
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
      excludeTestFiles(),
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
