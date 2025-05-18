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
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from:', req.url, proxyRes.statusCode);
          });
        },
        // Add CORS headers to the proxy response
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-User-Email, X-CSRFToken',
          'Access-Control-Allow-Credentials': 'true',
        }
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
