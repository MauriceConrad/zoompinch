import { defineConfig } from 'vite';
import { litScss } from 'rollup-plugin-scss-lit';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: 'src/my-element.ts',
      formats: ['es'],
    },
    rollupOptions: {
      external: /^lit/,
      plugins: [litScss({ minify: false })],
    },
  },
});
