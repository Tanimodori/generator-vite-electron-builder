import { defineConfig, configDefaults } from 'vitest/config';
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
      external: [
        'yeoman-generator',
        'yo',
        '@typescript-eslint/typescript-estree',
        'jsonc-parser',
        'validate-npm-package-name',
        ...builtins(),
      ],
      output: {
        exports: 'named',
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
    exclude: [...configDefaults.exclude, './test/repo/**'],
  },
});
