import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const cacheOpts = (name, max, days) => ({
  cacheName: name,
  expiration: { maxEntries: max, maxAgeSeconds: 60 * 60 * 24 * days },
  cacheableResponse: { statuses: [0, 200] },
});

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png', 'img/*.webp'],
      manifest: {
        name: 'visitNature – nature trips from Feni',
        short_name: 'visitNature',
        description: 'Book guided nature trips across Bangladesh and beyond.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        lang: 'en',
        categories: ['travel'],
        background_color: '#F3F7F6',
        theme_color: '#0B2E3A',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [{ name: 'My bookings', url: '/my-bookings', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] }],
      },
      workbox: {
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/__\//], // keep Firebase auth handler out of the SPA fallback
        globPatterns: ['**/*.{js,css,html,svg,png,webp}'],
        runtimeCaching: [
          { urlPattern: /^https:\/\/fonts\.googleapis\.com\//, handler: 'StaleWhileRevalidate', options: cacheOpts('gfonts-css', 10, 365) },
          { urlPattern: /^https:\/\/fonts\.gstatic\.com\//, handler: 'CacheFirst', options: cacheOpts('gfonts-files', 20, 365) },
          { urlPattern: ({ request, url }) => request.destination === 'image' && url.origin !== self.location.origin, handler: 'CacheFirst', options: cacheOpts('remote-images', 80, 30) },
        ],
      },
    }),
  ],
});
