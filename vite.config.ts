import { defineConfig } from 'vite';
import path from 'path';
import glob from 'glob';

export default defineConfig({
  build: {
    minify: false,
    lib: {
      entry: path.resolve(__dirname, 'src/generator/app/index.ts'),
      formats: ['cjs'],
    },
    rollupOptions: {
      external: ['yeoman-generator'],
      input: glob.sync(path.resolve(__dirname, 'src/**/*.{js,css}')),
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: (entry) => {
          const { name, facadeModuleId } = entry;
          const fileName = `${name}.js`;
          if (!facadeModuleId) {
            return fileName;
          }
          const relativeDir = path.relative(
            path.resolve(__dirname, 'src'),
            path.dirname(facadeModuleId),
          );
          return path.join(relativeDir, fileName);
        },
      },
    },
    outDir: 'dist',
  },
});
