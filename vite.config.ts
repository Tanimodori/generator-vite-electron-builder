import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    cssCodeSplit: true,
    minify: false,
    lib: {
      entry: path.resolve(__dirname, 'src/generator/app/index.ts'),
      formats: ['cjs'],
    },
    rollupOptions: {
      external: ['yeoman-generator'],
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
  },
});
