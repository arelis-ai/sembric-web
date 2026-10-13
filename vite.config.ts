import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The client build emits only the small progressive-enhancement script, its CSS and fonts; every page's HTML is
// rendered ahead of time by scripts/prerender.ts from the SSR build of src/entry-server.tsx.
export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  publicDir: isSsrBuild ? false : 'public',
  build: isSsrBuild
    ? { outDir: 'dist-ssr', emptyOutDir: true, target: 'node24' }
    : {
        outDir: 'dist',
        emptyOutDir: true,
        manifest: true,
        assetsInlineLimit: 0,
        modulePreload: { polyfill: false },
        rollupOptions: { input: 'src/entry-client.ts' },
      },
}));
