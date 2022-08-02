import { defineConfig } from 'vite';
import glob from 'glob';
import builtins from '../src/app/validate/builtins';

export default defineConfig({
  resolve: {
    alias: {
      builtins: './src/app/validate/builtins.ts',
    },
  },
  build: {
    outDir: './test/dist',
    emptyOutDir: true,
    cssCodeSplit: true,
    minify: false,
    lib: {
      entry: './test/index.ts',
      formats: ['cjs'],
    },
    rollupOptions: {
      external: ['yeoman-generator', 'yo', 'mocha', ...builtins()],
      input: glob.sync('test/**/*.ts'),
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
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
