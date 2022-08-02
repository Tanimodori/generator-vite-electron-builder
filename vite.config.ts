import { defineConfig, configDefaults } from 'vitest/config';
import glob from 'glob';
import builtins from './src/app/validate/builtins';

export default defineConfig({
  resolve: {
    alias: {
      builtins: './src/app/validate/builtins.ts',
    },
  },
  build: {
    outDir: 'generator',
    emptyOutDir: true,
    cssCodeSplit: true,
    minify: false,
    lib: {
      entry: './src/app/index.ts',
      formats: ['cjs'],
    },
    rollupOptions: {
      external: ['yeoman-generator', 'yo', ...builtins()],
      input: glob.sync('src/**/*.ts'),
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
  test: {
    setupFiles: './test/setup.ts',
    exclude: [...configDefaults.exclude, './test/repo'],
  },
});
