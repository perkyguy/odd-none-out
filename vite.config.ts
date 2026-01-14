import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
const repoName = 'odd-none-out'
const isGithubPages = process.env.GITHUB_PAGES === 'true'

export default defineConfig({
  base: isGithubPages ? `/${repoName}/` : '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg',
        'apple-touch-icon.png',
        'pwa-192.png',
        'pwa-512.png',
      ],
      manifest: {
        name: 'Odd none out',
        short_name: 'Odd none out',
        display: 'standalone',
        background_color: '#f7f2e8',
        theme_color: '#2f2a26',
        start_url: '.',
        scope: '.',
        icons: [
          {
            src: 'pwa-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        mode: 'development',
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.endsWith('/puzzles.json'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'puzzles',
              expiration: {
                maxEntries: 1,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
            },
          },
        ],
      },
    }),
  ],
})
