import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    // Dev server middleware to handle tournament URLs
    {
      name: 'tournament-redirects',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // Redirect /muqawamah/2026/open-age/ to tournament.html
          if (req.url?.match(/^\/muqawamah\/2026\/(open-age|u17)\/?$/)) {
            req.url = '/muqawamah/tournament.html';
          }
          next();
        });
      }
    }
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(process.cwd(), 'index.html'),
        tournament: resolve(process.cwd(), 'tournament.html'),
        registration: resolve(process.cwd(), 'private-reg.html'),
        players: resolve(process.cwd(), 'players.html'),
        teams: resolve(process.cwd(), 'teams.html'),
        fixtures: resolve(process.cwd(), 'fixtures.html'),
        standings: resolve(process.cwd(), 'standings.html'),
        statistics: resolve(process.cwd(), 'statistics.html'),
        admin: resolve(process.cwd(), 'admin.html')
      },
      output: {
        manualChunks: {
          'supabase-client': ['@supabase/supabase-js']
        }
      }
    },
    cssCodeSplit: false,
    assetsDir: 'assets',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true
      }
    },
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    }
  },
  optimizeDeps: {
    include: ['@supabase/supabase-js']
  },
  base: '/muqawamah/'
});

