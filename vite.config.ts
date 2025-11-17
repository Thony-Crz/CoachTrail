import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  // Use root path for Vercel, /CoachTrail/ for GitHub Pages
  base: process.env.VERCEL ? '/' : '/CoachTrail/',
  server: {
    proxy: {
      // Proxy Polar API requests to avoid CORS issues in development
      '/api/polar': {
        target: 'https://www.polaraccesslink.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/polar/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (_proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
})
