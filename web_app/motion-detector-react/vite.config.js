import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API requests to the backend during development
      '/api': {
        target: 'https://app-dev-flutter-app.onrender.com',
        changeOrigin: true,
        secure: false,
      },
      // Proxy WebSocket requests
      '/ws': {
        target: 'wss://app-dev-flutter-app.onrender.com',
        ws: true,
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
