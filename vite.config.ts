import { defineConfig } from 'vite';
import path from 'path';
import glob from 'glob';
import builtins from './src/app/validate/builtins';

/**
 * replace '\\' to '/'
 */
const fixPathSep = (filepath?: string) => filepath?.replace(new RegExp('\\' + path.sep, 'g'), '/');
const srcPath = fixPathSep(path.resolve(__dirname, 'src'));

export default defineConfig({
  resolve: {
    alias: {
      builtins: path.resolve(__dirname, 'src/app/validate/builtins'),
    },
  },
  build: {
    outDir: 'generator',
    emptyOutDir: true,
    cssCodeSplit: true,
    minify: false,
    lib: {
      entry: path.resolve(__dirname, 'src/app/index.ts'),
      formats: ['cjs'],
    },
    rollupOptions: {
      external: ['yeoman-generator', 'yo', ...builtins()],
      input: glob.sync(path.resolve(__dirname, 'src/**/*.ts')),
      output: {
        preserveModules: true,
        preserveModulesRoot: srcPath,
        entryFileNames: () => `[name].js`,
      },
      plugins: [
        {
          name: 'fixPreserveModulesRoot',
          outputOptions(this, options) {
            console.log('outputOptions', options.preserveModulesRoot);
          },
          renderStart(options) {
            console.log('renderStart', options.preserveModulesRoot);
            options.preserveModulesRoot = fixPathSep(options.preserveModulesRoot);
            console.log('renderStartFixed', options.preserveModulesRoot);
          },
        },
      ],
    },
  },
});
