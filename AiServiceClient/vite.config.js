import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: true,
    allowedHosts: ['unlined-unknowing-trapped.ngrok-free.dev'],
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3007',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://127.0.0.1:3007',
        ws: true,
        changeOrigin: true,
      },
    },
  },
})
