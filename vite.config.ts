import { defineConfig } from 'vite';
import path from 'path';
import glob from 'glob';

export default defineConfig({
  resolve: {
    alias: {
      builtins: path.resolve(__dirname, 'generator/app/builtins'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    cssCodeSplit: true,
    minify: false,
    lib: {
      entry: path.resolve(__dirname, 'generator/app/index.ts'),
      formats: ['cjs'],
    },
    rollupOptions: {
      external: ['yeoman-generator', 'yo', 'fs'],
      input: glob.sync(path.resolve(__dirname, 'generator/**/*.ts')),
      output: {
        preserveModules: true,
        preserveModulesRoot: path.resolve(__dirname),
        entryFileNames: ({ name }) => `${name}.js`,
      },
    },
  },
});
