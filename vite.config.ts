import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { handleApiRequest } from './src/api'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'StudFix',
        short_name: 'StudFix',
        description: 'Приложение для учета учеников и занятий',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  server: {
    middleware: [
      async (req: any, res: any, next: any) => {
        if (req.url?.startsWith('/api/')) {
          try {
            const request = new Request(req.url, {
              method: req.method,
              headers: req.headers,
              body: req.method !== 'GET' ? req.body : undefined
            });

            const response = await handleApiRequest(request);
            
            res.statusCode = response.status;
            for (const [key, value] of response.headers) {
              res.setHeader(key, value);
            }
            
            const responseBody = await response.text();
            res.end(responseBody);
          } catch (error) {
            console.error('API Error:', error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Internal Server Error' }));
          }
          return;
        }
        next();
      }
    ]
  },
  build: {
    // Отключаем проверку типов при сборке
    emptyOutDir: true,
    sourcemap: false,
    chunkSizeWarningLimit: 1600,
  }
}) 