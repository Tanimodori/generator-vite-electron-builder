import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    minify: false,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'GeneratorViteElectronBuilder',
      formats: ['cjs'],
      fileName: 'generator/app/index',
    },
    rollupOptions: {
      external: ['yeoman-generator'],
    },
    outDir: 'dist',
  },
});
