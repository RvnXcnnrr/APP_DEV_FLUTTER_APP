import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],

    // Base path for assets
    base: '/',

    // Build configuration
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
      sourcemap: mode === 'development',
      // Ensure proper MIME types
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
          },
        },
      },
    },

    // Resolve aliases
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },

    // Development server configuration
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
  }
})
