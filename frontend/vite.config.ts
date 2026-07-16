import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  resolve: {
    extensions: ['.ts', '.js'],
  },
  esbuild: {
    include: ['**/*.ts'],
  },
  plugins: [
    tailwindcss(),
  ],
  build: {
    sourcemap: true,
  },
});
