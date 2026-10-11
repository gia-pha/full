import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => ({
  resolve: {
    extensions: ['.ts', '.js'],
  },
  esbuild: {
    include: ['**/*.ts'],
  },
  server: {
    // demo mode: same-origin /api/ calls are proxied to the pact stub
    // server, so the sid cookie + credentials:'include' work without CORS.
    ...(mode === 'demo'
      ? { proxy: { '/api': 'http://localhost:8090' } }
      : {}),
  },
  plugins: [
    tailwindcss(),
  ],
  build: {
    sourcemap: true,
  },
}));
