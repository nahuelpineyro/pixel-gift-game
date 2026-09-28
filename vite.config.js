import { defineConfig } from 'vite';

export default defineConfig({
  // Relative paths are required: itch.io serves the game from a nested folder,
  // and absolute paths would resolve to the wrong place.
  base: './',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
  },
  server: {
    // Needed when testing on a phone over the local network.
    host: true,
  },
});
