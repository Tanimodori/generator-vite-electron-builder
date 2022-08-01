import { defineConfig } from 'vite';
import path from 'path';
import glob from 'glob';
import builtins from './src/app/validate/builtins';

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
        preserveModulesRoot: path.resolve(__dirname, 'src'),
        entryFileNames: () => `[name].js`,
      },
      plugins: [
        /**
         * See https://github.com/rollup/rollup/issues/4496
         */
        {
          name: 'fixPreserveModulesRoot',
          renderStart(options) {
            options.preserveModulesRoot = options.preserveModulesRoot?.replace(
              new RegExp(/\\/, 'g'),
              '/',
            );
          },
        },
      ],
    },
  },
});
