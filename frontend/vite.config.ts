import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    extensions: ['.ts', '.js'],
  },
  esbuild: {
    include: ['**/*.ts'],
  },
  test: {
    environment: 'jsdom',
  },
});
