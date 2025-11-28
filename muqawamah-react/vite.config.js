import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(process.cwd(), 'index.html'),
        tournament: resolve(process.cwd(), 'tournament.html'),
        registration: resolve(process.cwd(), 'registration.html'),
        players: resolve(process.cwd(), 'players.html'),
        teams: resolve(process.cwd(), 'teams.html'),
        fixtures: resolve(process.cwd(), 'fixtures.html'),
        standings: resolve(process.cwd(), 'standings.html'),
        statistics: resolve(process.cwd(), 'statistics.html'),
        admin: resolve(process.cwd(), 'admin.html')
      }
    },
    cssCodeSplit: false,
    assetsDir: 'assets',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true
      }
    }
  },
  base: '/muqawamah/'
});

