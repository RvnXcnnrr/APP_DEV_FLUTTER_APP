import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API requests to the Render-deployed backend
      '/api': {
        target: 'https://app-dev-flutter-app.onrender.com',
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: 'localhost',
      },
      // Proxy WebSocket requests to the Render-deployed backend
      '/ws': {
        target: 'wss://app-dev-flutter-app.onrender.com',
        ws: true,
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
