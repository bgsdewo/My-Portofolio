import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Path relatif agar hasil build bisa dibuka dari subfolder (mis. GitHub Pages)
  base: './',
  plugins: [tailwindcss()],
  build: {
    // Three.js (scene 3D hero) dimuat terpisah & lazy, ukurannya memang besar
    chunkSizeWarningLimit: 800,
  },
});
